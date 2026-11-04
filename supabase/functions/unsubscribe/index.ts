// Supabase Edge Function: GET or POST /functions/v1/unsubscribe?token=…  (Deno)
// GET = the link in every email (one click); POST = RFC 8058 List-Unsubscribe-Post from mail apps.
import { handleUnsubscribe } from "../_shared/handlers.ts";
import { SupabaseRestStore } from "../_shared/store.ts";
import { MemorySender } from "../_shared/email.ts";
import { configFromEnv } from "../_shared/config.ts";
import { redirect } from "../_shared/http.ts";

const env = (k: string) => Deno.env.get(k);
const config = configFromEnv(env);
const store = new SupabaseRestStore(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token");
  try {
    const r = await handleUnsubscribe(token, { store, email: new MemorySender(), config });
    if (req.method === "POST") return new Response("Unsubscribed", { status: 200 });
    return redirect(r.redirect);
  } catch (e) {
    console.error("unsubscribe failed", e);
    return req.method === "POST" ? new Response("Error", { status: 500 }) : redirect(`${config.siteUrl}/?alerts=error#alerts`);
  }
});
