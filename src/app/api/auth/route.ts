import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USER || "admin";
    const expectedPass = process.env.ADMIN_PASS || "autoflow2026";

    if (username === expectedUser && password === expectedPass) {
      return NextResponse.json({ success: true, token: "autoflow_authenticated_session" });
    }

    return NextResponse.json({ error: "Invalid admin username or password" }, { status: 401 });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
