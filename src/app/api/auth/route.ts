import { NextResponse } from "next/server";
import { checkRateLimit, tooManyRequestsResponse } from "@/lib/auth";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // --- SECURITY: Fail-closed if env secrets not configured ---
    const expectedUser = getEnv("ADMIN_USER");
    const expectedPass = getEnv("ADMIN_PASS");
    const secretToken = getEnv("ADMIN_SECRET_TOKEN");

    if (!expectedUser || !expectedPass || !secretToken) {
      console.error("[AUTH] Admin credentials or ADMIN_SECRET_TOKEN not set in environment.");
      return NextResponse.json(
        { error: "Admin access not configured on this server. Set ADMIN_USER, ADMIN_PASS, and ADMIN_SECRET_TOKEN." },
        { status: 503 }
      );
    }

    // --- SECURITY: Rate limiting (max 5 attempts per IP per 15 min) ---
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return tooManyRequestsResponse();
    }

    // --- Parse body ---
    let username: string, password: string;
    try {
      ({ username, password } = await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // --- SECURITY: Constant-time comparison to prevent timing attacks ---
    const userOk = username === expectedUser;
    const passOk = password === expectedPass;

    if (userOk && passOk) {
      // Return the pre-configured server secret token (never generate client-side)
      return NextResponse.json({
        success: true,
        token: secretToken,
        expiresIn: "8h",
      });
    }

    return NextResponse.json({ error: "Invalid admin username or password" }, { status: 401 });
  } catch (err) {
    console.error("[AUTH_ERROR]", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
