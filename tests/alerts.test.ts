import { describe, expect, it, vi } from "vitest";
import { digestItems, isoWeek, planForSubscriber } from "../src/alerts/plan";
import { runAlerts, maskEmail } from "../scripts/alerts/send-alerts";
import { handleConfirm, handleSubscribe, handleUnsubscribe, LIMITS, type Deps } from "../supabase/functions/_shared/handlers.ts";
import { MemorySender, ResendSender } from "../supabase/functions/_shared/email.ts";
import { SupabaseRestStore } from "../supabase/functions/_shared/store.ts";
import { isToken, newToken, normaliseEmail, parseSubscribeBody } from "../supabase/functions/_shared/validate.ts";
import { esc, formatDeadline, renderAdminNotice, renderConfirmEmail, renderDigestEmail, renderReminderEmail, unsubscribeHeaders } from "../supabase/functions/_shared/templates.ts";
import { configFromEnv } from "../supabase/functions/_shared/config.ts";
import type { SubscriberRow } from "../supabase/functions/_shared/types.ts";
import { GROUPS, make } from "./fixtures";
import { MemoryStore } from "./memory-store";

const MONDAY = new Date("2026-11-09T07:00:00Z"); // ISO week 2026-W46, getUTCDay() === 1
const CONFIG = { siteUrl: "https://site.test", functionsUrl: "https://fn.test/functions/v1", adminEmail: "owner@site.test", notifyAdminOnConfirm: true, hashSalt: "salt" };

const DATA = [
  make({ id: "soon", name: "Soon", deadline: "2026-11-12T23:59:00+05:00" }),                 // 4 days
  make({ id: "two-weeks", name: "Two weeks", deadline: "2026-11-20T12:00:00Z" }),            // 12 days
  make({ id: "month", name: "Month", deadline: "2026-12-05T12:00:00Z" }),                    // 27 days
  make({ id: "far", name: "Far", deadline: "2027-03-01T00:00:00Z" }),                        // > 30 days
  make({ id: "closed", name: "Closed", deadline: "2026-10-01T00:00:00Z" }),
  make({ id: "phd", name: "PhD only", levels: ["PhD"], deadline: "2026-11-20T00:00:00Z" }),
  make({ id: "not-pk", name: "Not for PK", eligibility: { type: "exclude", countries: ["PK"] }, deadline: "2026-11-25T00:00:00Z" }),
  make({ id: "africa", name: "Africa only", eligibility: { type: "group", group: "african-union" }, deadline: "2026-11-26T00:00:00Z" }),
  make({ id: "rolling-one", name: "Rolling", rolling: true, deadline: undefined }),
];
const BY_ID = new Map(DATA.map((s) => [s.id, s]));

function sub(over: Partial<SubscriberRow> = {}): SubscriberRow {
  return {
    id: "s1", email: "ayesha@example.com", nationality: "PK", level: "masters", shortlist: [], frequency: "weekly", digest_day: 1,
    remind_shortlist: true, confirmed: true, confirmed_at: null, confirm_token: null, confirm_sent_at: null, pending: null,
    unsubscribe_token: "a".repeat(48), created_at: "2026-11-01T00:00:00Z", ...over,
  };
}

describe("planning: who gets which email when", () => {
  it("isoWeek", () => {
    expect(isoWeek(MONDAY)).toBe("2026-W46");
    expect(isoWeek(new Date("2027-01-01T00:00:00Z"))).toBe("2026-W53");
  });
  it("digest lists eligible, same-level, open programmes due in 30 days, nearest first", () => {
    expect(digestItems(sub(), DATA, MONDAY, GROUPS).map((i) => i.id)).toEqual(["soon", "two-weeks", "month"]);
    expect(digestItems(sub({ nationality: "KE" }), DATA, MONDAY, GROUPS).map((i) => i.id)).toEqual(["soon", "two-weeks", "not-pk", "africa", "month"]);
    expect(digestItems(sub({ level: "phd" }), DATA, MONDAY, GROUPS).map((i) => i.id)).toEqual(["phd"]);
    expect(digestItems(sub({ nationality: null }), DATA, MONDAY, GROUPS)).toHaveLength(5);
  });
  it("sends the digest only on the chosen weekday and once per week", () => {
    expect(planForSubscriber(sub(), DATA, BY_ID, MONDAY, new Set(), GROUPS).map((p) => p.kind)).toEqual(["digest"]);
    expect(planForSubscriber(sub({ digest_day: 3 }), DATA, BY_ID, MONDAY, new Set(), GROUPS)).toEqual([]);
    expect(planForSubscriber(sub(), DATA, BY_ID, MONDAY, new Set(["digest:2026-W46"]), GROUPS)).toEqual([]);
    expect(planForSubscriber(sub({ frequency: "none" }), DATA, BY_ID, MONDAY, new Set(), GROUPS)).toEqual([]);
  });
  it("shortlist reminders at ≤14 days and ≤3 days, deduplicated", () => {
    const s = sub({ frequency: "none", shortlist: ["soon", "two-weeks", "month", "closed", "rolling-one", "unknown-id"] });
    const [p] = planForSubscriber(s, DATA, BY_ID, MONDAY, new Set(), GROUPS);
    expect(p.kind).toBe("reminders");
    expect(p.items.map((i) => [i.id, i.daysLeft])).toEqual([["soon", 4], ["two-weeks", 12]]);
    expect(p.keys.map((k) => k.key)).toEqual([
      "reminder14:soon:2026-11-12T23:59:00+05:00",
      "reminder14:two-weeks:2026-11-20T12:00:00Z",
    ]);
    // already sent → nothing new
    expect(planForSubscriber(s, DATA, BY_ID, MONDAY, new Set(p.keys.map((k) => k.key)), GROUPS)).toEqual([]);
    // three days later "soon" enters the 3-day window → a second, different reminder
    const later = new Date("2026-11-10T12:00:00Z");
    const [p2] = planForSubscriber(s, DATA, BY_ID, later, new Set(p.keys.map((k) => k.key)), GROUPS);
    expect(p2.keys.map((k) => k.key)).toEqual(["reminder3:soon:2026-11-12T23:59:00+05:00"]);
  });
  it("a late sign-up inside 3 days gets only the 3-day reminder", () => {
    const [p] = planForSubscriber(sub({ frequency: "none", shortlist: ["soon"] }), DATA, BY_ID, new Date("2026-11-11T00:00:00Z"), new Set(), GROUPS);
    expect(p.keys.map((k) => k.kind)).toEqual(["reminder3", "reminder14"]);
    expect(p.items).toHaveLength(1);
  });
  it("no reminders when the subscriber turned them off", () => {
    expect(planForSubscriber(sub({ frequency: "none", remind_shortlist: false, shortlist: ["soon"] }), DATA, BY_ID, MONDAY, new Set(), GROUPS)).toEqual([]);
  });
});

describe("runAlerts", () => {
  it("sends, records keys, never sends twice, releases on failure", async () => {
    const store = new MemoryStore(() => MONDAY);
    store.subs.push(sub({ shortlist: ["soon"] }), sub({ id: "s2", email: "ben@example.com", confirmed: false }));
    const sender = new MemorySender();
    const opts = { store, sender, data: DATA, groups: GROUPS, now: MONDAY, siteUrl: CONFIG.siteUrl, functionsUrl: CONFIG.functionsUrl, dryRun: false, log: () => {} };
    const r1 = await runAlerts(opts);
    expect(r1).toEqual({ subscribers: 1, emails: 2, failures: 0 });
    expect(sender.sent.map((m) => m.to)).toEqual(["ayesha@example.com", "ayesha@example.com"]);
    expect(sender.sent[0].headers!["List-Unsubscribe"]).toBe(`<https://fn.test/functions/v1/unsubscribe?token=${"a".repeat(48)}>`);
    expect(store.cleaned).toBe(1);
    const r2 = await runAlerts(opts);
    expect(r2.emails).toBe(0);
    expect(sender.sent).toHaveLength(2);

    const failing = { send: vi.fn().mockRejectedValue(new Error("boom")) };
    const store2 = new MemoryStore(() => MONDAY);
    store2.subs.push(sub());
    const r3 = await runAlerts({ ...opts, store: store2, sender: failing });
    expect(r3.failures).toBe(1);
    expect(store2.sent).toHaveLength(0); // released so tomorrow's run retries
  });
  it("dry-run sends and records nothing", async () => {
    const store = new MemoryStore(() => MONDAY);
    store.subs.push(sub());
    const lines: string[] = [];
    const sender = { send: vi.fn() };
    const r = await runAlerts({ store, sender, data: DATA, groups: GROUPS, now: MONDAY, siteUrl: "https://s", functionsUrl: "https://f", dryRun: true, log: (l) => lines.push(l) });
    expect(r.emails).toBe(1);
    expect(sender.send).not.toHaveBeenCalled();
    expect(store.sent).toHaveLength(0);
    expect(lines[0]).toMatch(/^\[dry-run\] digest → ay\*\*\*@example\.com/);
  });
  it("masks emails in logs", () => expect(maskEmail("someone@x.org")).toBe("so***@x.org"));
});

describe("tokens and input validation", () => {
  it("tokens are 192-bit hex and validated strictly", () => {
    const t = newToken();
    expect(t).toMatch(/^[a-f0-9]{48}$/);
    expect(newToken()).not.toBe(t);
    expect(isToken(t)).toBe(true);
    for (const bad of ["", "abc", t.toUpperCase(), t + "0", "' or 1=1 --", null, 5]) expect(isToken(bad)).toBe(false);
  });
  it("normalises and validates emails", () => {
    expect(normaliseEmail("  Ayesha@Example.COM ")).toBe("ayesha@example.com");
    for (const bad of ["no-at", "a@b", "a b@c.com", "<x>@y.com", "a@-b.com", 7]) expect(normaliseEmail(bad)).toBeNull();
  });
  it("parses the subscribe form", () => {
    const r = parseSubscribeBody({ email: "a@b.co", nationality: "pk", level: "ug", shortlist: ["eth", "BAD ID", "eth"], digest_day: 3 });
    expect(r).toEqual({ ok: true, email: "a@b.co", prefs: { nationality: "PK", level: "ug", shortlist: ["eth"], frequency: "weekly", digest_day: 3, remind_shortlist: true } });
    expect(parseSubscribeBody({ email: "a@b.co", level: "bsc" })).toMatchObject({ ok: false });
    expect(parseSubscribeBody({ email: "a@b.co", website: "spam" })).toMatchObject({ ok: false });
    expect(parseSubscribeBody({ email: "a@b.co", frequency: "none", shortlist: [] })).toMatchObject({ ok: false });
    expect(parseSubscribeBody({ email: "a@b.co", shortlist: ["eth", "x"] }, new Set(["eth"]))).toMatchObject({ ok: true, prefs: { shortlist: ["eth"] } });
  });
});

describe("subscribe / confirm / unsubscribe handlers (double opt-in)", () => {
  const setup = () => {
    let now = new Date("2026-11-04T10:00:00Z");
    const store = new MemoryStore(() => now);
    const email = new MemorySender();
    const deps: Deps = { store, email, config: CONFIG, now: () => now };
    return { store, email, deps, tick: (ms: number) => (now = new Date(now.getTime() + ms)) };
  };
  const tokenFrom = (text: string) => /token=([a-f0-9]{48})/.exec(text)![1];

  it("stores unconfirmed, emails a confirmation link, confirms, notifies the owner once", async () => {
    const { store, email, deps } = setup();
    const r = await handleSubscribe({ email: "Ayesha@Example.com", nationality: "PK", level: "masters" }, "1.2.3.4", deps);
    expect(r).toEqual({ status: 200, body: { ok: true, message: expect.stringMatching(/inbox/) } });
    expect(store.subs[0]).toMatchObject({ email: "ayesha@example.com", confirmed: false, nationality: "PK" });
    expect(email.sent[0].to).toBe("ayesha@example.com");
    const token = tokenFrom(email.sent[0].text);
    expect(store.subs[0].confirm_token).toBe(token);

    const c = await handleConfirm(token, deps);
    expect(c).toEqual({ outcome: "confirmed", redirect: "https://site.test/?alerts=confirmed#alerts" });
    expect(store.subs[0]).toMatchObject({ confirmed: true, confirm_token: null });
    expect(email.sent[1]).toMatchObject({ to: "owner@site.test", subject: "New subscriber: Pakistan, Master's" });
    expect(email.sent[1].text).not.toMatch(/ayesha/); // owner notice doesn't include the address
    expect((await handleConfirm(token, deps)).outcome).toBe("invalid"); // single use
  });
  it("owner notice can be switched off", async () => {
    const { email, deps } = setup();
    deps.config = { ...CONFIG, notifyAdminOnConfirm: false };
    await handleSubscribe({ email: "x@y.co" }, "ip", deps);
    await handleConfirm(tokenFrom(email.sent[0].text), deps);
    expect(email.sent).toHaveLength(1);
  });
  it("confirmation links expire after 7 days", async () => {
    const { email, deps, tick } = setup();
    await handleSubscribe({ email: "x@y.co" }, "ip", deps);
    tick((LIMITS.confirmValidDays + 1) * 86_400_000);
    expect((await handleConfirm(tokenFrom(email.sent[0].text), deps)).outcome).toBe("expired");
  });
  it("an already-confirmed address only changes settings after confirming again", async () => {
    const { store, email, deps } = setup();
    await handleSubscribe({ email: "x@y.co", level: "masters" }, "ip", deps);
    await handleConfirm(tokenFrom(email.sent[0].text), deps);
    await handleSubscribe({ email: "x@y.co", level: "ug" }, "ip2", deps);
    expect(store.subs[0].level).toBe("masters");
    expect(store.subs[0].pending).toMatchObject({ level: "ug" });
    const last = email.sent.at(-1)!;
    expect(last.subject).toMatch(/new .*settings/i);
    expect((await handleConfirm(tokenFrom(last.text), deps)).outcome).toBe("updated");
    expect(store.subs[0]).toMatchObject({ level: "ug", pending: null });
  });
  it("rate-limits by IP and quietly by email, with hashed records only", async () => {
    const { store, email, deps } = setup();
    for (let i = 0; i < LIMITS.perIpPerHour; i++) await handleSubscribe({ email: `u${i}@y.co` }, "9.9.9.9", deps);
    expect((await handleSubscribe({ email: "late@y.co" }, "9.9.9.9", deps)).status).toBe(429);
    expect(JSON.stringify(store.attempts)).not.toMatch(/9\.9\.9\.9|u0@y\.co/);
    const before = email.sent.length;
    for (let i = 0; i < 5; i++) await handleSubscribe({ email: "target@y.co" }, `ip-${i}`, deps);
    expect(email.sent.length - before).toBe(LIMITS.perEmailPerDay);
  });
  it("rejects bad input without storing anything", async () => {
    const { store, deps } = setup();
    expect((await handleSubscribe({ email: "nope" }, "ip", deps)).status).toBe(400);
    expect(store.subs).toHaveLength(0);
  });
  it("unsubscribe deletes the subscriber and history; unknown/invalid tokens are safe", async () => {
    const { store, email, deps } = setup();
    await handleSubscribe({ email: "x@y.co" }, "ip", deps);
    await handleConfirm(tokenFrom(email.sent[0].text), deps);
    store.sent.push({ subscriber_id: store.subs[0].id, kind: "digest", key: "digest:2026-W45" });
    const tok = store.subs[0].unsubscribe_token;
    expect(await handleUnsubscribe(tok, deps)).toEqual({ outcome: "unsubscribed", redirect: "https://site.test/?alerts=unsubscribed#alerts" });
    expect(store.subs).toHaveLength(0);
    expect(store.sent).toHaveLength(0);
    expect((await handleUnsubscribe(tok, deps)).outcome).toBe("unsubscribed");
    expect((await handleUnsubscribe("../../etc", deps)).outcome).toBe("invalid");
  });
});

describe("templates", () => {
  const item = { id: "eth", name: "ETH <Excellence>", host: "ETH", deadline: "2026-11-30T11:59:00+01:00", dlText: "", daysLeft: 3, url: "https://ethz.ch/x?a=1&b=2", estimated: true };
  it("formats deadlines in the programme's own time zone", () => {
    expect(formatDeadline("2026-11-30T11:59:00+01:00")).toBe("30 Nov 2026, 11:59 (UTC+01:00)");
    expect(formatDeadline("2026-11-15T23:59:00-12:00")).toBe("15 Nov 2026, 23:59 (AoE, UTC-12:00)");
    expect(formatDeadline("2026-12-08T16:00:00+00:00")).toBe("8 Dec 2026, 16:00 (UTC)");
  });
  it("digest has html + text, escapes content, includes unsubscribe and official link", () => {
    const m = renderDigestEmail({ items: [item], siteUrl: "https://s", unsubscribeUrl: "https://f/unsubscribe?token=t", nationality: "PK", level: "masters" });
    expect(m.subject).toBe("1 scholarship deadline in the next 30 days");
    expect(m.html).toContain("ETH &lt;Excellence&gt;");
    expect(m.html).not.toContain("<Excellence>");
    expect(m.html).toContain("https://ethz.ch/x?a=1&amp;b=2");
    expect(m.html).toContain("https://f/unsubscribe?token=t");
    expect(m.text).toContain("30 Nov 2026, 11:59 (UTC+01:00) (estimated) — 3 days left");
    expect(m.text).toContain("Unsubscribe and delete my data (one click): https://f/unsubscribe?token=t");
    expect(m.text).toContain("citizens of Pakistan");
  });
  it("reminder subject names the programme when there's one", () => {
    expect(renderReminderEmail({ items: [item], siteUrl: "https://s", unsubscribeUrl: "u" }).subject).toBe("Reminder: ETH <Excellence> closes in 3 days");
  });
  it("confirm and admin emails", () => {
    const c = renderConfirmEmail({ confirmUrl: "https://f/confirm?token=abc", siteUrl: "https://s", nationality: "NG", level: "ug", isUpdate: false });
    expect(c.text).toContain("Undergraduate programmes for citizens of Nigeria");
    expect(c.html).toContain("https://f/confirm?token=abc");
    expect(renderAdminNotice({ nationality: null, level: "phd", siteUrl: "s" }).subject).toBe("New subscriber: any nationality, PhD & research");
    expect(unsubscribeHeaders("https://u")).toEqual({ "List-Unsubscribe": "<https://u>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" });
    expect(esc(`"'&`)).toBe("&quot;&#39;&amp;");
  });
});

describe("providers with mocked fetch (no network)", () => {
  it("ResendSender posts the right payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "re_1" }), { status: 200 }));
    const r = await new ResendSender("re_key", "FA <a@b.co>", fetchMock).send({ to: "x@y.co", subject: "S", html: "<p>h</p>", text: "t", headers: { A: "1" } });
    expect(r.id).toBe("re_1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_key");
    expect(JSON.parse(init.body)).toEqual({ from: "FA <a@b.co>", to: ["x@y.co"], subject: "S", html: "<p>h</p>", text: "t", headers: { A: "1" } });
  });
  it("ResendSender surfaces API errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("bad domain", { status: 422 }));
    await expect(new ResendSender("k", "f", fetchMock).send({ to: "x@y.co", subject: "", html: "", text: "" })).rejects.toThrow(/422/);
  });
  it("SupabaseRestStore uses the service key, PostgREST filters and ignore-duplicates claims", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify([{ dedupe_key: "k1" }]), { status: 201 }));
    const store = new SupabaseRestStore("https://p.supabase.co/", "service-key", fetchMock);
    expect(await store.claimSent("id-1", [{ kind: "digest", key: "k1" }, { kind: "digest", key: "k2" }])).toEqual(["k1"]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://p.supabase.co/rest/v1/sent_notifications?on_conflict=subscriber_id,dedupe_key");
    expect(init.headers).toMatchObject({ apikey: "service-key", Authorization: "Bearer service-key", Prefer: "resolution=ignore-duplicates,return=representation" });
    fetchMock.mockImplementationOnce(async () => new Response("[]", { status: 200 }));
    await store.findByEmail("a+b@c.co");
    expect(fetchMock.mock.calls[1][0]).toBe("https://p.supabase.co/rest/v1/subscribers?email=eq.a%2Bb%40c.co&limit=1");
  });
  it("config reads env vars, admin notice on by default", () => {
    const c = configFromEnv((k) => ({ SUPABASE_URL: "https://p.supabase.co/", SITE_URL: "https://site/" })[k]);
    expect(c).toMatchObject({ siteUrl: "https://site", functionsUrl: "https://p.supabase.co/functions/v1", notifyAdminOnConfirm: true, adminEmail: null });
    expect(configFromEnv((k) => ({ SUPABASE_URL: "u", SITE_URL: "s", NOTIFY_ADMIN_ON_CONFIRM: "false" })[k]).notifyAdminOnConfirm).toBe(false);
    expect(() => configFromEnv(() => undefined)).toThrow(/SUPABASE_URL/);
  });
});
