/**
 * Safe env utility for Cloudflare Workers + OpenNext
 * process.env alone doesn't work reliably — use getCloudflareContext() instead
 */

let _cfEnv: Record<string, string> | null = null;

function getCloudflareEnv(): Record<string, string> {
  if (_cfEnv) return _cfEnv;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    _cfEnv = (ctx?.env ?? {}) as Record<string, string>;
  } catch {
    _cfEnv = {};
  }
  return _cfEnv;
}

export function getEnv(key: string): string | undefined {
  // process.env first (local dev / build time)
  if (process.env[key]) return process.env[key];
  // Cloudflare Worker bindings at runtime
  return getCloudflareEnv()[key];
}
