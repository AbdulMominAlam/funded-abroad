import type { AlertsConfig } from "./types.ts";

/** Build config from environment variables (Deno.env or process.env passed in as a getter). */
export function configFromEnv(get: (k: string) => string | undefined): AlertsConfig {
  const supabaseUrl = (get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const siteUrl = (get("SITE_URL") ?? "").replace(/\/$/, "");
  if (!supabaseUrl) throw new Error("SUPABASE_URL is not set");
  if (!siteUrl) throw new Error("SITE_URL is not set");
  return {
    siteUrl,
    functionsUrl: (get("FUNCTIONS_URL") ?? `${supabaseUrl}/functions/v1`).replace(/\/$/, ""),
    adminEmail: get("ADMIN_EMAIL")?.trim() || null,
    notifyAdminOnConfirm: (get("NOTIFY_ADMIN_ON_CONFIRM") ?? "true").toLowerCase() !== "false",
    hashSalt: get("HASH_SALT") || "funded-abroad",
  };
}
