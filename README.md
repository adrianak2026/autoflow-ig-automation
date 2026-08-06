# AutoFlow IG — Instagram Comment & Story DM Automation SaaS Engine

AutoFlow IG is an open-source, serverless **Instagram Comment & Story → Direct Message (DM) Automation SaaS platform** built on **Cloudflare Workers (Edge Engine)** and **Neon Postgres (Storage Core)** with type-safe **Drizzle ORM**.

---

## 🚀 Key Features (2026 Edition)

- **⚡ Sub-50ms Response Speed:** Cloudflare Workers edge network handles webhook events in sub-seconds.
- **🛡️ Enterprise Security:** Mandatory `X-Hub-Signature-256` HMAC-SHA256 verification and Zod payload validation.
- **🛡️ Replay Attack Safeguard:** Anti-replay timestamp freshness validation (< 5 minutes).
- **💾 5 Strict Storage Rules:** Built-in Zlib binary compression (`BYTEA`), Native Postgres ENUMs, JSONB metadata, autoincrement integer PKs, and zero media DB storage.
- **💬 Story Mention & AI Intent Support:** Multi-variant Spintax DM rotation, Story Mention rewards, and AI Intent classification.
- **💯 100% Free Tier Supported:** 100,000 requests/day on Cloudflare Free Tier + Neon Postgres Free Tier ($0/month).

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    IG((Instagram User)) -->|Comment / Story Mention| Meta[Meta Graph API Webhooks]
    Meta -->|POST /webhook + HMAC Signature| Worker[AutoFlow IG Cloudflare Worker]
    Worker -->|Security & Replay Verification| Security{Signature Valid?}
    Security -->|Yes| Matcher[Keyword & AI Intent Engine]
    Security -->|No| Reject[403 Forbidden]
    Matcher -->|POST /private_replies| Meta
    Worker -->|Persist Logs & Leads| Neon[Neon Postgres DB via Drizzle]
```

---

## ⚡ 1-Click Auto Deployment

Run the automated single-command deployer:

```bash
npm run deploy
```

This command automatically:
1. Applies Neon Postgres migrations (`npx drizzle-kit migrate`).
2. Configures worker environment secrets (`VERIFY_TOKEN`, `IG_ACCESS_TOKEN`, `WEBHOOK_APP_SECRET`).
3. Deploys the worker to Cloudflare Workers edge network (`npx wrangler deploy`).

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js Dashboard
npm run dev

# 3. Run Local Cloudflare Worker
npm run worker:dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:password@ep-cool-pool.neon.tech/autoflow_db?sslmode=require"
VERIFY_TOKEN="your_random_webhook_verification_token"
IG_ACCESS_TOKEN="your_meta_page_long_lived_access_token"
WEBHOOK_APP_SECRET="your_meta_app_secret"
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
