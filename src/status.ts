import type { Scholarship } from "./types";

export const DAY_MS = 86_400_000;
export const SOON_DAYS = 30;

export type StatusKind = "open" | "soon" | "upcoming" | "expected" | "varies" | "rolling" | "closed";
/** Coarse grouping used by the status filter. */
export type StatusGroup = "open" | "up" | "closed";

export interface StatusInfo {
  kind: StatusKind;
  group: StatusGroup;
  label: string;
  /** Whole days left (rounded up). Negative or zero once closed. NaN when rolling. */
  days: number;
  /** Milliseconds until the deadline (negative once passed). Infinity when rolling. */
  msLeft: number;
  /** null when the programme has no single deadline (rolling). */
  deadline: Date | null;
  opens: Date | null;
}

const fmtShort = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Parse an `opens` value: a bare YYYY-MM-DD is treated as midnight UTC. */
export function parseOpens(v: string | undefined): Date | null {
  if (!v) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v + "T00:00:00Z" : v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getStatus(s: Scholarship, now: Date): StatusInfo {
  const opensR = parseOpens(s.opens);
  if (s.rolling || !s.deadline) {
    const upcoming = !!opensR && opensR.getTime() > now.getTime();
    return {
      kind: upcoming ? "upcoming" : "rolling",
      group: upcoming ? "up" : "open",
      label: upcoming ? "Opens " + fmtShort.format(opensR!) : "No fixed date",
      days: NaN, msLeft: Infinity, deadline: null, opens: opensR,
    };
  }
  const deadline = new Date(s.deadline);
  const msLeft = deadline.getTime() - now.getTime();
  const days = Math.ceil(msLeft / DAY_MS);
  const opens = parseOpens(s.opens);
  let kind: StatusKind;
  let label: string;
  if (msLeft <= 0) {
    kind = "closed";
    label = "Closed";
  } else if (opens && opens.getTime() > now.getTime()) {
    kind = "upcoming";
    label = "Opens " + fmtShort.format(opens);
  } else if (s.expected) {
    kind = "expected";
    label = "Expected";
  } else if (s.varies) {
    kind = "varies";
    label = "Varies";
  } else if (days <= SOON_DAYS) {
    kind = "soon";
    label = "Closing soon";
  } else {
    kind = "open";
    label = "Open";
  }
  const group: StatusGroup =
    kind === "closed" ? "closed" : kind === "upcoming" || kind === "expected" ? "up" : "open";
  return { kind, group, label, days, msLeft, deadline, opens };
}

/** Big countdown text: "12" + "days left", or hours/minutes in the final 48 hours. */
export function formatCountdown(msLeft: number): { big: string; small: string } {
  if (msLeft <= 0) return { big: "—", small: "closed" };
  if (msLeft >= 2 * DAY_MS) return { big: String(Math.ceil(msLeft / DAY_MS)), small: "days left" };
  const totalMin = Math.floor(msLeft / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return { big: h > 0 ? `${h}h ${m}m` : `${m}m`, small: "left" };
}

/** Sort key: open/upcoming by nearest deadline, then programmes without a fixed date, closed ones last (most recently closed first). */
export function deadlineRank(info: StatusInfo): number {
  if (info.deadline === null) return 1e14;
  return info.kind === "closed" ? 1e15 - info.msLeft : info.msLeft;
}
