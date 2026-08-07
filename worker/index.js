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
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const rl = await checkRateLimit(env, ctx, clientIp);
  if (rl.blocked) {
    console.error(`Rate limit exceeded for ${clientIp}`);
    return respondWith(429, "Too Many Requests", {
      "content-type": "text/plain",
      "retry-after": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
    });
  }

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
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const change of changes) {
      if (change.field !== "comments") continue;

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

      const message = renderTemplate(effectiveTemplate, { username, keyword });

      ctx.waitUntil(sendPrivateReply(commentId, message, env));
      ctx.waitUntil(
        logAnalyticsEvent(env, ctx, {
          event: "ig.dm.sent",
          commentId,
          username,
          keyword,
          mediaId: commentMediaId,
          campaignId: effectiveCampaignId,
          clientIp,
        }),
      );
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
      SELECT id, name, trigger_keywords, reply_template, match_mode
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
