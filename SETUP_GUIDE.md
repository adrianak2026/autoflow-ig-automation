# 🚀 AutoFlow IG - Complete Setup & Deployment Guide

Welcome to the ultimate setup guide for **AutoFlow IG** (Serverless Instagram DM Automation). 

🌐 **Choose your language / अपनी भाषा चुनें:**
- [🇺🇸 Read in English](#-english-version)
- [🇮🇳 Read in Hinglish](#-hinglish-version)

---

<br>

# 🇺🇸 English Version

This guide will walk you through deploying this Instagram DM Automation bot on your own servers (Cloudflare and Neon DB). It's 100% free tier friendly!

## 🛠️ Step 1: Meta (Instagram/Facebook) Setup
To connect Instagram with our bot, we need to create an App on the Meta Developer Portal (developers.facebook.com).

### 1. `META_APP_SECRET`
- **Where to find it:** Meta Developer Dashboard -> App Settings -> Basic. Click 'Show' next to "App Secret" and copy it.
- **What it looks like:** `a1b2c3d4e5f6g7h8i9j0...` (long string of text).
- **Why we need it:** Security. Our Cloudflare Worker uses this to mathematically verify (via HMAC-SHA256) that incoming webhooks are genuinely from Instagram and not from a hacker.

### 2. `IG_PAGE_ID` (Instagram Account ID)
- **Where to find it:** Meta Developer Dashboard -> Graph API Explorer.
- **What it looks like:** `17841400000000000` (long numeric string).
- **Why we need it:** So the bot knows who the "owner" is. If you manually reply to a user, the bot ignores it (Self-comment filter).

### 3. `PAGE_ACCESS_TOKEN`
- **Where to find it:** Meta Developer Dashboard -> Messenger/Instagram API Setup -> Generate Token.
- **What it looks like:** `EAAG...` (very long text).
- **Why we need it:** This acts as the password for the bot to send DMs to users on your behalf.

---

## 🗄️ Step 2: Database Setup (Neon DB)
Go to [Neon.tech](https://neon.tech) and create a free Postgres database.

### 1. `DATABASE_URL`
- **Where to find it:** Neon Dashboard -> Project -> Dashboard -> "Connection Details".
- **What it looks like:** `postgresql://neondb_owner:password123@ep-cool-snowflake-123.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Why we need it:** This stores your Campaigns, Trigger Keywords, and Lead Subscribers permanently.

---

## 🔐 Step 3: Admin Dashboard Security

### 1. `ADMIN_SECRET_TOKEN`
- **Where to find it:** You make it up yourself! Create a strong password.
- **What it looks like:** `MySuperSecretPassword@2026` or `sk_admin_12345`.
- **Why we need it:** This is your master password to login to the Admin Dashboard. It is also used as a cryptographic key to **Encrypt/Lock** your AI API keys in the database.

---

## ☁️ Step 4: How to Deploy on Cloudflare (Backend)

We use **Cloudflare Workers** for the backend because they are free, serverless, and ultra-fast.

### Prerequisites:
1. Install `Node.js` on your computer.
2. Open your Terminal/Command Prompt.
3. Create a Cloudflare account (cloudflare.com).

### Deployment Steps:

**1. Go to the project folder:**
```bash
cd serverless-instagram-dm-automation
```

**2. Create a Cloudflare KV (Key-Value) Store:**
This is required for Spam Protection (Max 3 DMs/user) and Human Handoff (1-hour pause).
```bash
npx wrangler kv:namespace create "KOSH_KV"
```
*You will get an ID (e.g. `id = "123456789abc"`). Open `worker/wrangler.toml` and paste it under `[[kv_namespaces]]`.*

**3. Set your Environment Variables (Secrets):**
You must add your tokens safely to Cloudflare:
```bash
npx wrangler secret put META_APP_SECRET
npx wrangler secret put PAGE_ACCESS_TOKEN
npx wrangler secret put IG_PAGE_ID
npx wrangler secret put DATABASE_URL
npx wrangler secret put ADMIN_SECRET_TOKEN
```
*(The terminal will prompt you for the value one by one. Paste it and press Enter).*

**4. Deploy the Worker:**
```bash
npm run deploy:worker
```
*(After deployment, you'll get a URL like `https://my-worker.username.workers.dev`. Paste this URL in your Meta Dashboard as the Webhook URL).*

---

## 💻 Step 5: How to Deploy the Frontend (Admin Dashboard)

You can deploy the Next.js Frontend easily on **Vercel** or **Cloudflare Pages**.

**For Vercel:**
1. Go to Vercel.com and connect your Github repository.
2. In the deployment settings, add these Environment Variables:
   - `DATABASE_URL` (Your Neon Postgres URL)
   - `ADMIN_SECRET_TOKEN` (Your custom master password)
3. Click **Deploy**.

---

## 🤖 Step 6: AI Keys Setup (From the Dashboard)

You DO NOT need to put AI keys in the code anymore!

1. Open your live Admin Dashboard website.
2. **Login** (Use the password you set as `ADMIN_SECRET_TOKEN`).
3. Go to the **"AI Config"** tab.
4. Enter your API Key (e.g., `sk-proj-...` or `AIzaSy...`).
5. Click **Save**.

*Magic:* Your key is automatically encrypted using your `ADMIN_SECRET_TOKEN` and saved in the Neon Database. If your database ever gets hacked, the hackers will just see gibberish text instead of your real keys!

<br>
<br>

---

<br>
<br>

# 🇮🇳 Hinglish Version

Yeh guide aapko detail mein samjhayegi ki is Instagram DM Automation bot ko apne khud ke servers (Cloudflare aur Neon DB) par kaise chalana hai. Sab kuch free tier me aaram se chalega!

## 🛠️ Step 1: Meta (Instagram/Facebook) ka Setup
Instagram ko bot ke saath jodne ke liye hume Meta for Developers (developers.facebook.com) par ek App banani padti hai.

### 1. `META_APP_SECRET` (App Secret)
- **Kahan se milega?** Meta Developer Dashboard -> App Settings -> Basic. Wahan "App Secret" ka option hoga, use 'Show' par click karke copy karein.
- **Kaisa dikhta hai?** `a1b2c3d4e5f6g7h8i9j0...` (ek lamba code).
- **Kyu chahiye?** Ye security ke liye hai. Cloudflare Worker is code ka use karke mathematically verify karta hai ki jo comment aaya hai, wo sach mein Instagram se hi aaya hai (taaki koi hacker fake request na bhej sake).

### 2. `IG_PAGE_ID` (Instagram Account ID)
- **Kahan se milega?** Meta Developer Dashboard -> API Setup ya Graph API Explorer se. 
- **Kaisa dikhta hai?** `17841400000000000` (ek lamba number).
- **Kyu chahiye?** System ko ye batane ke liye ki "jab main (page owner) khud kisi ko reply karu, to uspar automation run mat karna" (Self-comment filter).

### 3. `PAGE_ACCESS_TOKEN`
- **Kahan se milega?** Meta Developer Dashboard -> Messenger/Instagram API Setup -> Generate Token.
- **Kaisa dikhta hai?** `EAAG...` (bahut bada text).
- **Kyu chahiye?** Isi token ka use karke hamara bot aapki taraf se users ko Private DM bhejta hai.

---

## 🗄️ Step 2: Database ka Setup (Neon DB)
[Neon.tech](https://neon.tech) par jakar ek free Postgres database banayein.

### 1. `DATABASE_URL`
- **Kahan se milega?** Neon Dashboard -> Project -> Dashboard -> "Connection Details" ke andar link milega.
- **Kaisa dikhta hai?** `postgresql://neondb_owner:password123@ep-cool-snowflake-123.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Kyu chahiye?** Ye aapke saare Campaigns, Triggers (Keywords), aur Leads (Subscribers) ko permanently save karke rakhta hai.

---

## 🔐 Step 3: Admin Dashboard Security

### 1. `ADMIN_SECRET_TOKEN`
- **Kahan se milega?** Ye aap khud banayenge! Ek strong password soch lijiye.
- **Kaisa dikhta hai?** `MeraSecretPassword@2026` ya `sk_admin_12345`.
- **Kyu chahiye?** Dashboard me login karne ke liye aur aapke AI API Keys ko **Encrypt (Lock)** karke save karne ke liye. (Hack hone par bhi koi apki AI keys nahi chura sakta).

---

## ☁️ Step 4: Cloudflare par Deploy Kaise Karein? (Backend)

Cloudflare par hum **Cloudflare Workers** ka use karte hain. Ye free aur ultra-fast hote hain.

### Prerequisites (Kya kya chahiye):
1. Apne computer me `Node.js` install karein.
2. Terminal/Command Prompt open karein.
3. Apna Cloudflare account banayein (cloudflare.com).

### Deployment Process:

**1. Project folder me jayein:**
```bash
cd serverless-instagram-dm-automation
```

**2. Cloudflare KV (Key-Value) Store banayein:**
Ye Spam Protection aur "1-Hour Human Handoff Pause" ke liye zaruri hai.
```bash
npx wrangler kv:namespace create "KOSH_KV"
```
*Is command se ek ID milegi (jaise `id = "123456789abc"`). Ise apne `worker/wrangler.toml` file me `[[kv_namespaces]]` ke andar paste kar dein.*

**3. Saare Environment Variables (Keys) set karein:**
Aapko Cloudflare Worker me apne tokens daalne honge taaki wo safely store ho jayein:
```bash
npx wrangler secret put META_APP_SECRET
npx wrangler secret put PAGE_ACCESS_TOKEN
npx wrangler secret put IG_PAGE_ID
npx wrangler secret put DATABASE_URL
npx wrangler secret put ADMIN_SECRET_TOKEN
```
*(Terminal aapse ek-ek karke inki values puchega, wahan paste karke Enter dabayein)*

**4. Worker (Backend) Deploy karein:**
```bash
npm run deploy:worker
```
*(Deploy hone ke baad aapko ek link milega jaise `https://my-worker.username.workers.dev`. Ye link Meta Dashboard me Webhook URL ki jagah dalna hoga).*

---

## 💻 Step 5: Frontend (Admin Dashboard) Deploy Kaise Karein?

Aap ise **Vercel** ya **Cloudflare Pages** par deploy kar sakte hain.

**Vercel ke liye:**
1. Vercel.com par jayein aur apna Github repository connect karein.
2. Deployment settings me jaakar ye 2 Environment Variables add karein:
   - `DATABASE_URL` (Aapka Neon Postgres URL)
   - `ADMIN_SECRET_TOKEN` (Jo password aapne Step 3 me socha tha)
3. **Deploy** par click karein.

---

## 🤖 Step 6: AI Keys ka Setup (Dashboard se)

Ab aapko code me AI keys (OpenAI, Gemini) daalne ki zarurat nahi hai!

1. Apne Admin Dashboard (Live Website) ko open karein.
2. **"Login"** karein (Password wahi hoga jo aapne `ADMIN_SECRET_TOKEN` me rakha tha).
3. **"AI Config"** tab par jayein.
4. Apni API Key dalein (jaise `sk-proj-...` ya `AIzaSy...`).
5. **Save** par click karein. 

*Magic:* Ye key automatically `ADMIN_SECRET_TOKEN` ka use karke encrypt (lock) ho jayegi aur Neon Database me save ho jayegi. Cloudflare worker comment aane par isey automatically unlock karke use karega. 

**Congratulations! Aapka Production-Grade, Encrypted, aur Viral-Proof System live hai! 🎉**
