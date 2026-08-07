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
**You do not need a laptop to do this, everything can be done from your browser!**

### Prerequisites:
1. Create a free Cloudflare account (cloudflare.com).
2. Create a free GitHub account (github.com) and fork this repository.

### Deployment Steps:

**1. Create a Cloudflare KV (Key-Value) Store:**
This is required for Spam Protection (Max 3 DMs/user) and Human Handoff (1-hour pause).
- Go to your Cloudflare Dashboard -> **Storage & Databases** -> **KV**.
- Click **Create a namespace** and name it `KOSH_KV`.
- Save the **Namespace ID** you are given.

**2. Deploy the Worker via GitHub Integration:**
- Go to your Cloudflare Dashboard -> **Workers & Pages** -> **Overview**.
- Click **Create Application** -> **Pages** -> **Connect to Git**.
- Select your forked `autoflow-ig-automation` repository.
- Framework preset: Select `Next.js`.
- Build command: `npm run build`

**3. Set your Environment Variables (Secrets) in Cloudflare:**
Before finishing the deployment, scroll down to **Environment variables (advanced)** and add:
- `META_APP_SECRET`
- `PAGE_ACCESS_TOKEN`
- `IG_PAGE_ID`
- `DATABASE_URL`
- `ADMIN_SECRET_TOKEN`
- Also, go to **KV Namespace Bindings** and bind `KOSH_KV` to the namespace you created in step 1.
- Click **Save and Deploy**.

*(After deployment, you'll get a URL like `https://my-app.pages.dev/api/webhook`. Paste this URL in your Meta Dashboard as the Webhook URL).*

---

## 💻 Step 5: How to Deploy the Frontend (Admin Dashboard)

Your frontend is already deployed along with the backend on Cloudflare Pages.
**Now we need to set up the Database.**

**Initialize the Database (1-Click):**
1. Open your live Admin Dashboard website (e.g. `https://my-app.pages.dev`).
2. Log in using the password you set as `ADMIN_SECRET_TOKEN`.
3. Go to the **"⚙️ Settings & AI"** tab.
4. Scroll down and click the big green **"🚀 Initialize Database Tables"** button.
5. You'll get a popup saying it was successful. That's it, your database is ready!

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

## 🌟 Step 7: Advanced Features

### 1. Soft Follow Gate (Require Follow First)
- You can now require users to follow you before they receive the final DM link.
- **How to use:** In the Admin Dashboard, under "Edit Rule", turn on the **"Require Follow First"** toggle.
- **How it works:** Instead of sending the direct link, the bot sends a psychological "Gate" message with two buttons: `[ Visit Profile ]` and `[ I'm following ✅ ]`. Once they click the second button, the bot instantly delivers the link!

### 2. Smart 7-Day Follow-ups (Cron Job)
- The system automatically follows up with leads who haven't engaged further.
- **How it works:** The Cloudflare worker runs a Cron Trigger that checks your database for users who interacted exactly 7 days ago. It sends them a polite follow-up message. This uses just 0.024% of your daily Cloudflare free tier quota, ensuring 100% free operation!

---

**Congratulations! Your Production-Grade, Encrypted, and Viral-Proof System is live! 🎉**
