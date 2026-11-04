/**
 * Request handlers for the Edge Functions, written against small interfaces so they run (and are tested)
 * in Node as well as Deno. The Deno entry points in ../<name>/index.ts only wire up env vars and HTTP.
 */
import type { AlertsConfig, AlertsStore, EmailSender } from "./types.ts";
import { isToken, newToken, parseSubscribeBody, sha256Hex } from "./validate.ts";
import { renderAdminNotice, renderConfirmEmail } from "./templates.ts";

export interface Deps {
  store: AlertsStore;
  email: EmailSender;
  config: AlertsConfig;
  now?: () => Date;
}

export const LIMITS = { perIpPerHour: 5, perEmailPerDay: 3, confirmValidDays: 7 } as const;

export interface HandlerResult {
  status: number;
  body: { ok: boolean; message: string };
}

const GENERIC_OK = "Check your inbox for a confirmation email (and your spam folder).";

/** POST /subscribe — validate, rate-limit, store unconfirmed, send double opt-in email. Never reveals whether an address is subscribed. */
export async function handleSubscribe(body: unknown, ip: string, deps: Deps): Promise<HandlerResult> {
  const now = (deps.now ?? (() => new Date()))();
  const parsed = parseSubscribeBody(body);
  if (!parsed.ok) return { status: 400, body: { ok: false, message: parsed.error } };
  const { email, prefs } = parsed;
  const { store, config } = deps;

  const ipHash = await sha256Hex(`${config.hashSalt}|ip|${ip}`);
  const emailHash = await sha256Hex(`${config.hashSalt}|email|${email}`);
  const hourAgo = new Date(now.getTime() - 3_600_000).toISOString();
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
  if ((await store.countAttempts("ip_hash", ipHash, hourAgo)) >= LIMITS.perIpPerHour) {
    return { status: 429, body: { ok: false, message: "Too many attempts. Please try again in an hour." } };
  }
  const emailAttempts = await store.countAttempts("email_hash", emailHash, dayAgo);
  await store.recordAttempt(ipHash, emailHash);
  // Quietly stop sending more confirmation emails to the same address (protects people from being spammed).
  if (emailAttempts >= LIMITS.perEmailPerDay) return { status: 200, body: { ok: true, message: GENERIC_OK } };

  const token = newToken();
  const existing = await store.findByEmail(email);
  let isUpdate = false;
  if (!existing) {
    await store.insertSubscriber({
      email, ...prefs, confirmed: false, confirm_token: token, confirm_sent_at: now.toISOString(), pending: null, unsubscribe_token: newToken(),
    });
  } else if (!existing.confirmed) {
    await store.updateSubscriber(existing.id, { ...prefs, confirm_token: token, confirm_sent_at: now.toISOString() });
  } else {
    // Already confirmed: keep current settings until the owner of the inbox confirms the change.
    isUpdate = true;
    await store.updateSubscriber(existing.id, { pending: prefs, confirm_token: token, confirm_sent_at: now.toISOString() });
  }
  const confirmUrl = `${config.functionsUrl}/confirm?token=${token}`;
  const msg = renderConfirmEmail({ confirmUrl, siteUrl: config.siteUrl, nationality: prefs.nationality, level: prefs.level, isUpdate });
  await deps.email.send({ to: email, ...msg });
  return { status: 200, body: { ok: true, message: GENERIC_OK } };
}

export type ConfirmOutcome = "confirmed" | "updated" | "expired" | "invalid";

/** GET /confirm?token=… — confirm a sign-up (or apply pending new settings). Returns where to redirect. */
export async function handleConfirm(token: unknown, deps: Deps): Promise<{ outcome: ConfirmOutcome; redirect: string }> {
  const now = (deps.now ?? (() => new Date()))();
  const go = (outcome: ConfirmOutcome) => ({ outcome, redirect: `${deps.config.siteUrl}/?alerts=${outcome}#alerts` });
  if (!isToken(token)) return go("invalid");
  const sub = await deps.store.findByConfirmToken(token);
  if (!sub) return go("invalid");
  const sentAt = sub.confirm_sent_at ? Date.parse(sub.confirm_sent_at) : 0;
  if (now.getTime() - sentAt > LIMITS.confirmValidDays * 86_400_000) {
    await deps.store.updateSubscriber(sub.id, { confirm_token: null, pending: null });
    return go("expired");
  }
  if (sub.confirmed && sub.pending) {
    await deps.store.updateSubscriber(sub.id, { ...sub.pending, pending: null, confirm_token: null });
    return go("updated");
  }
  const first = !sub.confirmed;
  await deps.store.updateSubscriber(sub.id, { confirmed: true, confirmed_at: now.toISOString(), confirm_token: null, pending: null });
  if (first && deps.config.notifyAdminOnConfirm && deps.config.adminEmail) {
    try {
      await deps.email.send({ to: deps.config.adminEmail, ...renderAdminNotice({ nationality: sub.nationality, level: sub.level, siteUrl: deps.config.siteUrl }) });
    } catch {
      /* the owner notice is best-effort; never block a confirmation on it */
    }
  }
  return go("confirmed");
}

/** GET or POST /unsubscribe?token=… — one click: deletes the subscriber and their send history. */
export async function handleUnsubscribe(token: unknown, deps: Deps): Promise<{ outcome: "unsubscribed" | "invalid"; redirect: string }> {
  const go = (outcome: "unsubscribed" | "invalid") => ({ outcome, redirect: `${deps.config.siteUrl}/?alerts=${outcome}#alerts` });
  if (!isToken(token)) return go("invalid");
  const sub = await deps.store.findByUnsubscribeToken(token);
  if (!sub) return go("unsubscribed"); // already gone: same answer, nothing to reveal
  await deps.store.deleteSubscriber(sub.id);
  return go("unsubscribed");
}
