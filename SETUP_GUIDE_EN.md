# 🚀 AutoFlow IG - Complete Setup & Deployment Guide

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

---

**Congratulations! Your Production-Grade, Encrypted, and Viral-Proof System is live! 🎉**
