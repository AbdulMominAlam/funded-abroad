/**
 * Daily deadline-alert job (run by .github/workflows/alerts.yml, or by hand).
 *
 *   npx tsx scripts/alerts/send-alerts.ts --dry-run            # print what would be sent (reads Supabase if configured)
 *   npx tsx scripts/alerts/send-alerts.ts --dry-run --sample   # no accounts needed: plans emails for a made-up subscriber
 *   npx tsx scripts/alerts/send-alerts.ts                      # send for real
 *   options: --now=2026-11-30T08:00:00Z  (pretend it's another time)   --to=you@example.com (with --sample: really send the sample to you)
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, SITE_URL, EMAIL_FROM (optional), FUNCTIONS_URL (optional)
 */
import { readFileSync } from "node:fs";
import type { Scholarship } from "../../src/types";
import type { Groups } from "../../src/eligibility";
import { planForSubscriber } from "../../src/alerts/plan";
import { loadAllProgrammes } from "../lib/programmes";
import { renderDigestEmail, renderReminderEmail, unsubscribeHeaders } from "../../supabase/functions/_shared/templates.ts";
import { MemorySender, ResendSender } from "../../supabase/functions/_shared/email.ts";
import { SupabaseRestStore } from "../../supabase/functions/_shared/store.ts";
import type { AlertsStore, EmailSender, SubscriberRow } from "../../supabase/functions/_shared/types.ts";

const readJson = <T>(rel: string): T => JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8")) as T;

export interface RunOptions {
  store: AlertsStore;
  sender: EmailSender;
  data: readonly Scholarship[];
  groups: Groups;
  now: Date;
  siteUrl: string;
  functionsUrl: string;
  dryRun: boolean;
  log?: (line: string) => void;
}

export interface RunSummary {
  subscribers: number;
  emails: number;
  failures: number;
}

/** Plan and send. In dry-run nothing is claimed or sent; planned emails are logged instead. */
export async function runAlerts(o: RunOptions): Promise<RunSummary> {
  const log = o.log ?? console.log;
  const byId = new Map(o.data.map((s) => [s.id, s]));
  const subs = await o.store.listConfirmed();
  const sent = await o.store.sentKeys(subs.map((s) => s.id));
  let emails = 0;
  let failures = 0;
  for (const sub of subs) {
    const plans = planForSubscriber(sub, o.data, byId, o.now, sent.get(sub.id) ?? new Set(), o.groups);
    for (const plan of plans) {
      const unsubscribeUrl = `${o.functionsUrl}/unsubscribe?token=${sub.unsubscribe_token}`;
      const msg = plan.kind === "digest"
        ? renderDigestEmail({ items: plan.items, siteUrl: o.siteUrl, unsubscribeUrl, nationality: sub.nationality, level: sub.level })
        : renderReminderEmail({ items: plan.items, siteUrl: o.siteUrl, unsubscribeUrl });
      const to = sub.email;
      if (o.dryRun) {
        log(`[dry-run] ${plan.kind} → ${maskEmail(to)}: "${msg.subject}" (${plan.items.map((i) => `${i.id} ${i.daysLeft}d`).join(", ")})`);
        if (o.sender instanceof MemorySender) await o.sender.send({ to, ...msg, headers: unsubscribeHeaders(unsubscribeUrl) });
        emails++;
        continue;
      }
      const claimed = await o.store.claimSent(sub.id, plan.keys);
      if (claimed.length === 0) continue; // another run already sent it
      try {
        await o.sender.send({ to, ...msg, headers: unsubscribeHeaders(unsubscribeUrl) });
        emails++;
        log(`sent ${plan.kind} to ${maskEmail(to)} (${plan.items.length} programme${plan.items.length === 1 ? "" : "s"})`);
      } catch (e) {
        failures++;
        await o.store.releaseSent(sub.id, claimed);
        log(`FAILED ${plan.kind} to ${maskEmail(to)}: ${(e as Error).message}`);
      }
    }
  }
  if (!o.dryRun) await o.store.cleanup();
  return { subscribers: subs.length, emails, failures };
}

export function maskEmail(e: string): string {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}***@${d ?? ""}`;
}

/** A read-only fake store with one sample subscriber, for trying the job without any accounts. */
export function sampleStore(email = "sample@example.com", shortlist: string[] = [], now = new Date()): AlertsStore {
  const sub: SubscriberRow = {
    id: "00000000-0000-4000-8000-000000000000", email, nationality: "PK", level: "masters", shortlist, frequency: "weekly",
    digest_day: now.getUTCDay(), remind_shortlist: true, confirmed: true, confirmed_at: null, confirm_token: null,
    confirm_sent_at: null, pending: null, unsubscribe_token: "0".repeat(48), created_at: new Date().toISOString(),
  };
  const noop = async () => {};
  return {
    findByEmail: async () => null, findByConfirmToken: async () => null, findByUnsubscribeToken: async () => null,
    insertSubscriber: async () => sub, updateSubscriber: noop, deleteSubscriber: noop, countAttempts: async () => 0, recordAttempt: noop,
    listConfirmed: async () => [sub], sentKeys: async () => new Map(), claimSent: async (_id, items) => items.map((i) => i.key),
    releaseSent: noop, cleanup: noop,
  };
}

async function main(): Promise<void> {
  const args = new Map(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? "true"] as const; }));
  const dryRun = args.has("dry-run");
  const sample = args.has("sample");
  const now = args.has("now") ? new Date(args.get("now")!) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error("--now must be an ISO date");
  const env = process.env;
  const siteUrl = (env.SITE_URL ?? "https://example.org").replace(/\/$/, "");
  const data: Scholarship[] = loadAllProgrammes();
  const groups = readJson<Groups>("../../src/data/country-groups.json");

  let store: AlertsStore;
  let functionsUrl: string;
  if (sample) {
    const soon = data.filter((s) => s.deadline && Date.parse(s.deadline) > now.getTime()).sort((a, b) => Date.parse(a.deadline!) - Date.parse(b.deadline!)).slice(0, 2).map((s) => s.id);
    store = sampleStore(args.get("to") ?? "sample@example.com", soon, now);
    functionsUrl = (env.FUNCTIONS_URL ?? `${env.SUPABASE_URL ?? "https://YOUR-PROJECT.supabase.co"}/functions/v1`).replace(/\/$/, "");
  } else {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Alerts are not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing). Nothing to do. See SETUP.md.");
      return;
    }
    store = new SupabaseRestStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    functionsUrl = (env.FUNCTIONS_URL ?? `${env.SUPABASE_URL.replace(/\/$/, "")}/functions/v1`).replace(/\/$/, "");
  }

  let sender: EmailSender;
  const reallySend = !dryRun && (!sample || args.has("to"));
  if (reallySend) {
    if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing (or use --dry-run).");
    sender = new ResendSender(env.RESEND_API_KEY, env.EMAIL_FROM ?? "Funded Abroad <onboarding@resend.dev>");
  } else sender = new MemorySender();

  const summary = await runAlerts({ store, sender, data, groups, now, siteUrl, functionsUrl, dryRun: !reallySend });
  console.log(`${dryRun || !reallySend ? "[dry-run] " : ""}${summary.subscribers} subscriber(s), ${summary.emails} email(s)${summary.failures ? `, ${summary.failures} failed` : ""}.`);
  if (!reallySend && sender instanceof MemorySender && args.has("print")) {
    for (const m of sender.sent) console.log(`\n--- ${m.subject}\n${m.text}`);
  }
  if (summary.failures) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
