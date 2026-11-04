/** Small HTTP helpers shared by the Deno entry points. */
export function corsHeaders(siteUrl: string, origin: string | null): Record<string, string> {
  // Only the configured site (and local dev) may call the functions from a browser.
  const allowed = [siteUrl, "http://localhost:5173", "http://localhost:4173"];
  return {
    "Access-Control-Allow-Origin": origin && allowed.includes(origin) ? origin : siteUrl,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    Vary: "Origin",
  };
}

export function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });
}

export function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
}

/** Best-effort client IP behind Supabase's proxy. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
}
