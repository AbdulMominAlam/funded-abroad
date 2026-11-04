import type { AlertsStore, NotificationKind, SubscriberRow } from "../supabase/functions/_shared/types.ts";

/** In-memory AlertsStore for tests (mirrors the SQL constraints that matter). */
export class MemoryStore implements AlertsStore {
  subs: SubscriberRow[] = [];
  attempts: { ip_hash: string; email_hash: string; at: string }[] = [];
  sent: { subscriber_id: string; kind: NotificationKind; key: string }[] = [];
  cleaned = 0;
  private n = 0;
  constructor(private clock: () => Date = () => new Date()) {}

  async findByEmail(email: string) { return this.subs.find((s) => s.email === email) ?? null; }
  async findByConfirmToken(t: string) { return this.subs.find((s) => s.confirm_token === t) ?? null; }
  async findByUnsubscribeToken(t: string) { return this.subs.find((s) => s.unsubscribe_token === t) ?? null; }
  async insertSubscriber(row: Omit<SubscriberRow, "id" | "created_at" | "confirmed_at">) {
    if (this.subs.some((s) => s.email === row.email)) throw new Error("duplicate email");
    const r: SubscriberRow = { ...row, id: `sub-${++this.n}`, created_at: this.clock().toISOString(), confirmed_at: null };
    this.subs.push(r);
    return r;
  }
  async updateSubscriber(id: string, patch: Partial<SubscriberRow>) {
    const s = this.subs.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
  }
  async deleteSubscriber(id: string) {
    this.subs = this.subs.filter((s) => s.id !== id);
    this.sent = this.sent.filter((x) => x.subscriber_id !== id);
  }
  async countAttempts(field: "ip_hash" | "email_hash", hash: string, since: string) {
    return this.attempts.filter((a) => a[field] === hash && a.at >= since).length;
  }
  async recordAttempt(ip_hash: string, email_hash: string) { this.attempts.push({ ip_hash, email_hash, at: this.clock().toISOString() }); }
  async listConfirmed() { return this.subs.filter((s) => s.confirmed); }
  async sentKeys(ids: string[]) {
    const m = new Map<string, Set<string>>();
    for (const x of this.sent) if (ids.includes(x.subscriber_id)) {
      if (!m.has(x.subscriber_id)) m.set(x.subscriber_id, new Set());
      m.get(x.subscriber_id)!.add(x.key);
    }
    return m;
  }
  async claimSent(id: string, items: { kind: NotificationKind; key: string }[]) {
    const got: string[] = [];
    for (const i of items) if (!this.sent.some((x) => x.subscriber_id === id && x.key === i.key)) {
      this.sent.push({ subscriber_id: id, kind: i.kind, key: i.key });
      got.push(i.key);
    }
    return got;
  }
  async releaseSent(id: string, keys: string[]) { this.sent = this.sent.filter((x) => !(x.subscriber_id === id && keys.includes(x.key))); }
  async cleanup() { this.cleaned++; }
}
