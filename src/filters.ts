import { FIELD_CATS, REGIONS, STUDY_LEVELS, type CountryCode, type FieldCat, type Region, type Scholarship, type StudyLevel } from "./types";
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
const BOOL_KEYS = ["full", "abroad", "nowork", "saved", "inel"] as const;

export function haystack(s: Scholarship): string {
  return [
    s.name, s.host, s.country, REGIONS[s.region], s.fields, ...s.fieldCats.map((f) => FIELD_CATS[f]),
    ...s.levels, ...s.tags, s.note, s.nominationBody ?? "",
  ].join(" ").toLowerCase();
}

/** All filters except eligibility. */
export function matches(row: Row, f: FilterState, shortlist: ReadonlySet<string>): boolean {
  const { s, i } = row;
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
    if (!matches(row, f, shortlist)) continue;
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
  if (p.get("sort") === "name") f.sort = "name";
  for (const k of BOOL_KEYS) f[k] = p.get(k) === "1";
  return f;
}
