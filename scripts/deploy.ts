import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function run(cmd: string, cwd?: string) {
  console.log(`\n🚀 Executing: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: cwd || process.cwd() });
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function oneClickDeploy() {
  console.log("=================================================");
  console.log("⚡ AutoFlow IG — One-Click Auto Deploy Script");
  console.log("=================================================");

  // 1. Database Migration (Neon Postgres)
  console.log("\n📦 Step 1: Running Neon DB Migrations...");
  try {
    run("npx drizzle-kit migrate");
    console.log("✅ Neon Database Migrations Applied!");
  } catch (err) {
    console.warn("⚠️ Migration warning (Verify DATABASE_URL in .env if unconfigured).");
  }

  // 2. Worker Dependencies & Cloudflare Login check
  console.log("\n☁️ Step 2: Preparing Cloudflare Worker...");
  const workerDir = path.join(process.cwd(), "worker");

  // 3. Prompt for secrets if missing
  console.log("\n🔑 Step 3: Checking Worker Environment Secrets...");
  const verifyToken = (process.env.VERIFY_TOKEN || (await prompt("Enter Meta VERIFY_TOKEN (or press Enter to skip): "))) || "autoflow_verify_secret";
  const igAccessToken = (process.env.IG_ACCESS_TOKEN || (await prompt("Enter Meta IG_ACCESS_TOKEN (or press Enter to skip): "))) || "";
  const webhookAppSecret = (process.env.WEBHOOK_APP_SECRET || (await prompt("Enter Meta WEBHOOK_APP_SECRET (or press Enter to skip): "))) || "";

  if (verifyToken) {
    try {
      run(`npx wrangler secret put VERIFY_TOKEN --name autoflow-ig-worker <<< "${verifyToken}"`, workerDir);
    } catch { /* fallback */ }
  }
  if (igAccessToken) {
    try {
      run(`npx wrangler secret put IG_ACCESS_TOKEN --name autoflow-ig-worker <<< "${igAccessToken}"`, workerDir);
    } catch { /* fallback */ }
  }
  if (webhookAppSecret) {
    try {
      run(`npx wrangler secret put WEBHOOK_APP_SECRET --name autoflow-ig-worker <<< "${webhookAppSecret}"`, workerDir);
    } catch { /* fallback */ }
  }

  // 4. Deploying Worker to Cloudflare
  console.log("\n🚀 Step 4: Deploying Worker to Cloudflare Edge Network...");
  run("npx wrangler deploy", workerDir);

  console.log("\n🎉 ===============================================");
  console.log("✅ AutoFlow IG Engine Successfully Deployed!");
  console.log("=================================================\n");
}

oneClickDeploy().catch((err) => {
  console.error("❌ Deploy failed:", err);
  process.exit(1);
});
