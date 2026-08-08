# Privacy Policy for AutoDM Assistant

**Effective Date:** 2026-08-08

Thank you for using AutoDM Assistant ("the App"). This Privacy Policy explains how we collect, use, and protect your information when you use our Instagram automated messaging service.

## 1. Information We Collect
When you connect your Facebook Page and Instagram Professional Account to the App, we request access to the following information via the Meta Graph API:
- **Public Profile Information:** Name and profile picture.
- **Instagram Direct Messages:** We require access to read incoming messages to detect specific trigger keywords and send automated replies.
- **Comments (Optional):** If configured, we may read comments on your posts to send automated DM replies.

**Note:** We **do not** collect, store, or process your passwords, payment information, or personal emails.

## 2. How We Use Your Information
The App functions strictly as an automation tool. We use your data exclusively to:
- Monitor incoming messages/comments for specific keywords you define.
- Automatically reply to users on your behalf.

We **do not** use your messages for advertising, tracking, or training AI models.

## 3. Data Storage and Security
- **No Permanent Storage:** We do not save your followers' messages or profile details in any permanent database. Messages are processed in real-time (via Cloudflare Workers) and immediately discarded from memory.
- **Token Security:** Your Meta Access Tokens are securely stored as encrypted environment variables.

## 4. Third-Party Sharing
We do not sell, rent, or share your data with any third parties. Data is only exchanged between your Instagram account and Meta's official Graph API servers.

## 5. User Data Deletion Instructions
If you wish to stop using the App and remove our access to your data, you can do so at any time:
1. Go to your Facebook Settings -> **Security and Login** -> **Business Integrations**.
2. Find **AutoDM Assistant** in the list.
3. Click **Remove** to instantly revoke all permissions.

If you have any questions or require manual data deletion, please contact the developer via the GitHub repository or the email provided in the App Dashboard.
