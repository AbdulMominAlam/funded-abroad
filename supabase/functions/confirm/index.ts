// Supabase Edge Function: GET /functions/v1/confirm?token=…  (Deno) — opened from the confirmation email.
import { handleConfirm } from "../_shared/handlers.ts";
import { SupabaseRestStore } from "../_shared/store.ts";
import { ResendSender } from "../_shared/email.ts";
import { configFromEnv } from "../_shared/config.ts";
import { redirect } from "../_shared/http.ts";

const env = (k: string) => Deno.env.get(k);
const config = configFromEnv(env);
const store = new SupabaseRestStore(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!);
const email = new ResendSender(env("RESEND_API_KEY")!, env("EMAIL_FROM") ?? "Funded Abroad <onboarding@resend.dev>");

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token");
  try {
    const r = await handleConfirm(token, { store, email, config });
    return redirect(r.redirect);
  } catch (e) {
    console.error("confirm failed", e);
    return redirect(`${config.siteUrl}/?alerts=error#alerts`);
  }
});
