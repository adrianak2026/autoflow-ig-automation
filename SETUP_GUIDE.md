# 🚀 AutoFlow IG - Complete Setup & Deployment Guide (Hinglish)

Yeh guide aapko detail mein samjhayegi ki is Instagram DM Automation bot ko apne khud ke servers (Cloudflare aur Neon) par kaise chalana hai, aur konsi key (chaabi/token) kahan se milegi. Sab kuch free tier me aaram se chalega!

---

## 🛠️ Step 1: Meta (Instagram/Facebook) ka Setup

Instagram ko bot ke saath jodne ke liye hume Meta for Developers (developers.facebook.com) par ek App banani padti hai.

### 1. `META_APP_SECRET` (App Secret)
- **Kahan se milega?** Meta Developer Dashboard -> App Settings -> Basic. Wahan "App Secret" ka option hoga, use 'Show' par click karke copy karein.
- **Kaisa dikhta hai?** `a1b2c3d4e5f6g7h8i9j0...` (ek lamba code).
- **Kyu chahiye?** Ye security ke liye hai. Cloudflare Worker is code ka use karke verify karta hai ki jo comment aaya hai, wo sach mein Instagram se hi aaya hai (taaki koi hacker fake comment na bhej sake).

### 2. `IG_PAGE_ID` (Instagram Account ID)
- **Kahan se milega?** Meta Developer Dashboard -> API Setup ya Graph API Explorer se. 
- **Kaisa dikhta hai?** `17841400000000000` (ek lamba number).
- **Kyu chahiye?** System ko ye batane ke liye ki "jab main (page owner) khud kisi ko reply karu, to uspar automation run mat karna" (Self-comment filter).

### 3. `PAGE_ACCESS_TOKEN`
- **Kahan se milega?** Meta Developer Dashboard -> Messenger/Instagram API Setup -> Generate Token.
- **Kaisa dikhta hai?** `EAAG...` (bahut bada text).
- **Kyu chahiye?** Isi token ka use karke hamara bot Instagram ko command deta hai ki "Is user ko ye DM bhej do". 

---

## 🗄️ Step 2: Database ka Setup (Neon DB)

Neon.tech par jakar ek free Postgres database banayein.

### 1. `DATABASE_URL`
- **Kahan se milega?** Neon Dashboard -> Project -> Dashboard -> "Connection Details" ke andar link milega.
- **Kaisa dikhta hai?** `postgresql://neondb_owner:password123@ep-cool-snowflake-123.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Kyu chahiye?** Ye aapke saare Campaigns, Triggers (Keywords), aur Leads (Subscribers) ko permanently save karke rakhta hai.

---

## 🔐 Step 3: Admin Dashboard Security

### 1. `ADMIN_SECRET_TOKEN`
- **Kahan se milega?** Ye aap khud banayenge! Ek strong password soch lijiye.
- **Kaisa dikhta hai?** `MeraSecretPassword@2026` ya `sk_admin_12345`.
- **Kyu chahiye?** Dashboard me login karne ke liye aur aapke AI API Keys ko **Encrypt (Lock)** karke save karne ke liye. (Hack hone par bhi koi apki keys nahi chura sakta).

---

## ☁️ Step 4: Cloudflare par Deploy Kaise Karein? (Real-Life Deployment)

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

**5. Frontend (Admin Dashboard) Deploy karein:**
Aap ise **Vercel** ya **Cloudflare Pages** par deploy kar sakte hain. Vercel par simply Github repository connect karein aur Settings me jaakar `DATABASE_URL` aur `ADMIN_SECRET_TOKEN` add kar dein.

---

## 🤖 Step 5: AI Keys ka Setup (Dashboard se)

Ab aapko code me AI keys (OpenAI, Gemini) daalne ki zarurat nahi hai!

1. Apne Admin Dashboard (Website) ko open karein.
2. **"Login"** karein (Password wahi hoga jo aapne `ADMIN_SECRET_TOKEN` me rakha tha).
3. **"AI Config"** tab par jayein.
4. Apni API Key dalein (jaise `sk-proj-...` ya `AIzaSy...`).
5. **Save** par click karein. 

*Magic:* Ye key automatically `ADMIN_SECRET_TOKEN` ka use karke encrypt/lock ho jayegi aur Neon Database me save ho jayegi. Cloudflare worker comment aane par isey automatically unlock karke use karega.

---
Bas! Aapka Production-Grade, Encrypted, aur Viral-Proof System live hai! 🎉
