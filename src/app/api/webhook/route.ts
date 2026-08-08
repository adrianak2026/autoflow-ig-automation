import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
// @ts-ignore
import workerHandler from "../../../../worker/index.js";


export async function GET(req: NextRequest) {
  try {
    const { env, cf, ctx } = await getCloudflareContext();
    // @ts-ignore - The Cloudflare context wrapper works mostly identically
    return await workerHandler.fetch(req, env, ctx);
  } catch (err: any) {
    console.error("Webhook GET error:", err);
    return new Response("Webhook GET error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { env, cf, ctx } = await getCloudflareContext();
    // @ts-ignore
    return await workerHandler.fetch(req, env, ctx);
  } catch (err: any) {
    console.error("Webhook POST error:", err);
    return new Response("Webhook POST error", { status: 500 });
  }
}
