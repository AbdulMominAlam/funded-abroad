/**
 * Decides which alert emails each confirmed subscriber should get today. Pure: no I/O, so it's fully unit-tested.
 * Uses the same eligibility and status rules as the website.
 */
import type { Scholarship, StudyLevel } from "../types";
import { getStatus, DAY_MS } from "../status";
import { matchesStudyLevel, resolveEligibility, type Groups } from "../eligibility";
import type { AlertItem } from "../../supabase/functions/_shared/templates.ts";
import type { NotificationKind, SubscriberRow } from "../../supabase/functions/_shared/types.ts";

export const DIGEST_WINDOW_DAYS = 30;

export interface PlannedEmail {
  kind: "digest" | "reminders";
  items: AlertItem[];
  /** Dedupe keys to claim in sent_notifications (one per programme reminder, one per weekly digest). */
  keys: { kind: NotificationKind; key: string }[];
}

/** ISO-8601 week id in UTC, e.g. "2026-W45". */
export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / DAY_MS + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function toItem(s: Scholarship, now: Date): AlertItem {
  const i = getStatus(s, now);
  return {
    id: s.id, name: s.name, host: s.host, deadline: s.deadline!, dlText: s.dlText,
    daysLeft: Math.max(0, i.days), url: s.url, estimated: !!(s.expected || s.varies),
  };
}

/** Programmes a subscriber could apply for (nationality + level), with a deadline within the window. */
export function digestItems(sub: Pick<SubscriberRow, "nationality" | "level">, data: readonly Scholarship[], now: Date, groups: Groups): AlertItem[] {
  const limit = now.getTime() + DIGEST_WINDOW_DAYS * DAY_MS;
  return data
    .filter((s) => s.deadline && matchesStudyLevel(s.levels, sub.level as StudyLevel))
    .filter((s) => resolveEligibility(s.eligibility, sub.nationality, groups).status !== "ineligible")
    .map((s) => ({ s, i: getStatus(s, now) }))
    .filter(({ i }) => i.kind !== "closed" && i.deadline !== null && i.deadline.getTime() <= limit)
    .sort((a, b) => a.i.deadline!.getTime() - b.i.deadline!.getTime())
    .map(({ s }) => toItem(s, now));
}

/**
 * What to send one subscriber now.
 * - Weekly digest: on their weekday (UTC), once per ISO week, only if something is due within 30 days.
 * - Shortlist reminders: once when 14 days or fewer remain (but more than 3), and once when 3 days or fewer remain.
 *   Keys include the deadline, so next year's round is reminded again.
 */
export function planForSubscriber(
  sub: SubscriberRow, data: readonly Scholarship[], byId: ReadonlyMap<string, Scholarship>, now: Date,
  sent: ReadonlySet<string>, groups: Groups,
): PlannedEmail[] {
  const out: PlannedEmail[] = [];
  if (sub.frequency === "weekly" && now.getUTCDay() === sub.digest_day) {
    const key = `digest:${isoWeek(now)}`;
    if (!sent.has(key)) {
      const items = digestItems(sub, data, now, groups);
      if (items.length) out.push({ kind: "digest", items, keys: [{ kind: "digest", key }] });
    }
  }
  if (sub.remind_shortlist && sub.shortlist.length) {
    const items: AlertItem[] = [];
    const keys: PlannedEmail["keys"] = [];
    for (const id of sub.shortlist) {
      const s = byId.get(id);
      if (!s?.deadline) continue;
      const ms = Date.parse(s.deadline) - now.getTime();
      if (ms <= 0) continue;
      const days = Math.ceil(ms / DAY_MS);
      let kind: NotificationKind | null = null;
      if (days <= 3) kind = "reminder3";
      else if (days <= 14) kind = "reminder14";
      if (!kind) continue;
      const key = `${kind}:${id}:${s.deadline}`;
      if (sent.has(key)) continue;
      items.push(toItem(s, now));
      keys.push({ kind, key });
      // A late sign-up inside 3 days gets only the 3-day reminder; mark the 14-day one as done too.
      if (kind === "reminder3") {
        const k14 = `reminder14:${id}:${s.deadline}`;
        if (!sent.has(k14)) keys.push({ kind: "reminder14", key: k14 });
      }
    }
    if (items.length) {
      items.sort((a, b) => a.daysLeft - b.daysLeft);
      out.push({ kind: "reminders", items, keys });
    }
  }
  return out;
}
