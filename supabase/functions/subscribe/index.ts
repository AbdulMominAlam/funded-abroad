// Supabase Edge Function: POST /functions/v1/subscribe  (Deno)
import { handleSubscribe } from "../_shared/handlers.ts";
import { SupabaseRestStore } from "../_shared/store.ts";
import { ResendSender } from "../_shared/email.ts";
import { configFromEnv } from "../_shared/config.ts";
import { clientIp, corsHeaders, json } from "../_shared/http.ts";

const env = (k: string) => Deno.env.get(k);
const config = configFromEnv(env);
const store = new SupabaseRestStore(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!);
const email = new ResendSender(env("RESEND_API_KEY")!, env("EMAIL_FROM") ?? "Funded Abroad <onboarding@resend.dev>");

Deno.serve(async (req) => {
  const cors = corsHeaders(config.siteUrl, req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { ok: false, message: "Use POST." }, cors);
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) return json(413, { ok: false, message: "Request too large." }, cors);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, message: "Invalid JSON." }, cors);
  }
  try {
    const r = await handleSubscribe(body, clientIp(req), { store, email, config });
    return json(r.status, r.body, cors);
  } catch (e) {
    console.error("subscribe failed", e);
    return json(500, { ok: false, message: "Something went wrong. Please try again later." }, cors);
  }
});
