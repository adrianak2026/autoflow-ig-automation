// src/lib/auth.ts — Shared Admin Auth Middleware for all protected API routes
import { NextResponse } from "next/server";

// In-memory rate limiter (resets on Worker restart — acceptable for personal SaaS)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && now < record.resetAt && record.count >= 5) {
    return false; // Blocked
  }
  if (!record || now >= record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    record.count++;
  }
  return true; // Allowed
}

export function verifyAdminToken(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const expectedToken = process.env.ADMIN_SECRET_TOKEN;
  // Fail-closed: if token not configured, deny all
  if (!expectedToken) return false;
  // Constant-time compare to prevent timing attacks
  if (token.length !== expectedToken.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return mismatch === 0;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function tooManyRequestsResponse() {
  return NextResponse.json(
    { error: "Too many login attempts. Try again in 15 minutes." },
    { status: 429 }
  );
}
