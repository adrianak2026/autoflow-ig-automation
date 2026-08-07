# 🤖 AutoFlow IG — Instagram DM Automation SaaS Engine

<div align="center">

**Upload a Reel → Set a keyword/emoji → Automatically send a Private DM to commenters**

[![Deploy Status](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange?logo=cloudflare)](https://workers.cloudflare.com)
[![Database](https://img.shields.io/badge/Database-Neon%20Postgres-green?logo=postgresql)](https://neon.tech)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Free Tier](https://img.shields.io/badge/Cost-100%25%20Free%20Tier-brightgreen)](https://neon.tech)
[![Security](https://img.shields.io/badge/Security-HMAC%20Signed-red?logo=shield)](https://developers.facebook.com)
[![Per-Reel](https://img.shields.io/badge/Per--Reel-Campaign%20Matching-purple)](https://neon.tech)

</div>

---

## 📚 Documentation & Setup Guides

Everything you need to set up, configure, and safely run your AutoFlow IG is linked here:
- 📖 **[English Setup Guide](./SETUP_GUIDE_EN.md)** (Step-by-step instructions from zero to live)
- 📖 **[हिंदी सेटअप गाइड (Hindi Setup Guide)](./SETUP_GUIDE_HI.md)** (शून्य से लाइव तक की पूरी जानकारी)
- 🛡️ **[Meta Policy Compliance Architecture](./META_POLICY_COMPLIANCE.md)** (How this app prevents bans and follows Meta rules)

---

## ⚡ Deploy in Seconds (1-Click Setup)

Deploy your own Instagram DM Automation SaaS in seconds - **no coding or laptop required**.

### Step 1: Deploy Backend (Webhook)
<div align="center">

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/SudhirDevOps1/serverless-instagram-dm-automation)

</div>

**What happens when you click this button?**
1. A Cloudflare screen will open and ask for a project name.
2. It will automatically create **KOSH_KV** (for Spam Protection)!
3. It will prompt you for the following Keys (Secrets):
   * **`META_APP_SECRET`** (✅ Required - Obtained from Facebook App)
   * **`PAGE_ACCESS_TOKEN`** (✅ Required - For Instagram API)
   * **`IG_PAGE_ID`** (✅ Required - Your Instagram Page ID)
   
> **Note (Safely):** If you don't have these right now, you can leave them blank and securely add them later in **Cloudflare Worker Settings -> Variables & Secrets**.

### Step 2: Deploy Frontend & Database (Cloudflare Pages)

Your frontend dashboard will also be hosted 100% free on **Cloudflare Pages**. (Since Cloudflare Pages doesn't have a direct 1-Click button, deploy it like this):

1. Go to your Cloudflare Dashboard -> **Workers & Pages** -> **Overview**.
2. Click on **Create Application** -> **Pages** -> **Connect to Git** and select your GitHub repository.
3. **Framework preset:** `Next.js` | **Build command:** `npm run build`
4. Under **Environment variables (advanced)** add these 2 items:
   * **`DATABASE_URL`** (✅ Required - Your Neon Postgres URL)
   * **`ADMIN_SECRET_TOKEN`** (✅ Required - Your chosen password to open the dashboard)

> **Note (Safely):** If you forgot to add these during deployment, you can add them later by going to **Cloudflare Pages -> Settings -> Variables and secrets**.

**Final Step:** After deployment, open your new dashboard URL, go to the **"⚙️ Settings & AI"** tab, and click the **"🚀 Initialize Database Tables"** button. You're all set! 🎉

---

## 🎯 What Does This App Do?

**AutoFlow IG** is a **serverless Instagram DM Automation system** that converts your Instagram Reels, Posts, and Stories into an automatic lead generation machine.

### Real-World Example:

> **You post a Reel and write in the caption:**
> *"If you want the link to this tool, just comment anything, and I will DM it to you 🔥"*
>
> ✅ As soon as someone comments (whether it's "link", "joke", "tool", "🔥", "❤️" — anything) —
> **AutoFlow IG automatically sends a Private DM to that user** containing your desired link.
>
> **You are sleeping, while AutoFlow IG is working.**

### Works Flawlessly with 100+ Reels:

> **Reel #1** (AI Tool) → keyword "joke" → DM with Link A
> **Reel #2** (Online Course) → keyword "course" → DM with Link B
> **Reel #50** (Old Reel) → "Any Comment" mode → DM with Link C
>
> ✅ Every Reel has its own campaign. The webhook matches the `media_id` —
> **only that specific reel's template is triggered, no cross-mixing.**

---

## 🏆 How Does It Compare to Other Tools?

| Feature | **AutoFlow IG** | ManyChat | Manychat Free | Respond.io | Zapier |
|---|---|---|---|---|---|
| **Instagram Comment → DM** | ✅ Full | ✅ Full | ⚠️ Limited | ✅ Full | ⚠️ Limited |
| **Custom Keywords** | ✅ Unlimited | ✅ Paid | ❌ No | ✅ Paid | ⚠️ Limited |
| **Custom Emojis Triggers** | ✅ Yes (🔥❤️👇) | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **"Any Comment" Mode** | ✅ Yes | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **Per-Reel Campaign** | ✅ Yes (media_id) | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **Story Mention → DM** | ✅ Yes | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **🤖 AI Smart Auto-Replies**| ✅ Yes (Custom API)| ❌ No | ❌ No | ✅ Paid | ❌ No |
| **Human Handoff Pause** | ✅ Yes (1-hour pause)| ❌ No | ❌ No | ✅ Paid | ❌ No |
| **Lead Capture Database** | ✅ Neon Postgres | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **CSV Export (Leads)** | ✅ Yes | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **Monthly Cost** | **🆓 $0 Free** | 💸 $15–$50/mo | $0 Limited | 💸 $49+/mo | 💸 $20+/mo |
| **Self-hosted** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Own Data** | ✅ Yes (Neon DB) | ❌ Their servers | ❌ Their servers | ❌ Their servers | ❌ Their servers |
| **Custom Domain** | ✅ workers.dev | ✅ | ✅ | ✅ | ✅ |
| **Speed** | ⚡ Sub-50ms Edge | ~500ms | ~500ms | ~300ms | ~1000ms |

> **Bottom Line:** The same work that costs $15–$50/month on ManyChat, AutoFlow IG does for **$0** — and you keep your data entirely in your own control.

---

## 🛡️ Meta Developer Policy Compliance

AutoFlow IG is explicitly designed to be **100% compliant** with [Meta's Developer Policies](https://developers.facebook.com/devpolicy/) to keep your account safe from bans. It strictly follows the rules for user opt-in (24-Hour Messaging Window), anti-spam (Max 3 DMs limit), human handoff (1-hour pause), and forbids deceptive practices.

👉 **[Read the Full Meta Policy Compliance Details Here](./META_POLICY_COMPLIANCE.md)**

---

### 1. 🎬 Reel Comment → Auto DM (Core Feature)
- Paste your Instagram Reel link
- Set custom keywords: `joke`, `tool`, `link`, `price`, anything
- Set custom emojis: `🔥`, `❤️`, `👇`, `💯`
- **Whenever someone comments → the user is automatically sent a Private DM** containing your link.
- You can use variables like `{username}` and `{keyword}` in your DM messages.

### 2. 🔄 "Any Comment" Mode — Zero Keyword Required
- When creating a campaign, select **"Any Comment"** mode
- Now **no matter what someone comments — a DM will be sent**, regardless of the text.
- Write in the Reel caption: *"Comment anything, and I'll DM you the link"*
- No need to input any keywords at all.

### 3. 🎯 Per-Reel Campaign Matching (Multi-Reel Support)
- **Problem Solved:** Create 100+ reels — each reel gets its own specific campaign.
- Store the **Instagram Media ID** in every campaign.
- When a webhook is received → the worker searches for the exact matching campaign in Neon DB using the `media_id`.
- **Only that specific reel's DM template is used** — no cross-mixing.
- If no Media ID is provided → global defaults will be used (backwards compatible).

### 4. 📸 Story Mention → Auto DM Reward
- When someone mentions your account in their Story
- **They automatically receive a Thank You DM + CTA button link**
- Convert Story mentions into generated leads
- Add / Delete Story triggers directly from your browser.

### 5. 👥 Lead Database (Captured Subscribers)
- Every commenter's Instagram username is saved to the Neon DB
- Engagement count is tracked automatically
- Email capture ready (future feature)
- **CSV Export** — download all leads into a `.csv` file with one click
- **Search by username** — filter through large lead lists
- **Build an Instagram lead list just like an email list**

### 5.1 🔒 Honest Follow Gate (Require Follow)
- **Problem Solved:** Want to grow followers before giving away the link, but without violating Meta Policies?
- **How it works:** When enabled, the bot replies to the comment with a "Gate" message containing two buttons: `[ Visit Profile ]` and `[ Send Link ✅ ]`. 
- **Honest & Polite:** The message politely asks: *"Hey! Thanks for the comment. Before I send the link, could you please follow the page? (We can't check automatically, but we trust you! 😊)"*
- **100% Policy Compliant:** Because you are not deceiving the user with a fake technical check, this method prevents spam reports and keeps your Meta Developer account 100% safe from bans.

### 5.2 ⏳ 7-Day Smart Follow-ups (Cron Job)
- The Cloudflare Worker automatically runs a daily cron job.
- It finds users who engaged exactly **7 days ago** and sends them a polite follow-up DM.
- Fully automated, runs within Cloudflare's free tier limits (only 0.024% usage).

### 6. 🤖 AI Smart Auto-Replies (New)
- **Dynamic Human-like DMs:** Use any OpenAI-compatible API (OpenAI, Groq, Claude proxy) to send natural replies.
- **Context Aware:** AI generates the message combining the user's comment, trigger keyword, and your link.
- **Edge Compatible:** Cloudflare worker directly talks to the AI endpoint; no extra DB roundtrip needed for generation.
- **Dynamic Model Fetching:** Instantly fetches available models via the UI.

### 7. 👤 Human Handoff (1-Hour Pause) & Spam Protection (New)
- **Spam Protection:** If a single user comments multiple times, the system will send them a **maximum of 3 auto-DMs** (within 24 hours). This protects your API limits and database.
- **Human Handoff:** If you manually reply to someone (via browser/app) (which triggers `is_echo: true`), **AutoFlow IG automatically pauses automated replies for that user for 1 hour.**
- This prevents the AI and your manual message from clashing.

### 8. 📊 Stats Dashboard — Live Campaign Overview
- **Total Rules** count
- Breakdown of **Active vs Paused** rules
- **Any-Comment Rules** count
- Live badges — real-time data synced from Neon DB

### 9. ✏️ Browser-Based Campaign Manager — Full CRUD
- **Add / Edit / Rename / Delete** Reel rules straight from the browser
- **⏸ Pause / ▶ Activate** — pause a campaign without deleting it
- **📋 Copy DM** — copy the DM template to your clipboard (2-sec feedback)
- **🔁 Duplicate** — create a copy of an existing campaign for a new reel
- **🔍 Search** — filter your campaign list by name or keyword
- **🔄 Refresh** — instantly refresh the list
- **No coding, no servers — manage everything straight from the dashboard**
- **Admin Password Protection** — ensure only you can manage it

### 10. ⚡ Live Keyword Matcher Tester
- Input any comment text → instantly see whether a DM would trigger
- Test Partial, Word, and Any match modes
- Test logs are saved to Neon DB for historical reference

### 11. 🔒 Production Security & Encryption (15+ Layers)
- **AES-256-GCM Encryption (New):** All sensitive configurations (like AI API Keys) are encrypted before hitting the database using your `ADMIN_SECRET_TOKEN` as the master key. Even if the Neon DB is compromised, hackers get only scrambled text.
- **Strict HTTP Security Headers:** Enforced HSTS (Strict-Transport-Security), XSS Protection, CSP, and X-Frame-Options on all routes via `next.config.ts`.
- Bearer Token API authentication (Admin-only actions)
- HMAC-SHA256 Meta Webhook Signature Verification
- Rate limiting per-IP (KV-backed sliding window)
- Replay attack prevention (5-min event age check)
- Input validation + length limits (SQL injection prevention)
- Zlib compression for DM templates in DB
- Self-comment filter (the worker doesn't DM itself)
- Fail-closed architecture (secrets not set = app refuses to start)
- Zod schema validation on all webhook payloads
- Admin secret + Admin user/pass dual-layer auth
- UUID primary keys for user-facing tables
- ENUM types for match_mode (no invalid values)
- JSONB settings column for future extensibility
- Rate-limited token API with brute force protection

---

## 🏗️ Technical Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Instagram Follower
    participant Instagram as Instagram App
    participant Meta as Meta Graph API
    participant Worker as Cloudflare Worker (Edge)
    participant Neon as Neon Postgres DB
    participant Dashboard as AutoFlow IG Dashboard

    User->>Instagram: Comments on your Reel #42
    Instagram->>Meta: Sends Comment Event (with media_id)
    Meta->>Worker: POST /webhook (HMAC-SHA256 signed)
    Worker->>Worker: Verify HMAC Signature
    Worker->>Worker: Check Human-Handoff Pause (`is_echo` in KV)
    Worker->>Worker: Extract media_id from webhook
    Worker->>Neon: SELECT campaign WHERE reel_media_id = media_id
    Neon-->>Worker: Returns campaign for Reel #42
    Worker->>Worker: Match keyword against campaign rules
    Worker->>Worker: (Optional) Call AI API for smart reply
    Worker->>Meta: POST /private_replies → Auto DM with Reel #42 link
    Worker->>Neon: Log lead (username, keyword, campaign)
    Meta->>User: User receives Private DM instantly

    Note over Dashboard,Neon: You manage everything from Browser Dashboard
    Dashboard->>Neon: Add/Edit/Delete/Pause rules in real-time
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Edge Runtime** | Cloudflare Workers | Sub-50ms worldwide, 100K req/day free |
| **Frontend** | Next.js 16 + React | Modern dashboard UI |
| **Database** | Neon Postgres (Serverless) | 512MB free, auto-suspend = $0 idle cost |
| **ORM** | Drizzle ORM | Type-safe, lightweight, edge-compatible |
| **Auth** | Custom Bearer Token + Rate Limiter | No external dependency |
| **DB Driver** | `@neondatabase/serverless` (HTTP) | Works on Cloudflare edge without TCP |
| **Compression** | Zlib BYTEA | DM templates compressed in DB |
| **Validation** | Zod | Runtime schema validation on webhooks |
| **KV Store** | Cloudflare KV | Rate limiting + analytics events |
| **Per-Reel Lookup** | Neon HTTP API in Worker | media_id → campaign matching at edge |

### Database Schema (Neon Postgres)

```
automation_campaigns         ← Reel DM rules (core table)
  id                         Serial PK
  name                       Campaign name
  trigger_keywords           Comma-separated keywords/emojis
  reply_template             DM message (Zlib compressed BYTEA)
  match_mode                 ENUM: 'partial' | 'word' | 'any'
  is_active                  Boolean (pause/activate without delete)
  reel_url                   Instagram Reel URL (for display)
  reel_media_id              Instagram numeric media ID (for webhook matching)
  total_dms_sent             Counter
  total_comments             Counter
  created_at / updated_at    Timestamps

story_triggers               ← Story mention auto-DM rules
  id                         UUID PK
  trigger_name               Rule name
  dm_reply_template          DM message
  cta_button_url             CTA link

lead_subscribers             ← Auto-captured Instagram leads
  id                         UUID PK
  instagram_username         IG handle
  captured_email             (optional)
  source_campaign            Which rule triggered the capture
  engagement_count           How many times engaged
  last_engaged_at            Last activity timestamp

test_match_logs              ← Live tester history
  id                         UUID PK
  comment_text               Tested comment
  matched                    Boolean
  matched_keyword            Which keyword matched
  rendered_dm                What DM would have been sent

system_settings              ← AI configuration and global settings
  id                         UUID PK
  key                        String (e.g., 'ai_config')
  value                      JSONB
  updated_at                 Timestamp
```

---

## Setup Guide (5 Environment Variables)

### 1. DATABASE_URL — Neon Postgres Connection

> **Where to find it:** https://console.neon.tech → Project → Connection Details

```
postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> Important: Set this secret **in your Cloudflare Worker as well** — the worker queries Neon DB for per-reel campaign lookups.
>
> ```bash
> wrangler secret put DATABASE_URL
> ```

### 2. VERIFY_TOKEN — Webhook Secret (You create this)

> Meta uses this token to verify your webhook URL.

```
autoflow_webhook_secret_2026
```

### 3. WEBHOOK_APP_SECRET — Meta HMAC Key

> **Where to find it:** developers.facebook.com/apps → App Settings → Basic → App Secret

```
a1b2c3d4e5f67890123456789abcdef0
```

### 4. IG_ACCESS_TOKEN — Instagram Graph API Token

> **Where to find it:** developers.facebook.com/tools/explorer
>
> Required Permissions:
> - instagram_basic
> - instagram_manage_comments
> - instagram_manage_messages
> - pages_manage_metadata

```
EAABb...your_long_lived_token
```

### 5. Admin Credentials (Dashboard Security)

Set these as Cloudflare Worker secrets:

```bash
wrangler secret put ADMIN_USER         # Your admin username
wrangler secret put ADMIN_PASS         # Your admin password
wrangler secret put ADMIN_SECRET_TOKEN # Random 32+ char secret (openssl rand -hex 32)
```

---

## 🚀 How to Deploy (1 Command)

```bash
# 1. Clone the repository
git clone https://github.com/adrianak2026/autoflow-ig-automation.git
cd autoflow-ig-automation

# 2. Install dependencies
npm install

# 3. Deploy with one click
npm run deploy
```

This will automatically:
1. Apply Neon Postgres migrations
2. Configure Cloudflare Worker secrets
3. Deploy the Worker live

### DB Migrations (Run Manually if Needed)

```bash
npx drizzle-kit migrate
```

Migration files in `drizzle/`:
- `0000_initial_schema.sql` — Base tables (users, campaigns, leads)
- `0001_story_triggers.sql` — Story mention rules
- `0002_test_logs.sql` — Live tester history logs
- `0003_reel_url_any_mode.sql` — Reel URL column + any match mode
- `0004_reel_media_id.sql` — Per-reel Instagram media ID matching

---

## 🔗 Meta Webhook Setup

After deploying, you will get your Worker URL:
```
https://autoflow-ig-worker.<your-subdomain>.workers.dev/webhook
```

1. Open Meta Developer Console (developers.facebook.com/apps)
2. Go to **Webhooks** → **Instagram** → **Subscribe**
3. Input:
   - **Callback URL**: The URL from above
   - **Verify Token**: Your VERIFY_TOKEN
4. Tick the subscribe fields: `comments`, `messages`, `mention`

---

## How to Get Instagram Media ID (For Per-Reel Matching)

For per-reel matching, it is necessary to input the Instagram Media ID (numeric) in each campaign.

### Method 1 — Graph API Explorer (Recommended)

1. Open developers.facebook.com/tools/explorer
2. Request: `GET /me/media?fields=id,caption,media_type&limit=50`
3. The response will contain the `"id"` for each Reel/Post → Paste this into the Dashboard

### Method 2 — API Call

```bash
curl "https://graph.facebook.com/v19.0/me/media?fields=id,caption&access_token=YOUR_TOKEN"
```

Response:
```json
{
  "data": [
    { "id": "17841234567890123", "caption": "AI Tool Reel" },
    { "id": "17841987654321000", "caption": "Course Launch Reel" }
  ]
}
```

In the Dashboard: When creating a Campaign → Paste the numeric ID into the **Instagram Media ID** field.

> **Note:** If no Media ID is provided → it defaults to global environment variables (backward compatible). The same DM will be sent across all reels. Providing an ID ensures that the campaign triggers *only* for that specific reel.

---

## 📊 Free Tier Limits

| Service | Free Limit | AutoFlow IG Usage |
|---|---|---|
| Cloudflare Workers | 100,000 req/day | ~1 req per comment → safe for 100K comments/day |
| Neon Postgres | 512 MB storage | Text data only → safe for 500,000+ lead records |
| Meta Graph API | Standard limits | 200 DMs/hour per account |
| Cloudflare KV | 100K reads/day | Rate limiting + analytics |

---

## 📁 Project Structure

```
autoflow-ig-automation/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Login page (Admin auth)
│   │   ├── tester/
│   │   │   └── Tester.tsx            # Main dashboard (all tabs)
│   │   └── api/
│   │       ├── auth/route.ts         # Login → Bearer token
│   │       ├── campaigns/route.ts    # CRUD for Reel DM rules
│   │       ├── features/route.ts     # Story triggers + Leads
│   │       ├── health/route.ts       # Health check endpoint
│   │       └── test-match/route.ts   # Live keyword tester
│   ├── db/
│   │   ├── index.ts                  # Drizzle DB connection
│   │   └── schema.ts                 # All table definitions
│   └── lib/
│       ├── auth.ts                   # Bearer token verification
│       └── matcher.ts                # Keyword matching logic
├── worker/
│   └── index.js                      # Cloudflare Worker (Edge webhook handler)
├── drizzle/
│   ├── 0000_initial_schema.sql
│   ├── 0001_story_triggers.sql
│   ├── 0002_test_logs.sql
│   ├── 0003_reel_url_any_mode.sql
│   └── 0004_reel_media_id.sql
├── wrangler.toml                     # Cloudflare Worker config
└── package.json
```

---

## 🎛️ Dashboard Tabs — What is Where

### Tab 1: Reel Campaign Builder
- Stats cards (Total / Active / Paused / Any-Comment rules)
- Campaign create form with Reel URL, Media ID, Trigger Mode, Keywords, DM Template
- Campaign list with search filter
- Per-card actions: Pause / Activate / Edit / Copy DM / Duplicate / Delete

### Tab 2: Story Mention Auto-DM
- Create Story trigger rules (name + DM template + CTA URL)
- Existing rules list with Delete button

### Tab 3: Leads & Subscribers
- Auto-captured Instagram lead table
- Search by username
- Export CSV — download all leads as a .csv file

### Tab 4: Live Match Tester
- Simulate any comment text
- Test against keyword rules in real-time
- View rendered DM template output
- Test logs are saved to Neon DB

### Tab 5: AI Configuration (New)
- Provide Custom Provider, API Key, and Model Name (e.g., OpenAI, Claude, Groq)
- Fetch available models straight from the provider
- Enable/Disable AI overriding for smarter natural replies

---

## 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) — For the blazing fast serverless edge runtime.
- [Neon Postgres](https://neon.tech/) — For the scalable, serverless, and free tier database.
- [Next.js](https://nextjs.org/) — For the modern React framework driving our dashboard.
- [Drizzle ORM](https://orm.drizzle.team/) — For making database interactions fully type-safe and edge-compatible.
- [Meta / Instagram Graph API](https://developers.facebook.com/) — For providing the robust webhook ecosystem and Messaging API.

---

## 📄 License
[MIT License](LICENSE) — Free use, modification, and distribution.

---

<div align="center">

**Built with love for Creators who want Enterprise power at Zero cost**

*AutoFlow IG — Own your data, own your audience.*

</div>
