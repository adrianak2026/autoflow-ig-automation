# 🛡️ Meta Developer Policy & Security Compliance Architecture

**AutoFlow IG** is architected to operate strictly within the boundaries of the [Meta Developer Policies](https://developers.facebook.com/devpolicy/) and the **Instagram Graph API / Messenger API guidelines**. 

This document serves as a comprehensive technical and policy analysis, demonstrating how the system safeguards Meta's ecosystem, respects user privacy, and ensures 100% compliance.

---

## 1. Quality & Trustworthy Product (Policy Section 1)

**Meta Policy 1.2:** *Ensure that your App’s content... meets our Community Standards.*
**Meta Policy 1.4:** *Don’t confuse, deceive, defraud, mislead, spam or surprise anyone.*

**Technical Implementation:**
- **Honest Follow Gate:** The system previously utilized a psychological "gate" that could be interpreted as a fake technical check. To ensure strict compliance with Policy 1.4, this was completely overhauled. The system now sends an **Honest & Polite Request**: *"Hey! Thanks for the comment. Before I send the link, could you please follow the page? (We can't check automatically, but we trust you! 😊)"* followed by a `[ Send Link ✅ ]` button. This eliminates deception.
- **Predictable Behavior:** Users commenting on a Reel with a specific keyword expect a DM containing a link. The webhook delivers *exactly* what is promised in the Reel caption, fulfilling the user's expectation without surprises.

---

## 2. Proper Use & Opt-In (Policy Section 2 & 5.2)

**Meta Policy 5.2.a (Opt-in):** *Don't contact people in Messenger or Instagram Messaging unless you... have obtained legally sufficient consent, permission, and/or opt-in.*

**Technical Implementation:**
- **Standard Messaging Window (24-Hour Rule):** Meta defines a user commenting on a Facebook Page or Instagram Professional account's post as a valid interaction that opens a 24-hour standard messaging window.
- **Strict Webhook Triggers:** The Cloudflare Worker *only* executes `sendDirectMessage()` in response to an incoming `messages` or `comments` webhook event payload originating from the user. 
- **No Cold Outreach:** The bot cannot and does not initiate conversations. There is no background job scraping users to send unsolicited DMs.

---

## 3. Stability & API Rate Limiting (Policy Section 3.6 & 5.1)

**Meta Policy 5.1:** *Ensure your App's integration... is stable and functions properly. Don't return confusing or nonsensical messages...*
**Meta Policy 3.6:** *We may take enforcement action on Apps that adversely affect the stability of Meta’s servers...*

**Technical Implementation:**
- **Cloudflare Edge Network:** The webhook receiver operates on Cloudflare Workers, meaning it scales infinitely. It acknowledges Meta's webhooks (HTTP 200 OK) within milliseconds, preventing Meta's servers from retrying failed requests.
- **Spam Protection (Max 3 DMs Limit):** If a malicious user attempts to spam a Reel by commenting 100 times, the bot does not blindly echo 100 API calls back to Meta. We use Cloudflare KV (`KOSH_KV`) to maintain an atomic counter. The system enforces a strict limit: **A single user will receive a maximum of 3 automated DMs within a 24-hour period**. This aggressively protects Meta's Graph API rate limits.
- **Human Handoff (1-Hour Pause):** If a human admin replies to a user via the Instagram app, Meta sends an `is_echo: true` webhook. The worker detects this and immediately writes a 1-hour expiration flag to KV. For the next 60 minutes, the bot will silently ignore that user, preventing "bot-vs-human" message loops.

---

## 4. Artificial Engagement Prevention (Policy Section 2.7)

**Meta Policy 2.7:** *Don't participate in any program that promotes or facilitates the purchase, sale, or exchange of “Likes”, “Shares”, “Followers”, “Comments”...*

**Technical Implementation:**
- The system does not participate in engagement rings, nor does it financially incentivize users to comment.
- Providing a "Lead Magnet" (e.g., "Comment PDF and I will DM you the link") is an officially recognized and permitted inbound marketing strategy under Meta's guidelines. The transaction is a value exchange (Content for a Keyword), not the artificial purchase of metrics.

---

## 5. Permissions and Data Privacy

**Meta Policy 4.2.a:** *Don't request or collect personal or other sensitive data from users...*

**Technical Implementation:**
- **Minimal Permissions:** The app only requests the bare minimum permissions required for operation:
  - `instagram_basic` (To read profile info of the page)
  - `instagram_manage_messages` (To send the DM)
  - `instagram_manage_comments` (To read the incoming trigger comment)
  - `pages_show_list`, `pages_read_engagement` (Required for authentication flow)
- **Data Minimization:** The Neon PostgreSQL database schema `leads` table only stores:
  - `ig_sid` (Scoped ID, not a global identifier)
  - `username`
  - `last_engaged_at` (Timestamp)
- **No PII Stored:** The system does not attempt to scrape, extract, or store real names, phone numbers, emails, or personal chat histories.

---

### Security Audit Status
- **Authentication:** All API calls are authenticated using short-lived tokens and secure HMAC SHA-256 webhook signature verification (validating the `X-Hub-Signature-256` header against the `META_APP_SECRET`).
- **Secret Management:** Meta Access Tokens are AES-256 encrypted at rest in the Neon Database and decrypted in RAM only during execution on Cloudflare Workers.

By adhering to this strict technical architecture, **AutoFlow IG** represents an enterprise-grade, White-Hat implementation of the Instagram Messaging API.
