# 🤖 AutoFlow IG — Instagram DM Automation SaaS Engine

<div align="center">

**Ek Reel Upload karo → Comment keyword/emoji set karo → Commenters ko automatically Private DM chali jaaye**

[![Deploy Status](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange?logo=cloudflare)](https://workers.cloudflare.com)
[![Database](https://img.shields.io/badge/Database-Neon%20Postgres-green?logo=postgresql)](https://neon.tech)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Free Tier](https://img.shields.io/badge/Cost-100%25%20Free%20Tier-brightgreen)](https://neon.tech)
[![Security](https://img.shields.io/badge/Security-HMAC%20Signed-red?logo=shield)](https://developers.facebook.com)
[![Per-Reel](https://img.shields.io/badge/Per--Reel-Campaign%20Matching-purple)](https://neon.tech)

</div>

---

## 🎯 Yeh App Kya Karta Hai?

**AutoFlow IG** ek **serverless Instagram DM Automation system** hai jo tumhare Instagram Reels, Posts, aur Stories ko automatic lead generation machine mein convert karta hai.

### Real-World Example:

> **Tum ek Reel post karte ho aur caption mein likhte ho:**
> *"Agar tumhe is tool ka link chahiye to comment mein kuch bhi likho, main DM kar dunga 🔥"*
>
> ✅ Jaise hi koi comment karta hai (chahe "link", "majak", "tool", "🔥", "❤️" — kuch bhi) —
> **AutoFlow IG automatically us user ko Private DM bhej deta hai** jisme tumhara desired link hota hai.
>
> **Tum so rahe ho, AutoFlow IG kaam kar raha hota hai.**

### 100+ Reels ke saath bhi kaam karta hai:

> **Reel #1** (AI Tool) → keyword "majak" → Link A ka DM
> **Reel #2** (Online Course) → keyword "course" → Link B ka DM
> **Reel #50** (Old Reel) → "Any Comment" mode → Link C ka DM
>
> ✅ Har Reel ka apna campaign hota hai. Webhook mein `media_id` match hoti hai —
> **sirf us reel ka template trigger hota hai, koi cross-mixing nahi.**

---

## 🏆 Kis Tool Ki Takkar Mein Hai?

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
| **Monthly Cost** | **🆓 ₹0 Free** | 💸 ₹1,000–5,000/mo | ₹0 Limited | 💸 ₹3,000+/mo | 💸 ₹2,000+/mo |
| **Self-hosted** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Own Data** | ✅ Yes (Neon DB) | ❌ Their servers | ❌ Their servers | ❌ Their servers | ❌ Their servers |
| **Custom Domain** | ✅ workers.dev | ✅ | ✅ | ✅ | ✅ |
| **Speed** | ⚡ Sub-50ms Edge | ~500ms | ~500ms | ~300ms | ~1000ms |

> **Bottom Line:** ManyChat ka jo kaam ₹1,000–₹5,000/month mein hota hai, AutoFlow IG wahi kaam **₹0 mein** karta hai — apna data apne control mein rakho.

---

## 🚀 Kya-Kya Karta Hai (Features)

### 1. 🎬 Reel Comment → Auto DM (Core Feature)
- Apni Instagram Reel ka link paste karo
- Custom keywords set karo: `majak`, `tool`, `link`, `price`, kuch bhi
- Custom emojis set karo: `🔥`, `❤️`, `👇`, `💯`
- **Jab bhi koi comment karega → user ko automatically Private DM jaayegi** jisme tumhara link hoga
- `{username}` aur `{keyword}` variables DM message mein use kar sakte ho

### 2. 🔄 "Any Comment" Mode — Zero Keyword Required
- Campaign create karte waqt **"Any Comment"** mode select karo
- Ab **koi bhi comment kare — DM chali jaayegi**, chahe comment mein kuch bhi likha ho
- Reel caption mein likho: *"Kuch bhi comment karo, main link DM kar dunga"*
- Keywords daalne ki zarurat bilkul nahi

### 3. 🎯 Per-Reel Campaign Matching (Multi-Reel Support)
- **Problem Solve:** 100+ reels banao — har reel ka apna campaign hoga
- Har campaign mein **Instagram Media ID** store karo
- Jab webhook aata hai → worker `media_id` se exact matching campaign dhundta hai Neon DB mein
- **Sirf us reel ka DM template use hota hai** — koi cross-mixing nahi
- Media ID nahi diya → global defaults use honge (backwards compatible)

### 4. 📸 Story Mention → Auto DM Reward
- Jab koi apni Story mein tumhara account mention kare
- **Automatically usse Thank you DM + CTA button link jaata hai**
- Story mentions ko leads mein convert karo
- Story triggers ko browser se Add / Delete karo

### 5. 👥 Lead Database (Captured Subscribers)
- Har commenter ka Instagram username Neon DB mein save hota hai
- Engagement count track hota hai
- Email capture ready (future feature)
- **CSV Export** — ek click mein saari leads `.csv` mein download
- **Search by username** — bade lead lists ko filter karo
- **Apni email list ki tarah Instagram lead list banao**

### 6. 🤖 AI Smart Auto-Replies (New)
- **Dynamic Human-like DMs:** Use any OpenAI-compatible API (OpenAI, Groq, Claude proxy) to send natural replies.
- **Context Aware:** AI generates the message combining the user's comment, trigger keyword, and your link.
- **Edge Compatible:** Cloudflare worker directly talks to the AI endpoint; no extra DB roundtrip needed for generation.
- **Dynamic Model Fetching:** Instantly fetches available models via the UI.

### 7. 👤 Human Handoff (1-Hour Pause) (New)
- Agar tum manually (browser/app) se kisi ko reply karte ho (which triggers `is_echo: true`), **AutoFlow IG automatically us user ke liye 1 hour ke liye pause ho jaata hai.**
- Taki AI aur tumhara message clash na ho.

### 8. 📊 Stats Dashboard — Live Campaign Overview
- **Total Rules** count
- **Active vs Paused** rules ka breakdown
- **Any-Comment Rules** count
- Live badges — Neon DB se real-time data

### 9. ✏️ Browser-Based Campaign Manager — Full CRUD
- Browser se Reel rules **Add / Edit / Rename / Delete** karo
- **⏸ Pause / ▶ Activate** — campaign band karo bina delete kiye
- **📋 Copy DM** — DM template clipboard mein copy karo (2 sec feedback)
- **🔁 Duplicate** — ek campaign ka copy banao naye reel ke liye
- **🔍 Search** — campaign list mein naam ya keyword se filter karo
- **🔄 Refresh** — list instantly refresh karo
- **Koi coding nahi, koi server nahi — seedha dashboard se manage karo**
- **Admin Password Protection** — sirf tum manage kar sako

### 10. ⚡ Live Keyword Matcher Tester
- Koi bhi comment text daalo → instantly dekho ki DM trigger hogi ya nahi
- Partial, Word, aur Any mode test karo
- Test logs Neon DB mein save hote hain history ke liye

### 11. 🔒 Production Security (15 Layers)
- Bearer Token API authentication (Admin-only actions)
- HMAC-SHA256 Meta Webhook Signature Verification
- Rate limiting per-IP (KV-backed sliding window)
- Replay attack prevention (5-min event age check)
- Input validation + length limits (SQL injection prevention)
- Zlib compression for DM templates in DB
- CORS + Security headers (X-Frame-Options, XSS, HSTS, CSP)
- Self-comment filter (worker apne aap ko DM nahi karta)
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
| **Database** | Neon Postgres (Serverless) | 512MB free, auto-suspend = ₹0 idle cost |
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

> **Kahan milega:** https://console.neon.tech → Project → Connection Details

```
postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> Important: Yeh secret ab **Cloudflare Worker mein bhi set karo** — worker per-reel campaign lookup ke liye Neon DB query karta hai.
>
> ```bash
> wrangler secret put DATABASE_URL
> ```

### 2. VERIFY_TOKEN — Webhook Secret (Tum khud banao)

> Meta aapke webhook URL ko verify karne ke liye yeh token use karta hai.

```
autoflow_webhook_secret_2026
```

### 3. WEBHOOK_APP_SECRET — Meta HMAC Key

> **Kahan milega:** developers.facebook.com/apps → App Settings → Basic → App Secret

```
a1b2c3d4e5f67890123456789abcdef0
```

### 4. IG_ACCESS_TOKEN — Instagram Graph API Token

> **Kahan milega:** developers.facebook.com/tools/explorer
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

## 🚀 Deploy Karo (1 Command)

```bash
# 1. Clone karo
git clone https://github.com/adrianak2026/autoflow-ig-automation.git
cd autoflow-ig-automation

# 2. Dependencies install karo
npm install

# 3. Ek click mein deploy
npm run deploy
```

Yeh automatically:
1. Neon Postgres migrations apply karta hai
2. Cloudflare Worker secrets configure karta hai
3. Worker ko live deploy karta hai

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

Deploy ke baad apna Worker URL milega:
```
https://autoflow-ig-worker.<your-subdomain>.workers.dev/webhook
```

1. Meta Developer Console (developers.facebook.com/apps) kholo
2. **Webhooks** → **Instagram** → **Subscribe**
3. Daalo:
   - **Callback URL**: upar wala URL
   - **Verify Token**: tumhara VERIFY_TOKEN
4. Subscribe fields mein tick karo: `comments`, `messages`, `mention`

---

## Instagram Media ID Kaise Nikale (Per-Reel Matching)

Per-reel matching ke liye har campaign mein Instagram Media ID (numeric) daalna zaroori hai.

### Method 1 — Graph API Explorer (Recommended)

1. developers.facebook.com/tools/explorer kholo
2. Request: `GET /me/media?fields=id,caption,media_type&limit=50`
3. Response mein har Reel/Post ka `"id"` milega → Dashboard mein paste karo

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

Dashboard mein: Campaign banate waqt → **Instagram Media ID** field mein numeric ID paste karo

> **Note:** Media ID nahi diya → sirf global env-var defaults use honge (backward compatible). Sab reels par same DM jaayegi. ID dene par sirf us specific reel ka campaign trigger hota hai.

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

## 🎛️ Dashboard Tabs — Kya Hai Kahan

### Tab 1: Reel Campaign Builder
- Stats cards (Total / Active / Paused / Any-Comment rules)
- Campaign create form with Reel URL, Media ID, Trigger Mode, Keywords, DM Template
- Campaign list with search filter
- Per-card actions: Pause / Activate / Edit / Copy DM / Duplicate / Delete

### Tab 2: Story Mention Auto-DM
- Story trigger rules create karo (naam + DM template + CTA URL)
- Existing rules list with Delete button

### Tab 3: Leads & Subscribers
- Auto-captured Instagram lead table
- Search by username
- Export CSV — download all leads as .csv

### Tab 4: Live Match Tester
- Simulate any comment text
- Test against keyword rules in real-time
- View rendered DM template output
- Test logs saved to Neon DB

### Tab 5: AI Configuration (New)
- Provide Custom Provider, API Key, and Model Name (e.g. OpenAI, Claude, Groq)
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

**Built with love for Indian Creators who want ManyChat power at zero cost**

*AutoFlow IG — Apna data, apna control, zero cost*

</div>
