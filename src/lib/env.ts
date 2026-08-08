/**
 * Safe env utility for Cloudflare Workers + OpenNext
 * process.env alone doesn't work reliably — use getCloudflareContext() instead
 */

export function getEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    return ctx?.env?.[key];
  } catch {
    return undefined;
  }
}
