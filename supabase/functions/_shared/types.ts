/** Shared by the Supabase Edge Functions (Deno) and the Node alerts job. No runtime-specific APIs here. */

export type AlertLevel = "ug" | "masters" | "phd" | "all";
export type Frequency = "weekly" | "none";

/** Preferences a visitor chooses in the "Get deadline alerts" panel. */
export interface AlertPrefs {
  nationality: string | null;
  level: AlertLevel;
  shortlist: string[];
  frequency: Frequency;
  /** 0 = Sunday … 6 = Saturday (UTC). */
  digest_day: number;
  remind_shortlist: boolean;
}

export interface SubscriberRow extends AlertPrefs {
  id: string;
  email: string;
  confirmed: boolean;
  confirmed_at: string | null;
  confirm_token: string | null;
  confirm_sent_at: string | null;
  pending: AlertPrefs | null;
  unsubscribe_token: string;
  created_at: string;
}

export type NotificationKind = "digest" | "reminder14" | "reminder3";

/** Storage used by the functions and the alerts job (Supabase in production, in-memory in tests). */
export interface AlertsStore {
  findByEmail(email: string): Promise<SubscriberRow | null>;
  findByConfirmToken(token: string): Promise<SubscriberRow | null>;
  findByUnsubscribeToken(token: string): Promise<SubscriberRow | null>;
  insertSubscriber(row: Omit<SubscriberRow, "id" | "created_at" | "confirmed_at">): Promise<SubscriberRow>;
  updateSubscriber(id: string, patch: Partial<SubscriberRow>): Promise<void>;
  deleteSubscriber(id: string): Promise<void>;
  countAttempts(field: "ip_hash" | "email_hash", hash: string, sinceIso: string): Promise<number>;
  recordAttempt(ipHash: string, emailHash: string): Promise<void>;
  listConfirmed(): Promise<SubscriberRow[]>;
  /** Dedupe keys already recorded for these subscribers. */
  sentKeys(subscriberIds: string[]): Promise<Map<string, Set<string>>>;
  /** Atomically claim keys before sending; returns the keys that were NOT already taken. */
  claimSent(subscriberId: string, items: { kind: NotificationKind; key: string }[]): Promise<string[]>;
  releaseSent(subscriberId: string, keys: string[]): Promise<void>;
  cleanup(): Promise<void>;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

/** Swap this to change e-mail provider. */
export interface EmailSender {
  send(msg: EmailMessage): Promise<{ id?: string }>;
}

export interface AlertsConfig {
  /** Public site URL, e.g. https://funded-abroad.pages.dev (no trailing slash). */
  siteUrl: string;
  /** Base URL of the Edge Functions, e.g. https://xyz.supabase.co/functions/v1 */
  functionsUrl: string;
  adminEmail: string | null;
  notifyAdminOnConfirm: boolean;
  hashSalt: string;
}
