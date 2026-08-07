# 🛡️ Meta Developer Policy Compliance

**AutoFlow IG** is designed from the ground up to be **100% compliant** with [Meta's Developer Policies](https://developers.facebook.com/devpolicy/) and the **Messenger / Instagram Messaging API Guidelines**.

This document outlines exactly how our architecture and features align with Meta's rules to ensure your app remains safe, secure, and immune to bans.

---

## 1. User Opt-In & Authentication (Policy 5.2.a)
**Meta Policy:** *Don't contact people in Messenger or Instagram Messaging unless you have obtained legally sufficient consent, permission, and/or opt-in.*

**How We Comply:**
- **No Spam / No Cold Outreach:** The AutoFlow IG bot **never** initiates a conversation on its own. 
- **Implicit Opt-in via Comment:** The bot only sends a Direct Message when a user explicitly comments a specific keyword (or any comment) on your Reel/Post. According to Meta's **24-Hour Standard Messaging Window**, a user commenting on a post is considered a valid opt-in for a business to send a relevant reply via DM within 24 hours.

## 2. Stability & Proper Functionality (Policy 5.1)
**Meta Policy:** *Ensure your App's integration with Messenger and/or Instagram is stable and functions properly. Don't return confusing or nonsensical messages to users or send generic error messages.*

**How We Comply:**
- **Edge Deployment:** The webhook runs on Cloudflare Workers (Edge Network), ensuring sub-50ms response times. It will never timeout or crash under heavy load.
- **Spam Protection (Rate Limiting):** To protect Meta's API from abuse (e.g., if a user comments 100 times on a reel), our system uses Cloudflare KV to track engagement. It strictly limits auto-DMs to a **maximum of 3 messages per user per 24 hours**.
- **Human Handoff (Pause Automation):** If a human admin replies to a user manually via the Instagram app (which triggers `is_echo: true`), the bot automatically pauses automation for that specific user for **1 hour**. This prevents the bot from talking over a human agent.

## 3. Don't Deceive or Mislead (Policy 1.4)
**Meta Policy:** *Don't confuse, deceive, defraud, mislead, spam or surprise anyone.*

**How We Comply:**
- **Honest Follow Gate:** When using the "Require Follow" feature, the bot does **not** perform a fake technical check or lie to the user. Instead, it sends an honest, polite request: *"Before I send the link, could you please follow the page? (We can't check automatically, but we trust you! 😊)"*. The user clicks "Send Link ✅" to proceed. This transparency builds trust and prevents users from reporting the message as deceptive or spam.

## 4. Purchasing or Exchanging Followers (Policy 2.7)
**Meta Policy:** *Don't participate in any program that promotes or facilitates the purchase, sale, or exchange of “Likes”, “Shares”, “Followers”, “Comments”, etc.*

**How We Comply:**
- AutoFlow IG does not offer financial incentives, sell followers, or force artificial engagement. 
- Offering a lead magnet (e.g., "Comment to get a free tool link") is a standard inbound marketing practice explicitly supported and encouraged by Meta for creators and businesses using the Messenger API (similar to official partners like ManyChat).

## 5. Data Privacy & Storage (Policy 4.2.a / 5.2)
**Meta Policy:** *Don’t request or collect personal or other sensitive data from users. Provide an appropriate legally sufficient means for people to request an opt-out.*

**How We Comply:**
- **Minimal Data:** We only store the `ig_sid` (Instagram Scoped ID), `username`, and `timestamp` in the Neon PostgreSQL database. We do not extract or store sensitive personal information like emails, phone numbers, or passwords without explicit external user input.
- **Your Data:** The data is stored in **your** personal Neon Database, not on third-party servers.

---

### Conclusion
By following these strict architectural decisions, **AutoFlow IG** provides enterprise-grade automation while keeping your Instagram Page and Meta Developer Account 100% safe and compliant.
