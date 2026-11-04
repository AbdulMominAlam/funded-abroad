/** "Get deadline alerts" panel. Talks only to the public `subscribe` Edge Function. */
import { STUDY_LEVELS, type StudyLevel } from "../types";
import { esc } from "./dom";

export interface AlertsEnv {
  supabaseUrl?: string;
  anonKey?: string;
}

export function alertsConfigured(env: AlertsEnv): boolean {
  return !!(env.supabaseUrl && /^https:\/\//.test(env.supabaseUrl) && env.anonKey);
}

export const BANNERS: Record<string, { text: string; err?: boolean }> = {
  confirmed: { text: "You're subscribed. Your first deadline alert will arrive on your chosen day." },
  updated: { text: "Your new alert settings are saved." },
  unsubscribed: { text: "You're unsubscribed and your data has been deleted. You won't get any more emails." },
  expired: { text: "That confirmation link has expired. Please sign up again.", err: true },
  invalid: { text: "That link isn't valid (it may already have been used).", err: true },
  error: { text: "Something went wrong. Please try again later.", err: true },
};

export interface SubscribePayload {
  email: string;
  nationality: string | null;
  level: StudyLevel;
  frequency: "weekly" | "none";
  digest_day: number;
  remind_shortlist: boolean;
  shortlist: string[];
  website: string;
}

export function buildPayload(form: {
  email: string; nat: string; lvl: StudyLevel; weekly: boolean; day: number; remind: boolean; shortlist: Iterable<string>; honeypot: string;
}): SubscribePayload {
  return {
    email: form.email.trim(),
    nationality: form.nat || null,
    level: form.lvl,
    frequency: form.weekly ? "weekly" : "none",
    digest_day: form.day,
    remind_shortlist: form.remind,
    shortlist: form.remind ? [...form.shortlist] : [],
    website: form.honeypot,
  };
}

export async function submitSubscription(env: AlertsEnv, payload: SubscribePayload, fetchImpl: typeof fetch = fetch): Promise<{ ok: boolean; message: string }> {
  const res = await fetchImpl(`${env.supabaseUrl!.replace(/\/$/, "")}/functions/v1/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: env.anonKey!, Authorization: `Bearer ${env.anonKey!}` },
    body: JSON.stringify(payload),
  });
  const j = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
  return { ok: res.ok && !!j?.ok, message: j?.message ?? (res.ok ? "Done." : "Something went wrong. Please try again later.") };
}

export function levelOptionsHtml(selected: StudyLevel): string {
  return Object.entries(STUDY_LEVELS).map(([k, v]) => `<option value="${k}"${k === selected ? " selected" : ""}>${esc(v.label)}</option>`).join("");
}
