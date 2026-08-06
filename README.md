# AutoFlow IG — Instagram Comment & Story DM Automation SaaS Engine

AutoFlow IG ek 100% Free Serverless **Instagram Comment & Story → DM Automation Engine** hai jo **Cloudflare Workers (Edge)** aur **Neon Postgres Database** par chalta hai.

---

## 📘 Complete Step-by-Step Setup Guide (HINDI & ENGLISH)

Aapko exact **3 cheezein** chahiye hongi:
1. **Neon Database URL** (`DATABASE_URL`)
2. **Meta Developer App Secrets** (`VERIFY_TOKEN`, `IG_ACCESS_TOKEN`, `WEBHOOK_APP_SECRET`)
3. **Cloudflare Worker URL** (`https://autoflow-ig-worker.<your-subdomain>.workers.dev`)

---

### 🔹 STEP 1: Neon Database URL Kaise Milegi?

1. Open [Neon Console](https://console.neon.tech).
2. Apne Project par click karein aur **Connection Details** section me jayein.
3. Node.js / Postgres connection string copy karein. Example:
   `DATABASE_URL="postgresql://alex:pass@ep-cool-pool-123.us-east-2.aws.neon.tech/neondb?sslmode=require"`
4. Apne local project me `.env` file banayein aur usme yeh URL daalein.

---

### 🔹 STEP 2: Meta App Credentials Kaise Milenge?

1. Open [Meta for Developers Console](https://developers.facebook.com/apps).
2. Create App -> Select **Business** type.
3. **Add Products**: Add **Instagram Graph API** and **Webhooks**.
4. **VERIFY_TOKEN**: Koi bhi Secret Random Text likhein (e.g. `autoflow_secret_token_2026`).
5. **WEBHOOK_APP_SECRET**: Meta App Dashboard -> **App Settings** -> **Basic** -> **App Secret** copy karein.
6. **IG_ACCESS_TOKEN**: Meta App Dashboard -> **Tools** -> **Graph API Explorer**:
   - Permissions select karein: `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`, `pages_manage_metadata`, `pages_read_engagement`.
   - **Generate Token** par click karein aur Long-lived Access Token copy karein.

---

### 🔹 STEP 3: Cloudflare Worker Secret & Deployment

Project directory me 1-click command chalayein:

```bash
npm run deploy
```

Yeh command automatically:
- Neon Database par Migration chalayegi.
- Secrets Cloudflare Worker me store karegi.
- Cloudflare Worker Webhook URL live publish karegi!

---

### 🔹 STEP 4: Instagram Webhook Link Karein

1. Meta Developer App Console -> **Webhooks** section me jayein.
2. Select **Instagram** from dropdown -> Click **Subscribe to this topic**.
3. **Callback URL**: Apna Cloudflare Worker URL daalein (e.g. `https://autoflow-ig-worker.yourname.workers.dev/webhook`).
4. **Verify Token**: Step 2 wala `VERIFY_TOKEN` daalein.
5. **Subscription Fields**: Tick `comments` aur `story_insights`.

---

## ⚡ Architecture Diagram

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

## 🔑 Environment Variables Format

Apne `.env` file me yeh values daalein:

```env
DATABASE_URL="postgresql://username:password@ep-cool-pool-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
VERIFY_TOKEN="autoflow_secret_token_2026"
IG_ACCESS_TOKEN="EAABb..."
WEBHOOK_APP_SECRET="a1b2c3d4..."
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
