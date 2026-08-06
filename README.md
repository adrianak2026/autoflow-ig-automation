# 🤖 AutoFlow IG — Instagram DM Automation SaaS Engine

<div align="center">

**Ek Reel Upload karo → Comment keyword/emoji set karo → Commenters ko automatically Private DM chali jaaye**

[![Deploy Status](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange?logo=cloudflare)](https://workers.cloudflare.com)
[![Database](https://img.shields.io/badge/Database-Neon%20Postgres-green?logo=postgresql)](https://neon.tech)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Free Tier](https://img.shields.io/badge/Cost-100%25%20Free%20Tier-brightgreen)](https://neon.tech)

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

---

## 🏆 Kis Tool Ki Takkar Mein Hai?

| Feature | **AutoFlow IG** | ManyChat | Manychat Free | Respond.io | Zapier |
|---|---|---|---|---|---|
| **Instagram Comment → DM** | ✅ Full | ✅ Full | ⚠️ Limited | ✅ Full | ⚠️ Limited |
| **Custom Keywords** | ✅ Unlimited | ✅ Paid | ❌ No | ✅ Paid | ⚠️ Limited |
| **Custom Emojis Triggers** | ✅ Yes (🔥❤️👇) | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **Story Mention → DM** | ✅ Yes | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
| **Lead Capture Database** | ✅ Neon Postgres | ✅ Paid | ❌ No | ✅ Paid | ❌ No |
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

### 2. 📸 Story Mention → Auto DM Reward
- Jab koi apni Story mein tumhara account mention kare
- **Automatically usse Thank you DM + CTA button link jaata hai**
- Story mentions ko leads mein convert karo

### 3. 👥 Lead Database (Captured Subscribers)
- Har commenter ka Instagram username Neon DB mein save hota hai
- Engagement count track hota hai
- Email capture ready (future feature)
- **Apni email list ki tarah Instagram lead list banao**

### 4. ✏️ Browser-Based Campaign Manager
- Browser se Reel rules **Add / Edit / Rename / Delete** karo
- Koi coding nahi, koi server nahi — seedha dashboard se manage karo
- **Admin Password Protection** — sirf tum manage kar sako

### 5. ⚡ Live Keyword Matcher Tester
- Koi bhi comment text daalo → instantly dekho ki DM trigger hogi ya nahi
- Test logs Neon DB mein save hote hain history ke liye

### 6. 🔒 Production Security
- Bearer Token API authentication
- Rate limiting (brute force protection)
- Input validation + length limits
- CORS + Security headers (X-Frame-Options, XSS protection)
- Fail-closed architecture (secrets not set = app refuses to start)

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

    User->>Instagram: Comments "🔥" on your Reel
    Instagram->>Meta: Sends Comment Event
    Meta->>Worker: POST /webhook (HMAC-SHA256 signed)
    Worker->>Worker: ✅ Verify HMAC Signature
    Worker->>Worker: ✅ Match Keyword "🔥" against your rules
    Worker->>Meta: POST /private_replies → Sends Auto DM with your link
    Worker->>Neon: Log lead (username, keyword, campaign)
    Meta->>User: 📨 User receives Private DM instantly

    Note over Dashboard,Neon: You manage everything from Browser Dashboard
    Dashboard->>Neon: Add/Edit/Delete rules in real-time
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

---

## ⚙️ Setup Guide (5 Environment Variables)

### 1️⃣ `DATABASE_URL` — Neon Postgres Connection

> **Kahan milega:** [console.neon.tech](https://console.neon.tech) → Project → Connection Details

```
postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2️⃣ `VERIFY_TOKEN` — Webhook Secret (Tum khud banao)

> Meta aapke webhook URL ko verify karne ke liye yeh token use karta hai.

```
autoflow_webhook_secret_2026
```

### 3️⃣ `WEBHOOK_APP_SECRET` — Meta HMAC Key

> **Kahan milega:** [developers.facebook.com/apps](https://developers.facebook.com/apps) → App Settings → Basic → App Secret

```
a1b2c3d4e5f67890123456789abcdef0
```

### 4️⃣ `IG_ACCESS_TOKEN` — Instagram Graph API Token

> **Kahan milega:** [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
>
> Required Permissions:
> - `instagram_basic`
> - `instagram_manage_comments`
> - `instagram_manage_messages`
> - `pages_manage_metadata`

```
EAABb...your_long_lived_token
```

### 5️⃣ Admin Credentials (Dashboard Security)

Set these as Cloudflare Worker secrets:

```bash
wrangler secret put ADMIN_USER        # Your admin username
wrangler secret put ADMIN_PASS        # Your admin password
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

---

## 🔗 Meta Webhook Setup

Deploy ke baad apna Worker URL milega:
```
https://autoflow-ig-worker.<your-subdomain>.workers.dev/webhook
```

1. [Meta Developer Console](https://developers.facebook.com/apps) kholo
2. **Webhooks** → **Instagram** → **Subscribe**
3. Daalo:
   - **Callback URL**: upar wala URL
   - **Verify Token**: tumhara `VERIFY_TOKEN`
4. Subscribe fields mein tick karo: `comments`, `messages`, `mention`

---

## 📊 Free Tier Limits

| Service | Free Limit | AutoFlow IG Usage |
|---|---|---|
| Cloudflare Workers | 100,000 req/day | ~1 req per comment → safe for 100K comments/day |
| Neon Postgres | 512 MB storage | Text data only → safe for 500,000+ lead records |
| Meta Graph API | Standard limits | 200 DMs/hour per account |

---

## 📄 License

[MIT License](LICENSE) — Free use, modification, and distribution.

---

<div align="center">

**Built with ❤️ for Indian Creators who want ManyChat power at ₹0 cost**

*AutoFlow IG — Apna data, apna control, zero cost*

</div>
