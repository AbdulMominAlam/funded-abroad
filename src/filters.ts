import { FIELD_CATS, FUNDING_TYPES, REGIONS, STUDY_LEVELS, fundingOf, type CountryCode, type FieldCat, type FundingType, type Region, type Scholarship, type StudyLevel } from "./types";
import { hostLabelsOf, normaliseHostFilter } from "./hosts";
import { DAY_MS } from "./status";
import { deadlineRank, getStatus, type StatusInfo } from "./status";
import { eligibilityFor, matchesStudyLevel, toStudyLevel, type CountryNames, type EligibilityResult, type Groups } from "./eligibility";

export type StatusFilter = "" | "open" | "soon" | "up" | "closed";
export type SortKey = "deadline" | "name";

export interface FilterState {
  q: string;
  /** Selected nationality (ISO code) or "" for none. */
  nat: CountryCode | "";
  /** Study level picker. */
  lvl: StudyLevel;
  status: StatusFilter;
  sort: SortKey;
  field: FieldCat | "";
  region: Region | "";
  /** Canonical host-country names (see hosts.ts) or ANY_HOST; empty = any. */
  hosts: string[];
  /** Funding type; "" = any. */
  funding: FundingType | "";
  /** Only deadlines within this many days (0 = any). */
  within: 0 | 30 | 60 | 90;
  /** Only programmes without a single fixed deadline (rolling or varies). */
  nofixed: boolean;
  /** Legacy "fully funded only" chip (kept so old links work; same as funding = "full"). */
  full: boolean;
  /** No need to live in your home country when applying. */
  abroad: boolean;
  nowork: boolean;
  saved: boolean;
  /** Show programmes the selected nationality can't apply for (greyed out). */
  inel: boolean;
}

export const DEFAULT_FILTERS: Readonly<FilterState> = Object.freeze({
  q: "", nat: "", lvl: "masters", status: "", sort: "deadline", field: "", region: "",
  hosts: [] as string[], funding: "", within: 0, nofixed: false,
  full: false, abroad: false, nowork: false, saved: false, inel: false,
});

export interface Row {
  s: Scholarship;
  i: StatusInfo;
  e: EligibilityResult & { countryNote: string | null };
}

export interface FilterContext {
  groups: Groups;
  names?: CountryNames;
  /** Valid country codes (for parsing the URL hash). */
  countries?: ReadonlySet<string>;
}

const STATUS_VALUES: StatusFilter[] = ["", "open", "soon", "up", "closed"];
const BOOL_KEYS = ["full", "abroad", "nowork", "saved", "inel", "nofixed"] as const;
const WITHIN = [30, 60, 90] as const;

const hayCache = new WeakMap<Scholarship, string>();
/** Lower-cased search text for a programme (cached, so typing in the search box stays instant at 500+ entries). */
export function haystack(s: Scholarship): string {
  const hit = hayCache.get(s);
  if (hit !== undefined) return hit;
  const h = buildHaystack(s);
  hayCache.set(s, h);
  return h;
}

function buildHaystack(s: Scholarship): string {
  return [
    s.name, s.host, s.country, REGIONS[s.region], s.fields, ...s.fieldCats.map((f) => FIELD_CATS[f]),
    ...s.levels, ...s.tags, s.note, s.nominationBody ?? "",
  ].join(" ").toLowerCase();
}

/** All filters except eligibility. */
export function matches(row: Row, f: FilterState, shortlist: ReadonlySet<string>, now?: Date): boolean {
  const { s, i } = row;
  if (f.hosts.length && !hostLabelsOf(s.country).some((h) => f.hosts.includes(h))) return false;
  if (f.funding && fundingOf(s) !== f.funding) return false;
  if (f.nofixed && !(s.rolling || s.varies)) return false;
  if (f.within) {
    if (!i.deadline || i.kind === "closed") return false;
    const ref = now?.getTime() ?? Date.now();
    if (i.deadline.getTime() - ref > f.within * DAY_MS) return false;
  }
  if (!matchesStudyLevel(s.levels, f.lvl)) return false;
  if (f.status) {
    if (f.status === "soon") {
      if (i.kind !== "soon") return false;
    } else if (i.group !== f.status) return false;
  }
  // A specific field also matches programmes open to any field; "any" means "open to any field" only.
  if (f.field && !(s.fieldCats.includes(f.field) || (f.field !== "any" && s.fieldCats.includes("any")))) return false;
  if (f.region && s.region !== f.region) return false;
  if (f.full && !s.full) return false;
  if (f.abroad && s.residencyRequired) return false;
  if (f.nowork && s.work) return false;
  if (f.saved && !shortlist.has(s.id)) return false;
  if (f.q) {
    const hay = haystack(s);
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  return true;
}

export interface FilterResult {
  rows: Row[];
  /** Rows hidden only because the selected nationality is ineligible. */
  hiddenIneligible: number;
}

export function applyFilters(
  data: readonly Scholarship[], now: Date, f: FilterState, shortlist: ReadonlySet<string>, ctx: FilterContext,
): FilterResult {
  const nat = f.nat || null;
  let hiddenIneligible = 0;
  const rows: Row[] = [];
  for (const s of data) {
    const row: Row = { s, i: getStatus(s, now), e: eligibilityFor(s, nat, ctx.groups, ctx.names) };
    if (!matches(row, f, shortlist, now)) continue;
    if (row.e.status === "ineligible" && !f.inel) {
      hiddenIneligible++;
      continue;
    }
    rows.push(row);
  }
  const elig = (r: Row) => (r.e.status === "ineligible" ? 1 : 0);
  rows.sort(
    f.sort === "name"
      ? (a, b) => elig(a) - elig(b) || a.s.name.localeCompare(b.s.name)
      : (a, b) => elig(a) - elig(b) || deadlineRank(a.i) - deadlineRank(b.i),
  );
  return { rows, hiddenIneligible };
}

/** Serialise non-default filters into a URL hash ("" when everything is default). */
export function filtersToHash(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.nat) p.set("nat", f.nat);
  if (f.lvl !== DEFAULT_FILTERS.lvl) p.set("lvl", f.lvl);
  if (f.q) p.set("q", f.q);
  if (f.status) p.set("status", f.status);
  if (f.field) p.set("field", f.field);
  if (f.region) p.set("region", f.region);
  if (f.hosts.length) p.set("host", f.hosts.join("|"));
  if (f.funding) p.set("funding", f.funding);
  if (f.within) p.set("within", String(f.within));
  if (f.sort !== "deadline") p.set("sort", f.sort);
  for (const k of BOOL_KEYS) if (f[k]) p.set(k, "1");
  const str = p.toString();
  return str ? "#" + str : "";
}

/**
 * Parse a URL hash into filters, ignoring unknown or invalid values.
 * `fallback` supplies nat/lvl when the hash doesn't (e.g. values remembered in localStorage).
 * Old v2 links (`level=PhD`) are still understood.
 */
export function hashToFilters(hash: string, ctx: Pick<FilterContext, "countries"> = {}, fallback: Partial<Pick<FilterState, "nat" | "lvl">> = {}): FilterState {
  const f: FilterState = { ...DEFAULT_FILTERS, ...fallback };
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  f.q = (p.get("q") ?? "").trim().slice(0, 200);
  const nat = (p.get("nat") ?? "").toUpperCase();
  if (nat && (!ctx.countries || ctx.countries.has(nat))) f.nat = nat;
  const lvl = toStudyLevel(p.get("lvl")) ?? toStudyLevel(p.get("level"));
  if (lvl && lvl in STUDY_LEVELS) f.lvl = lvl;
  const status = p.get("status") as StatusFilter | null;
  if (status && STATUS_VALUES.includes(status)) f.status = status;
  const field = p.get("field");
  if (field && field in FIELD_CATS) f.field = field as FieldCat;
  const region = p.get("region");
  if (region && region in REGIONS) f.region = region as Region;
  const host = p.get("host");
  f.hosts = host ? [...new Set(host.split("|").flatMap(normaliseHostFilter))].slice(0, 50) : [];
  const funding = p.get("funding");
  if (funding && funding in FUNDING_TYPES) f.funding = funding as FundingType;
  const within = Number(p.get("within"));
  if ((WITHIN as readonly number[]).includes(within)) f.within = within as FilterState["within"];
  if (p.get("sort") === "name") f.sort = "name";
  for (const k of BOOL_KEYS) f[k] = p.get(k) === "1";
  if (f.full && !f.funding) f.funding = "full";
  f.full = false;
  return f;
}

export const PAGE_SIZE = 30;

/** First `pages * size` rows, and how many are left. */
export function paginate<T>(rows: readonly T[], pages: number, size = PAGE_SIZE): { visible: T[]; remaining: number } {
  const n = Math.max(1, pages) * size;
  return { visible: rows.slice(0, n), remaining: Math.max(0, rows.length - n) };
}

/** Programmes the nationality can apply for at the chosen level (before the other filters). */
export function countApplicable(data: readonly Scholarship[], nat: CountryCode | "", lvl: StudyLevel, ctx: FilterContext): number {
  return data.filter((s) => matchesStudyLevel(s.levels, lvl) && eligibilityFor(s, nat || null, ctx.groups).status !== "ineligible").length;
}

/** Canonical host countries with programme counts, most common first (a multi-country programme counts for each). */
export function hostCountries(data: readonly Scholarship[]): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const s of data) for (const h of hostLabelsOf(s.country)) m.set(h, (m.get(h) ?? 0) + 1);
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
