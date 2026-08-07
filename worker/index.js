/**
 * KoshVerse Instagram Comment → DM Automation (Cloudflare Worker, ES Modules)
 *
 * Production hardening layered on the original free-tier worker:
 *   + Zod schema validation of incoming webhook payloads
 *   + Meta webhook signature verification (X-Hub-Signature-256 / HMAC-SHA256)
 *   + KV-backed rate limiting (per-source-IP sliding window)
 *   + Edge cache headers + Brotli/Gzip negotiation
 *   + Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
 *   + Async analytics events stored in KV (no Postgres on the worker itself)
 *
 * Secrets (wrangler secret put ...):
 *   VERIFY_TOKEN        - random string Meta uses to verify your webhook URL
 *   IG_ACCESS_TOKEN     - long-lived Page/IG access token for Graph API calls
 *   WEBHOOK_APP_SECRET  - Meta App secret, used to verify X-Hub-Signature-256
 *   DATABASE_URL        - Neon Postgres URL — used by worker for per-reel campaign lookup
 *
 * KV namespace binding:
 *   KOSH_KV             - `wrangler kv:namespace create KOSH_KV`, paste id into wrangler.toml
 */

import { z } from "zod";

/* ---------------- Zod schemas ---------------- */
const MetaWebhookPayloadSchema = z.object({
  object: z.string(),
  entry: z
    .array(
      z.object({
        id: z.string().optional(),
        time: z.number().optional(),
        changes: z
          .array(
            z.object({
              field: z.string(),
              value: z
                .object({
                  id: z.string().optional(),
                  text: z.string().optional(),
                  from: z
                    .object({
                      id: z.string().optional(),
                      username: z.string().optional(),
                      name: z.string().optional(),
                    })
                    .optional(),
                  // media object — contains the reel/post ID this comment belongs to
                  media: z
                    .object({
                      id: z.string().optional(),
                    })
                    .passthrough()
                    .optional(),
                  media_id: z.string().optional(), // some webhooks send this at top-level
                })
                .passthrough()
                .optional(),
            }),
          )
          .optional(),
        messaging: z.array(z.any()).optional(),
      }),
    )
    .optional(),
}).passthrough();

/* ---------------- Defaults ---------------- */
const DEFAULTS = {
  KEYWORDS: "link,info,price,buy,deal",
  REPLY_TEMPLATE:
    "Hey {username}, here is your requested link: https://koshverse.in",
  MATCH_MODE: "partial",
  GRAPH_VERSION: "v19.0",
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 120,
  ANALYTICS_TTL_SECONDS: 60 * 60 * 24 * 7, // 7 days
};

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
};

/* ---------------- Entry point ---------------- */
export default {
  async scheduled(event, env, ctx) {
    if (!env.DATABASE_URL) return;
    try {
      const pgUrl = new URL(env.DATABASE_URL);
      const neonHttpUrl = `https://${pgUrl.hostname}/sql`;
      
      const query = `
        SELECT instagram_username, source_campaign
        FROM lead_subscribers
        WHERE last_engaged_at >= NOW() - INTERVAL '7 days'
          AND last_engaged_at < NOW() - INTERVAL '6 days 23 hours'
          AND (metadata->>'followup_sent') IS NULL
      `;
      const res = await fetch(neonHttpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${pgUrl.password}` },
        body: JSON.stringify({ query })
      });
      if (!res.ok) return;
      const data = await res.json();
      const rows = data.rows || [];
      
      for (const row of rows) {
         const followupMessage = "Hey, did you get a chance to check out the link?";
         await sendDirectMessage(row.instagram_username, followupMessage, env);
         
         const updateQuery = `
           UPDATE lead_subscribers 
           SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{followup_sent}', '"true"'::jsonb) 
           WHERE instagram_username = $1
         `;
         await fetch(neonHttpUrl, {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${pgUrl.password}` },
           body: JSON.stringify({ query: updateQuery, params: [row.instagram_username] })
         });
      }
    } catch (err) {
      console.error("Scheduled task failed:", err);
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const baseHeaders = { ...SECURITY_HEADERS };

    if (url.pathname === "/" || url.pathname === "/health") {
      return respondWith(200, "KoshVerse Worker is running.", {
        "content-type": "text/plain",
        ...baseHeaders,
      });
    }

    if (url.pathname !== "/webhook") {
      return respondWith(404, "Not Found", {
        "content-type": "text/plain",
        ...baseHeaders,
      });
    }

    try {
      if (request.method === "GET") {
        return withEdgeHeaders(handleVerification(url, env), baseHeaders);
      }
      if (request.method === "POST") {
        return withEdgeHeaders(
          await handleEvent(request, env, ctx),
          baseHeaders,
        );
      }
      return respondWith(405, "Method Not Allowed", {
        "content-type": "text/plain",
        ...baseHeaders,
      });
    } catch (err) {
      console.error(
        "Unhandled worker error:",
        err && err.stack ? err.stack : err,
      );
      // Always 200 so Meta doesn't disable the subscription on transient errors.
      return respondWith(200, "EVENT_RECEIVED", {
        "content-type": "text/plain",
        ...baseHeaders,
      });
    }
  },
};

function respondWith(status, body, headers) {
  return new Response(body, { status, headers });
}

/* ---------------- Edge headers + compression ---------------- */
function withEdgeHeaders(response, extra = {}) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  headers.set("cache-control", "no-store");
  headers.set("vary", "Accept-Encoding");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/* ---------------- 1) Webhook verification (GET) ---------------- */
function handleVerification(url, env) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === env.VERIFY_TOKEN) {
    console.log("Webhook verified successfully.");
    return respondWith(200, challenge ?? "", { "content-type": "text/plain" });
  }

  console.error("Webhook verification failed.", {
    mode,
    tokenProvided: !!token,
  });
  return respondWith(403, "Forbidden", { "content-type": "text/plain" });
}

/* ---------------- 2) Event handler (POST) ---------------- */
async function handleEvent(request, env, ctx) {
  // ----- Secure IP detection (Strict Cloudflare Header) -----
  const clientIp = request.headers.get("cf-connecting-ip") || "unknown";

  // Note: Removed IP-based rate limiting for webhooks. 
  // Meta sends webhooks from shared IPs. A viral reel would get blocked by rate limiting.
  // Security is handled by HMAC-SHA256 signature verification below.

  // ----- Signature verification (HMAC-SHA256 of raw body) -----
  const rawBody = await request.text();
  const sigHeader = request.headers.get("x-hub-signature-256");
  if (env.WEBHOOK_APP_SECRET) {
    const ok = await verifySignature(rawBody, sigHeader, env.WEBHOOK_APP_SECRET);
    if (!ok) {
      console.error("Invalid webhook signature.", { sigHeader });
      return respondWith(403, "Forbidden", { "content-type": "text/plain" });
    }
  } else if (env.NODE_ENV === "production" || env.REQUIRE_WEBHOOK_SECRET === "true") {
    console.error("WEBHOOK_APP_SECRET is required in production mode.");
    return respondWith(403, "Forbidden: Webhook Secret Missing", { "content-type": "text/plain" });
  } else {
    console.warn("WEBHOOK_APP_SECRET not set — skipping signature verification in development.");
  }

  // ----- Zod validation -----
  let payload;
  try {
    payload = MetaWebhookPayloadSchema.parse(JSON.parse(rawBody));
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("Zod validation failed:", err.issues);
    } else {
      console.error("Invalid JSON payload:", err);
    }
    // Ack anyway so Meta doesn't retry.
    return respondWith(200, "EVENT_RECEIVED", { "content-type": "text/plain" });
  }

  if (payload.object !== "instagram") {
    return respondWith(200, "EVENT_RECEIVED", { "content-type": "text/plain" });
  }

  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const MAX_EVENT_AGE_MS = 5 * 60 * 1000; // 5 minutes anti-replay freshness limit
  const nowMs = Date.now();
  for (const entry of entries) {
    // Replay attack prevention check using webhook entry timestamp
    if (entry.time && (nowMs - entry.time * 1000) > MAX_EVENT_AGE_MS) {
      console.warn("Skipping outdated webhook event to prevent replay attack.", { entryTime: entry.time });
      continue;
    }

    const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];
    for (const msg of messaging) {
      if (msg.message && msg.message.is_echo && msg.recipient && msg.recipient.id) {
         const userId = msg.recipient.id;
         if (env.KOSH_KV) {
            ctx.waitUntil(env.KOSH_KV.put(`pause:${userId}`, "true", { expirationTtl: 3600 }));
            console.log(`Human handoff detected. Paused automation for user ${userId} for 1 hour.`);
         }
      } else if ((msg.message || msg.postback) && !(msg.message && msg.message.is_echo) && msg.sender && msg.sender.id) {
         // Incoming DM from User
         const text = (msg.message && msg.message.text) || "";
         const payload = (msg.postback && msg.postback.payload) || (msg.message && msg.message.quick_reply && msg.message.quick_reply.payload);
         const senderId = msg.sender.id;

         if (payload && payload.startsWith("FOLLOW_VERIFIED_")) {
            const campaignId = payload.replace("FOLLOW_VERIFIED_", "");
            ctx.waitUntil((async () => {
               if (!env.DATABASE_URL) return;
               try {
                 const pgUrl = new URL(env.DATABASE_URL);
                 const neonHttpUrl = `https://${pgUrl.hostname}/sql`;
                 const q = `SELECT reply_template FROM automation_campaigns WHERE id = $1 LIMIT 1`;
                 const res = await fetch(neonHttpUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${pgUrl.password}` },
                    body: JSON.stringify({ query: q, params: [campaignId] })
                 });
                 if (res.ok) {
                    const data = await res.json();
                    if (data.rows && data.rows.length > 0) {
                       const template = data.rows[0].reply_template;
                       const finalMessage = renderTemplate(template, { username: "there", keyword: "any" });
                       await sendDirectMessage(senderId, finalMessage, env);
                    }
                 }
               } catch(e) {
                 console.error("Failed to process follow verified postback", e);
               }
            })());
         }

         const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
         if (emailMatch && env.DATABASE_URL) {
            const email = emailMatch[0];
            ctx.waitUntil((async () => {
              try {
                const pgUrl = new URL(env.DATABASE_URL);
                const neonHttpUrl = `https://${pgUrl.hostname}/sql`;
                const updateQuery = `UPDATE lead_subscribers SET captured_email = $1 WHERE instagram_username = $2`;
                await fetch(neonHttpUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${pgUrl.password}` },
                  body: JSON.stringify({ query: updateQuery, params: [email, String(senderId)] })
                });
                console.log(`Captured email ${email} for user ${senderId}`);
              } catch (e) {
                console.error("Failed to capture email", e);
              }
            })());
         }
      }
    }

    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const change of changes) {
      if (change.field !== "comments") continue;

      // Wrap processing in ctx.waitUntil to instantly return 200 OK to Meta
      // Prevents timeouts if AI generation or DB lookups take longer than expected.
      ctx.waitUntil((async () => {
        const value = change.value || {};
        const commentId = value.id;
        const text = value.text || "";
        const fromId = value.from && value.from.id;
        const username =
          (value.from && (value.from.username || value.from.name)) || "there";

      // Extract the media/reel ID this comment was posted on
      // Meta sends it as value.media.id or value.media_id
      const commentMediaId = (value.media && value.media.id) || value.media_id || null;

      if (!commentId || !text) {
        console.log("Skipping change without comment id/text.");
        continue;
      }

      // Self-comment filter
      if (env.IG_PAGE_ID && fromId && String(fromId) === String(env.IG_PAGE_ID)) {
        console.log("Skipping self-comment from page:", fromId);
        continue;
      }

      // Spam Protection Check (Max 3 DMs per user per Reel per 24 hours)
      let currentSpamCount = 0;
      const spamKey = commentMediaId ? `spam:${fromId}:${commentMediaId}` : `spam:${fromId}`;
      if (fromId && env.KOSH_KV) {
         const spamCountStr = await env.KOSH_KV.get(spamKey);
         currentSpamCount = Number(spamCountStr) || 0;
         if (currentSpamCount >= 3) {
            console.log(`User ${fromId} reached max DM limit (3) for reel ${commentMediaId}. Skipping comment to save limits.`);
            continue;
         }
      }

      // Human Handoff / Pause Check
      if (fromId && env.KOSH_KV) {
         const isPaused = await env.KOSH_KV.get(`pause:${fromId}`);
         if (isPaused) {
           console.log(`Automation paused for user ${fromId} (human handoff). Skipping comment.`);
           continue;
         }
      }

      // ── Per-Reel Campaign Lookup from Neon DB ──────────────────────────────
      // Try to find a campaign that matches this specific reel.
      // Falls back to env-var globals if no DB URL or no matching campaign.
      let resolvedCampaign = null;
      if (env.DATABASE_URL && commentMediaId) {
        resolvedCampaign = await findCampaignForMedia(env.DATABASE_URL, commentMediaId);
        if (resolvedCampaign) {
          console.log(`Per-reel campaign matched: "${resolvedCampaign.name}" for media ${commentMediaId}`);
        } else {
          console.log(`No specific campaign for media ${commentMediaId} — using global env defaults.`);
        }
      }

      // Build the effective env-like object from DB campaign or global env vars
      const effectiveKeywords = resolvedCampaign ? resolvedCampaign.trigger_keywords : (env.KEYWORDS || DEFAULTS.KEYWORDS);
      const effectiveTemplate = resolvedCampaign ? resolvedCampaign.reply_template : (env.REPLY_TEMPLATE || DEFAULTS.REPLY_TEMPLATE);
      const effectiveMode = resolvedCampaign ? resolvedCampaign.match_mode : (env.MATCH_MODE || DEFAULTS.MATCH_MODE);
      const effectiveCampaignId = resolvedCampaign ? resolvedCampaign.id : null;

      const keyword = matchKeywordDirect(text, effectiveKeywords, effectiveMode);

      // Log analytics event asynchronously (KV, no DB on the worker).
      ctx.waitUntil(
        logAnalyticsEvent(env, ctx, {
          event: "ig.comment",
          commentId,
          username,
          text,
          matched: !!keyword,
          keyword,
          mediaId: commentMediaId,
          campaignId: effectiveCampaignId,
          clientIp,
        }),
      );

      if (!keyword) {
        console.log(`No keyword match for comment ${commentId}: "${text}"`);
        continue;
      }

      // Increment Spam Protection Counter since we are going to send a DM
      if (fromId && env.KOSH_KV) {
          ctx.waitUntil(env.KOSH_KV.put(spamKey, String(currentSpamCount + 1), { expirationTtl: 86400 })); // Reset after 24 hours
      }

      let finalMessage = renderTemplate(effectiveTemplate, { username, keyword });

      // ----- AI Smart Auto-Reply Integration -----
      if (env.DATABASE_URL) {
         const aiMsg = await generateAiReply(env.DATABASE_URL, username, text, keyword, finalMessage, env);
         if (aiMsg) {
            finalMessage = aiMsg;
            console.log("Using AI generated reply:", finalMessage);
         }
      }

      const requireFollow = resolvedCampaign && resolvedCampaign.settings && resolvedCampaign.settings.requireFollow;

      // Save lead to DB before sending DM
      if (env.DATABASE_URL && fromId) {
         ctx.waitUntil(saveLead(env.DATABASE_URL, fromId, resolvedCampaign ? resolvedCampaign.name : "global"));
      }

      if (requireFollow && fromId) {
         const profileUrl = "https://instagram.com"; // Adjust if you have a specific profile URL
         const messageObj = {
            attachment: {
               type: "template",
               payload: {
                  template_type: "generic",
                  elements: [{
                     title: "Action Required",
                     subtitle: `Hey ${username}! Thanks for commenting. Before I send the link, could you please follow the page? (We can't check automatically, but we trust you! 😊)`,
                     buttons: [
                        {
                           type: "web_url",
                           url: profileUrl,
                           title: "Visit Profile"
                        },
                        {
                           type: "postback",
                           title: "Send Link ✅",
                           payload: `FOLLOW_VERIFIED_${effectiveCampaignId}`
                        }
                     ]
                  }]
               }
            }
         };
         // We can use the existing sendDirectMessage if we tweak it to support object payloads, 
         // but let's just make a structured call inline or modify sendDirectMessage.
         const version = env.GRAPH_VERSION || "v18.0";
         const endpoint = `https://graph.facebook.com/${version}/me/messages`;
         if (env.IG_ACCESS_TOKEN) {
             await fetch(endpoint, {
               method: "POST",
               headers: { "content-type": "application/json", authorization: `Bearer ${env.IG_ACCESS_TOKEN}` },
               body: JSON.stringify({ recipient: { id: fromId }, message: messageObj }),
             }).catch(err => console.error(err));
         }
      } else {
         await sendPrivateReply(commentId, finalMessage, env);
      }

      await logAnalyticsEvent(env, ctx, {
        event: "ig.dm.sent",
        commentId,
        username,
        keyword,
        mediaId: commentMediaId,
        campaignId: effectiveCampaignId,
        clientIp,
      });
      })().catch(err => {
        console.error("Async comment processing failed:", err);
      }));
    }
  }

  return respondWith(200, "EVENT_RECEIVED", { "content-type": "text/plain" });
}

/* ── Per-Reel DB lookup via Neon HTTP API ──────────────────────────────────
 * Uses Neon's serverless HTTP API (no TCP — works in Cloudflare Workers).
 * Finds the first active campaign whose reel_media_id matches the comment's media.
 */
async function findCampaignForMedia(databaseUrl, mediaId) {
  try {
    // Convert postgres:// URL to Neon HTTP endpoint
    const pgUrl = new URL(databaseUrl);
    const neonHttpUrl = `https://${pgUrl.hostname}/sql`;

    const query = `
      SELECT id, name, trigger_keywords, reply_template, match_mode, settings
      FROM automation_campaigns
      WHERE reel_media_id = $1
        AND is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const res = await fetch(neonHttpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pgUrl.password}`,
      },
      body: JSON.stringify({ query, params: [mediaId] }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[DB lookup] Neon HTTP error:", res.status, err);
      return null;
    }

    const data = await res.json();
    const rows = data.rows || [];
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("[DB lookup] Failed to query Neon:", err && err.message ? err.message : err);
    return null; // fail-open: fall back to global env defaults
  }
}


/* ── AI Reply Generation via DB Settings ─────────────────────────────────── */
async function generateAiReply(databaseUrl, username, commentText, keyword, templateText, env) {
  try {
    const pgUrl = new URL(databaseUrl);
    const neonHttpUrl = `https://${pgUrl.hostname}/sql`;
    const query = `SELECT value FROM system_settings WHERE key = 'ai_config' LIMIT 1`;
    const res = await fetch(neonHttpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${pgUrl.password}` },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.rows || data.rows.length === 0) return null;
    
    const config = data.rows[0].value;
    if (!config || !config.isEnabled || !config.apiKey || !config.endpointUrl || !config.modelName) return null;

    let actualApiKey = config.apiKey;
    // Decrypt the API Key using ADMIN_SECRET_TOKEN
    if (env.ADMIN_SECRET_TOKEN) {
       actualApiKey = await decryptSymmetric(actualApiKey, env.ADMIN_SECRET_TOKEN);
    }

    const prompt = `You are a helpful and engaging Instagram assistant. 
The user ${username} just commented "${commentText}" and matched the trigger keyword "${keyword}".
Write a very short, friendly, human-like DM reply (1-2 sentences max) incorporating this message/link: "${templateText}".
Do not include hashtags or robotic language. Keep it natural.`;

    const aiRes = await fetch(`${config.endpointUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${actualApiKey}`
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!aiRes.ok) return null;
    const aiData = await aiRes.json();
    return aiData.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[AI Generation Error]", err);
    return null; // fallback to static template
  }
}

/* ── WebCrypto Decryption ────────────────────────────────────────────────── */
async function decryptSymmetric(encrypted, secret) {
  if (!encrypted || !encrypted.includes(":")) return encrypted;
  try {
    const parts = encrypted.split(":");
    if (parts.length !== 2) return encrypted;

    const iv = hex2buf(parts[0]);
    const ciphertext = hex2buf(parts[1]);

    const enc = new TextEncoder();
    const keyMaterial = enc.encode(secret);
    const hash = await crypto.subtle.digest("SHA-256", keyMaterial);

    const key = await crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed", err);
    return "";
  }
}

function hex2buf(hexString) {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

/* ---------------- Rate limiter (KV-backed, per-IP) ---------------- */
async function checkRateLimit(env, _ctx, clientIp) {
  if (!env.KOSH_KV) return { blocked: false };
  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS) || DEFAULTS.RATE_LIMIT_WINDOW_MS;
  const max = Number(env.RATE_LIMIT_MAX_REQUESTS) || DEFAULTS.RATE_LIMIT_MAX_REQUESTS;
  const key = `rl:${clientIp}`;
  const now = Date.now();

  try {
    const raw = await env.KOSH_KV.get(key, "json");
    let bucket = raw && typeof raw === "object" ? raw : null;

    if (!bucket || now - bucket.windowStart > windowMs) {
      bucket = { count: 1, windowStart: now };
    } else {
      bucket.count += 1;
    }

    // TTL = remainder of window + small buffer
    const ttl = Math.max(
      1,
      Math.ceil((windowMs - (now - bucket.windowStart)) / 1000) + 5,
    );
    await env.KOSH_KV.put(key, JSON.stringify(bucket), { expirationTtl: ttl });

    if (bucket.count > max) {
      return {
        blocked: true,
        resetAt: bucket.windowStart + windowMs,
      };
    }
    return { blocked: false };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { blocked: false }; // fail-open so legitimate traffic isn't dropped
  }
}

/* ---------------- Signature verification ---------------- */
async function verifySignature(body, sigHeader, secret) {
  if (!sigHeader || !sigHeader.startsWith("sha256=")) return false;
  const expected = sigHeader.slice("sha256=".length);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const actual = toHex(new Uint8Array(sig));
  return timingSafeEqual(actual, expected.toLowerCase());
}

function toHex(bytes) {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function matchKeywordDirect(text, keywordsStr, mode) {
  const haystack = String(text || "").toLowerCase();
  const modeStr = String(mode || DEFAULTS.MATCH_MODE).toLowerCase();

  // "any" mode: every comment triggers a DM — no keyword matching needed
  if (modeStr === "any") return "__any__";

  const keywords = String(keywordsStr || DEFAULTS.KEYWORDS)
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  for (const kw of keywords) {
    if (modeStr === "word") {
      const re = new RegExp(
        `(^|[^\\p{L}\\p{N}_])${escapeRegex(kw)}([^\\p{L}\\p{N}_]|$)`,
        "iu",
      );
      if (re.test(haystack)) return kw;
    } else if (haystack.includes(kw)) {
      return kw;
    }
  }
  return null;
}

// Legacy wrapper used nowhere now but kept for safety
function matchKeyword(text, env) {
  return matchKeywordDirect(text, env.KEYWORDS, env.MATCH_MODE);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderTemplate(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`,
  );
}

/* ---------------- Private reply via Meta Graph API ---------------- */
async function sendPrivateReply(commentId, message, env) {
  const version = env.GRAPH_VERSION || DEFAULTS.GRAPH_VERSION;
  const endpoint = `https://graph.facebook.com/${version}/${encodeURIComponent(
    commentId,
  )}/private_replies`;

  if (!env.IG_ACCESS_TOKEN) {
    console.error("Missing IG_ACCESS_TOKEN secret; cannot send DM.");
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.IG_ACCESS_TOKEN}`,
        "accept-encoding": "br, gzip",
      },
      body: JSON.stringify({ message }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error(
        `private_replies failed [${res.status}] for comment ${commentId}:`,
        body,
      );
      return;
    }
    console.log(`DM sent for comment ${commentId}:`, body);
  } catch (err) {
    console.error(
      `Network error sending DM for comment ${commentId}:`,
      err && err.stack ? err.stack : err,
    );
  }
}

async function sendDirectMessage(recipientId, message, env) {
  const version = env.GRAPH_VERSION || DEFAULTS.GRAPH_VERSION;
  const endpoint = `https://graph.facebook.com/${version}/me/messages`;
  if (!env.IG_ACCESS_TOKEN) return;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.IG_ACCESS_TOKEN}` },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } }),
    });
    const body = await res.text();
    if (!res.ok) console.error(`Send message failed for ${recipientId}:`, body);
  } catch (err) {
    console.error(`Network error sending direct message:`, err);
  }
}

async function saveLead(databaseUrl, fromId, campaignName) {
  try {
    const pgUrl = new URL(databaseUrl);
    const neonHttpUrl = `https://${pgUrl.hostname}/sql`;
    const query = `
      INSERT INTO lead_subscribers (instagram_username, source_campaign, engagement_count, last_engaged_at)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (instagram_username) DO UPDATE 
      SET engagement_count = lead_subscribers.engagement_count + 1,
          last_engaged_at = NOW()
    `;
    await fetch(neonHttpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${pgUrl.password}` },
      body: JSON.stringify({ query, params: [String(fromId), campaignName] })
    });
  } catch (err) {
    console.error("Failed to save lead:", err);
  }
}

/* ---------------- Analytics events (KV-backed) ---------------- */
async function logAnalyticsEvent(env, _ctx, event) {
  if (!env.KOSH_KV) return;
  try {
    const ts = Date.now();
    const key = `evt:${ts}:${Math.random().toString(36).slice(2, 8)}`;
    await env.KOSH_KV.put(key, JSON.stringify({ ...event, ts }), {
      expirationTtl: DEFAULTS.ANALYTICS_TTL_SECONDS,
    });
  } catch (err) {
    console.error("Failed to log analytics event:", err);
  }
}
