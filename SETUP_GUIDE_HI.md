# 🚀 AutoFlow IG - Complete Setup & Deployment Guide (Hinglish)

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

Cloudflare par hum **Cloudflare Workers / Pages** ka use karte hain. Ye free aur ultra-fast hote hain.
**Sabse achhi baat: Isey aap bina laptop ke, sirf apne mobile browser se bhi kar sakte hain!**

### Prerequisites (Kya kya chahiye):
1. Apna ek free Cloudflare account banayein (cloudflare.com).
2. Apna ek free GitHub account banayein (github.com) aur is repository ko **Fork** karein.

### Deployment Process:

**1. Cloudflare KV (Key-Value) Store banayein:**
Ye Spam Protection aur "1-Hour Human Handoff Pause" ke liye zaruri hai.
- Apne Cloudflare Dashboard me jayein -> **Storage & Databases** -> **KV**.
- **Create a namespace** par click karein aur naam dein `KOSH_KV`.
- Jo **Namespace ID** aayegi, usey copy kar lein.

**2. GitHub ke zarie Deploy karein:**
- Cloudflare Dashboard me wapas jayein -> **Workers & Pages** -> **Overview**.
- **Create Application** -> **Pages** -> **Connect to Git** par click karein.
- Apna forked `autoflow-ig-automation` repository select karein.
- Framework preset me `Next.js` chunein.
- Build command me `npm run build` likha hona chahiye.

**3. Apne Environment Variables (Keys) set karein:**
Deployment khatam karne se pehle, neeche **Environment variables (advanced)** par click karein aur ye sab add karein:
- `META_APP_SECRET`
- `PAGE_ACCESS_TOKEN`
- `IG_PAGE_ID`
- `DATABASE_URL`
- `ADMIN_SECRET_TOKEN`
- Uske baad, **KV Namespace Bindings** me jaakar `KOSH_KV` select karein (jo Step 1 me banaya tha).
- ab **Save and Deploy** par click karein.

*(Deploy hone ke baad aapko ek link milega jaise `https://my-app.pages.dev/api/webhook`. Ye link Meta Dashboard me Webhook URL ki jagah dalna hoga).*

---

## 💻 Step 5: Frontend (Admin Dashboard) ka Database Setup

Aapki website backend ke saath hi Cloudflare Pages par deploy ho gayi hai. 
**Ab bas hume database tables banani hain (1-Click me).**

**Initialize Database (1-Click):**
1. Apni Admin Dashboard ki website open karein (jaise `https://my-app.pages.dev`).
2. **Login** karein (Password wahi hoga jo aapne `ADMIN_SECRET_TOKEN` me rakha tha).
3. **"⚙️ Settings & AI"** tab par jayein.
4. Neeche scroll karein aur hare rang ke **"🚀 Initialize Database Tables"** button par click karein.
5. Agar sab sahi raha to aapko "Success" ka notification aa jayega. Bas, aapka database ready hai!

---

## 🤖 Step 6: AI Keys ka Setup (Dashboard se)

Ab aapko code me AI keys (OpenAI, Gemini) daalne ki zarurat nahi hai!

1. Apne Admin Dashboard (Live Website) ko open karein.
2. **"Login"** karein (Password wahi hoga jo aapne `ADMIN_SECRET_TOKEN` me rakha tha).
3. **"AI Config"** tab par jayein.
4. Apni API Key dalein (jaise `sk-proj-...` ya `AIzaSy...`).
5. **Save** par click karein. 

*Magic:* Ye key automatically `ADMIN_SECRET_TOKEN` ka use karke encrypt (lock) ho jayegi aur Neon Database me save ho jayegi. Cloudflare worker comment aane par isey automatically unlock karke use karega. 

---

## 🌟 Step 7: Advanced Features (Naye Features)

### 1. Honest Follow Gate (Require Follow First)
- Ab aap Meta policies ka 100% palan karte hue, user ko DM link dene se pehle pyaar se Follow karne ke liye keh sakte hain!
- **Kaise use karein:** Admin Dashboard mein, "Edit Rule" ke andar **"Require Follow First"** ka toggle chalu (ON) kar dein.
- **Ye kaise kaam karta hai:** Jab user comment karta hai to bot use ek polite message bhejta hai: *"Hey! Thanks for the comment. Before I send the link, could you please follow the page? (We can't check automatically, but we trust you! 😊)"* jisme do buttons hote hain: `[ Visit Profile ]` aur `[ Send Link ✅ ]`. Jaise hi user "Send Link" click karega, use turant original DM mil jayega! Is tarike se aapka account ban hone se 100% bacha rahega.

### 2. Smart 7-Day Follow-ups (Cron Job)
- System apne aap un logo ko follow-up bhejega jinhone pehle interact kiya tha.
- **Ye kaise kaam karta hai:** Cloudflare Worker ek Cron Job run karta hai jo database check karta hai. Jinhone theek 7 din pehle interact kiya tha aur link check nahi kiya, unhe ye soft follow-up bhejta hai. Ye aapke Cloudflare free limits ka sirf 0.024% use karta hai, matlab 100% Free!

**Congratulations! Aapka Production-Grade, Encrypted, aur Viral-Proof System live hai! 🎉**
