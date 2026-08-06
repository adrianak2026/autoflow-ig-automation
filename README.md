# KoshVerse

KoshVerse is a three-in-one platform:

1. **Cashback & affiliate deals** served from Postgres via Drizzle ORM.
2. **Digital downloads** with signed-URL delivery and order tracking.
3. **Instagram Comment → DM automation** running entirely on Cloudflare Workers (free tier).

The core idea is simple: the interactive dashboard lives in Next.js, while the webhook + DM automation runs on the edge without a database.

## Architecture at a glance

```mermaid
flowchart TD
    User((User / Instagram))
    Meta[Meta / Instagram Webhooks]
    Worker["KoshVerse IG Worker (Cloudflare)"]
    KV["Cloudflare KV (KOSH_KV)"]
    Dashboard["KoshVerse Dashboard (Next.js)"]
    DB[("Postgres (Neon/Supabase)")]
    GraphAPI["Meta Graph API /private_replies"]

    User -- comment on IG post --> Meta
    Meta -- webhook POST --> Worker
    Worker -- verify signature --> Meta
    Worker -- read/write rate limits --> KV
    Worker -- fire-and-forget DM --> GraphAPI
    Worker -- write analytics events --> KV

    Dashboard -- read products/orders/events --> DB
    DB -- seed demo data --> Dashboard

    style Worker fill:#0b3d91,color:#fff
    style Dashboard fill:#7c3aed,color:#fff
    style DB fill:#059669,color:#fff
```

### Worker flow for every Instagram webhook event

```mermaid
sequenceDiagram
    participant Meta
    participant Worker
    participant KV
    participant GraphAPI

    Meta->>Worker: POST /webhook (JSON + X-Hub-Signature-256)
    Worker->>Worker: Zod validate payload
    Worker->>Worker: HMAC-SHA256 verify signature
    Worker->>KV: read rate-limit bucket (per IP)
    alt Rate limit exceeded
      Worker-->>Meta: 429 Too Many Requests + Retry-After
    else Signature valid and within limits
      Worker->>Worker: object == instagram?
      Worker->>Worker: extract comment id / text / username
      Worker->>Worker: skip self-comments if IG_PAGE_ID set
      Worker->>Worker: match keywords (partial or word)
      Worker->>KV: async log analytics event
      alt keyword matched
        Worker->>GraphAPI: async POST /private_replies (ctx.waitUntil)
        Worker->>KV: async log dm.sent event
      end
      Worker-->>Meta: 200 EVENT_RECEIVED
    end
```

## Project layout

```text
/
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ health/
│  │  │  ├─ orders/
│  │  │  ├─ products/seed/
│  │  │  └─ test-match/
│  │  ├─ analytics/
│  │  ├─ cashback/
│  │  ├─ downloads/
│  │  ├─ tester/Tester.tsx
│  │  ├─ actions.ts
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ globals.css
│  ├─ db/
│  │  ├─ index.ts
│  │  └─ schema.ts
│  └─ lib/
│     └─ matcher.ts
├─ worker/
│  ├─ index.js
│  ├─ wrangler.toml
│  └─ package.json
├─ .env
├─ drizzle.config.json
├─ next.config.ts
├─ package.json
└─ tsconfig.json
```

## Local runtime checklist

1. Dashboard compiles and boots cleanly.
2. Worker can be started locally with `wrangler dev`.
3. Worker root and webhook routes respond as expected.
4. Health and seed flows work without touching production credentials.

```mermaid
flowchart LR
    subgraph Local
      N[Next.js Dashboard]
      W[Cloudflare Worker]
      P[Postgres]
      KV[Cloudflare KV or local fail-open]
    end

    Meta -- webhook --> W
    W -- rate limit / analytics --> KV
    W -- verify signature --> Meta
    W -- private reply --> Meta
    N -- read/write --> P
```

### Local smoke test plan

```text
1. npm install
2. npm run db:push
3. npm run build
4. npm run start
5. curl http://localhost:3000/api/health  -> 200
6. curl http://localhost:3000/             -> 200
7. cd worker && npm install && npm run dev
8. curl http://localhost:9001/             -> 200
9. curl http://localhost:9001/webhook      -> 404
10. curl "http://localhost:9001/webhook?hub.mode=subscribe&hub.verify_token=WRONG&hub.challenge=123" -> 403
```

### What "build and run" means here

- Dashboard: `next build` + `next start`
- Worker: `wrangler dev` or `wrangler deploy`
- Database: `npx drizzle-kit push` against the local Postgres connection in `.env`

### Developer workflow

```mermaid
flowchart TD
    A[Edit source] --> B{Type of change}
    B -->|Dashboard UI or API| C[Next.js]
    B -->|Webhook logic| D[worker/index.js]
    B -->|Schema change| E[db/schema.ts]

    C --> F[npm run build]
    F --> G[npm run start]
    G --> H[Verify health endpoint]

    D --> I[npm run dev]
    I --> J[Verify worker root + webhook routes]

    E --> K[npnx drizzle-kit push]
    K --> L[Confirm table changes in Postgres]
```

### Debugging checklist

- `npm run build` fails? Read the route list and any compile warnings.
- Worker does not start? Check `wrangler.toml` `compatibility_flags` and KV id placeholder.
- Local worker rejects requests? Confirm `WEBHOOK_APP_SECRET` is unset locally if you want to skip signature checks.
- Dashboard cannot reach Postgres? Verify `DATABASE_URL` matches the local database in `.env`.
- Tester results differ from Worker? Compare `src/lib/matcher.ts` against `worker/index.js` keyword logic.

### Local gotchas

- The worker repo uses `zod@^3.23.8` for the worker bundle. The root app uses Zod 4. They are intentionally separate.
- `worker/wrangler.toml` still contains `id = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"` until you create a real KV namespace.
- `nodejs_compat` is enabled for local wrangler dev.
- `src/app/actions.ts` writes demo data only when the seed route is called manually.


- Dashboard: `next build` + `next start`
- Worker: `wrangler dev` or `wrangler deploy`
- Database: `npx drizzle-kit push` against the local Postgres connection in `.env`


### 1. Dashboard (Next.js + Postgres)

```bash
npm install
npm run db:push
npm run dev
```

Default dashboard URL: `http://localhost:3000`

Current `.env` is configured for the local Postgres instance:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

### 2. Worker (Cloudflare)

```bash
cd worker
npm install
npm run dev
```

The worker listens at:

- `/` or `/health` → `KoshVerse Worker is running.`
- `/webhook` → Meta webhook endpoint

If you have Cloudflare credentials, you can deploy with `npm run deploy` after setting secrets.

### Optional: full local worker run script

If you want a repeatable local smoke test without leaving it running forever:

```bash
cd worker
npm install

# Start wrangler in background
npm run dev -- --port 9001 &
WRANGLER_PID=$!

# Wait for the local worker to come up
sleep 30

echo "Worker root:"
curl -s -w "\nHTTP %{http_code}\n" http://127.0.0.1:9001/

echo ""
echo "Webhook root (should 404):"
curl -s -w "\nHTTP %{http_code}\n" http://127.0.0.1:9001/webhook

echo ""
echo "Webhook GET verification (should 403 without valid token):"
curl -s -w "\nHTTP %{http_code}\n" "http://127.0.0.1:9001/webhook?hub.mode=subscribe&hub.verify_token=WRONG&hub.challenge=123"

# Stop local worker
kill $WRANGLER_PID >/dev/null 2>&1
echo "Local worker stopped."
```

## Manifest / dependency graph

```mermaid
mindmap
  root((KoshVerse))
    Dashboard
      Next.js App Router
      Tailwind CSS
      Drizzle ORM
      Postgres / Neon
      Zod for form / API validation
    Worker
      ES Modules
      Cloudflare Workers free tier
      Zod webhook validation
      HMAC-SHA256 signature check
      KV rate limiting
      Async private_replies via waitUntil
    Data
      users
      products
      orders
      analytics_events
      test_runs
    Edge
      Cache headers
      Vary Accept-Encoding
      Security headers
      Fail-open rate limiting
```

## Setup guide

### Secrets for the worker

```bash
cd worker
wrangler secret put VERIFY_TOKEN
wrangler secret put IG_ACCESS_TOKEN
wrangler secret put WEBHOOK_APP_SECRET
```

- `VERIFY_TOKEN` — any random string you also enter into Meta's webhook UI.
- `IG_ACCESS_TOKEN` — long-lived Page/IG token for the Meta Graph API.
- `WEBHOOK_APP_SECRET` — Meta App secret used to verify `X-Hub-Signature-256`.

KV is used for rate limiting and analytics events:

```bash
wrangler kv:namespace create KOSH_KV
```

Then paste the returned id into `worker/wrangler.toml`.

### Meta Developer Console

1. Open your app → **Instagram Graph API** → **Webhooks**.
2. Add a subscription for the **Instagram** object.
3. Callback URL: `https://<your-worker>.workers.dev/webhook`
4. Verify token: the same string you put in `VERIFY_TOKEN`.
5. Subscribe to the `comments` field and click **Verify and save**.
6. Connect your IG Business account to the app.
7. Generate a long-lived token and store it in `IG_ACCESS_TOKEN`.
8. (Recommended) Copy your App secret into `WEBHOOK_APP_SECRET`.

## Environment variables

| Name | Kind | Purpose |
|------|------|---------|
| `VERIFY_TOKEN` | secret | Meta webhook verification token. |
| `IG_ACCESS_TOKEN` | secret | Long-lived Page/IG token for Graph API calls. |
| `WEBHOOK_APP_SECRET` | secret | Meta App secret for `X-Hub-Signature-256` verification. |
| `DATABASE_URL` | secret (Next.js only) | Postgres connection string for the dashboard. Not used by the Worker. |
| `KEYWORDS` | var | Comma-separated keywords, e.g. `link,info,price,buy,deal`. |
| `REPLY_TEMPLATE` | var | DM body with `{username}` and `{keyword}` placeholders. |
| `MATCH_MODE` | var | `partial` or `word`. |
| `IG_PAGE_ID` | var (optional) | Enables self-comment filtering. |
| `GRAPH_VERSION` | var | Defaults to `v19.0`. |
| `RATE_LIMIT_WINDOW_MS` | var | Rate-limit window in ms, default `60000`. |
| `RATE_LIMIT_MAX_REQUESTS` | var | Max requests per IP per window, default `120`. |

## Drizzle tables

- `users`
- `products`
- `orders`
- `analytics_events`
- `test_runs` (worker matcher tester history)

## Security

- Every webhook payload is Zod-validated before processing.
- Webhook integrity is checked using `X-Hub-Signature-256` with a constant-time compare.
- KV-backed per-IP rate limiting is fail-open by default.
- Worker responses include security headers (HSTS, X-Frame-Options, nosniff, strict referrer, permissions-policy).
- All Postgres access goes through Drizzle ORM parameterized queries.

## Known local notes

- The worker currently expects `nodejs_compat` compatibility mode.
- In `wrangler.toml`, replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with your real KV namespace id before deploying.
- The worker demo in this repo uses `zod@^3.23.8` for the worker bundle. The root app already uses Zod 4, but the worker dependency is intentionally pinned separately.

## FAQ

**Does the Worker need Postgres?**
No. The Dashboard uses Postgres. The Worker is fully free-tier compatible without a database.

**How are DMs sent?**
`ctx.waitUntil()` fires an async POST to `/v19.0/{comment_id}/private_replies`. The webhook returns `200 EVENT_RECEIVED` immediately.

**What if there is no keyword match?**
Nothing happens beyond logging an analytics event. No DM is sent.

**Can I test keyword matching without deploying?**
Yes. The dashboard has an interactive matcher tester powered by the same matcher logic as the Worker. Results are also persisted to Postgres.
