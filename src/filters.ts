import { FIELD_CATS, LEVELS, REGIONS, type FieldCat, type Level, type Region, type Scholarship } from "./types";
import { deadlineRank, getStatus, type StatusInfo } from "./status";

export type StatusFilter = "" | "open" | "soon" | "up" | "closed";
export type SortKey = "deadline" | "name";

export interface FilterState {
  q: string;
  level: Level | "";
  status: StatusFilter;
  sort: SortKey;
  field: FieldCat | "";
  region: Region | "";
  full: boolean;
  abroad: boolean;
  nowork: boolean;
  saved: boolean;
}

export const DEFAULT_FILTERS: Readonly<FilterState> = Object.freeze({
  q: "", level: "", status: "", sort: "deadline", field: "", region: "",
  full: false, abroad: false, nowork: false, saved: false,
});

export interface Row {
  s: Scholarship;
  i: StatusInfo;
}

const STATUS_VALUES: StatusFilter[] = ["", "open", "soon", "up", "closed"];
const BOOL_KEYS = ["full", "abroad", "nowork", "saved"] as const;

export function haystack(s: Scholarship): string {
  return [
    s.name, s.host, s.country, REGIONS[s.region], s.fields, ...s.fieldCats.map((f) => FIELD_CATS[f]),
    ...s.levels, ...s.tags, s.note,
  ].join(" ").toLowerCase();
}

export function matches(row: Row, f: FilterState, shortlist: ReadonlySet<string>): boolean {
  const { s, i } = row;
  if (f.level && !s.levels.includes(f.level)) return false;
  if (f.status) {
    if (f.status === "soon") {
      if (i.kind !== "soon") return false;
    } else if (i.group !== f.status) return false;
  }
  // A specific field also matches programmes open to any field; "any" means "open to any field" only.
  if (f.field && !(s.fieldCats.includes(f.field) || (f.field !== "any" && s.fieldCats.includes("any")))) return false;
  if (f.region && s.region !== f.region) return false;
  if (f.full && !s.full) return false;
  if (f.abroad && !s.abroad) return false;
  if (f.nowork && s.work) return false;
  if (f.saved && !shortlist.has(s.id)) return false;
  if (f.q) {
    const hay = haystack(s);
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  return true;
}

export function applyFilters(
  data: readonly Scholarship[], now: Date, f: FilterState, shortlist: ReadonlySet<string>,
): Row[] {
  const rows = data.map((s) => ({ s, i: getStatus(s, now) })).filter((r) => matches(r, f, shortlist));
  rows.sort(
    f.sort === "name"
      ? (a, b) => a.s.name.localeCompare(b.s.name)
      : (a, b) => deadlineRank(a.i) - deadlineRank(b.i),
  );
  return rows;
}

/** Serialise non-default filters into a URL hash ("" when everything is default). */
export function filtersToHash(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.level) p.set("level", f.level);
  if (f.status) p.set("status", f.status);
  if (f.field) p.set("field", f.field);
  if (f.region) p.set("region", f.region);
  if (f.sort !== "deadline") p.set("sort", f.sort);
  for (const k of BOOL_KEYS) if (f[k]) p.set(k, "1");
  const str = p.toString();
  return str ? "#" + str : "";
}

/** Parse a URL hash into filters, ignoring unknown or invalid values. */
export function hashToFilters(hash: string): FilterState {
  const f: FilterState = { ...DEFAULT_FILTERS };
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  f.q = (p.get("q") ?? "").trim().slice(0, 200);
  const level = p.get("level");
  if (level && LEVELS.includes(level as Level)) f.level = level as Level;
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
