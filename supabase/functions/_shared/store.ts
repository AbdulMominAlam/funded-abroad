/** AlertsStore backed by Supabase's REST API (PostgREST) using the service-role key. Works in Deno and Node 18+. */
import type { AlertsStore, NotificationKind, SubscriberRow } from "./types.ts";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class SupabaseRestStore implements AlertsStore {
  private base: string;
  constructor(supabaseUrl: string, private serviceKey: string, private fetchImpl: FetchLike = fetch) {
    this.base = supabaseUrl.replace(/\/$/, "") + "/rest/v1";
  }

  private async req<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
    const headers: Record<string, string> = {
      apikey: this.serviceKey,
      Authorization: `Bearer ${this.serviceKey}`,
      "Content-Type": "application/json",
    };
    if (init.prefer) headers.Prefer = init.prefer;
    const res = await this.fetchImpl(this.base + path, { ...init, headers });
    if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    const t = await res.text();
    return (t ? JSON.parse(t) : null) as T;
  }

  private async one(filter: string): Promise<SubscriberRow | null> {
    const rows = await this.req<SubscriberRow[]>(`/subscribers?${filter}&limit=1`);
    return rows[0] ?? null;
  }

  findByEmail(email: string) { return this.one(`email=eq.${encodeURIComponent(email)}`); }
  findByConfirmToken(token: string) { return this.one(`confirm_token=eq.${encodeURIComponent(token)}`); }
  findByUnsubscribeToken(token: string) { return this.one(`unsubscribe_token=eq.${encodeURIComponent(token)}`); }

  async insertSubscriber(row: Omit<SubscriberRow, "id" | "created_at" | "confirmed_at">): Promise<SubscriberRow> {
    const rows = await this.req<SubscriberRow[]>("/subscribers", { method: "POST", body: JSON.stringify(row), prefer: "return=representation" });
    return rows[0];
  }
  async updateSubscriber(id: string, patch: Partial<SubscriberRow>): Promise<void> {
    await this.req(`/subscribers?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
  }
  async deleteSubscriber(id: string): Promise<void> {
    await this.req(`/subscribers?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  async countAttempts(field: "ip_hash" | "email_hash", hash: string, sinceIso: string): Promise<number> {
    const rows = await this.req<{ id: number }[]>(`/subscribe_attempts?select=id&${field}=eq.${hash}&created_at=gte.${encodeURIComponent(sinceIso)}`);
    return rows.length;
  }
  async recordAttempt(ipHash: string, emailHash: string): Promise<void> {
    await this.req("/subscribe_attempts", { method: "POST", body: JSON.stringify({ ip_hash: ipHash, email_hash: emailHash }) });
  }
  listConfirmed() { return this.req<SubscriberRow[]>("/subscribers?confirmed=eq.true&order=created_at.asc"); }

  async sentKeys(ids: string[]): Promise<Map<string, Set<string>>> {
    const out = new Map<string, Set<string>>();
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      const rows = await this.req<{ subscriber_id: string; dedupe_key: string }[]>(
        `/sent_notifications?select=subscriber_id,dedupe_key&subscriber_id=in.(${chunk.join(",")})`,
      );
      for (const r of rows) {
        if (!out.has(r.subscriber_id)) out.set(r.subscriber_id, new Set());
        out.get(r.subscriber_id)!.add(r.dedupe_key);
      }
    }
    return out;
  }
  async claimSent(subscriberId: string, items: { kind: NotificationKind; key: string }[]): Promise<string[]> {
    if (!items.length) return [];
    // ON CONFLICT DO NOTHING + return=representation → only newly inserted rows come back.
    const rows = await this.req<{ dedupe_key: string }[]>("/sent_notifications?on_conflict=subscriber_id,dedupe_key", {
      method: "POST",
      body: JSON.stringify(items.map((i) => ({ subscriber_id: subscriberId, kind: i.kind, dedupe_key: i.key }))),
      prefer: "resolution=ignore-duplicates,return=representation",
    });
    return rows.map((r) => r.dedupe_key);
  }
  async releaseSent(subscriberId: string, keys: string[]): Promise<void> {
    if (!keys.length) return;
    const list = keys.map((k) => `"${k.replace(/"/g, '\\"')}"`).join(",");
    await this.req(`/sent_notifications?subscriber_id=eq.${subscriberId}&dedupe_key=in.(${encodeURIComponent(list)})`, { method: "DELETE" });
  }
  async cleanup(): Promise<void> {
    await this.req("/rpc/alerts_cleanup", { method: "POST", body: "{}" });
  }
}
