import type { CountryCode, CountryGroup, Eligibility, Level, Scholarship, StudyLevel } from "./types";
import { STUDY_LEVELS } from "./types";

export type Groups = Readonly<Record<string, CountryGroup>>;

export type EligibilityStatus = "eligible" | "ineligible" | "check" | "unknown";

export interface EligibilityResult {
  status: EligibilityStatus;
  /** Human-readable explanation (shown on greyed-out cards and in compare). */
  reason: string;
}

export type CountryNames = Readonly<Record<CountryCode, string>>;

const name = (c: CountryCode, names?: CountryNames) => names?.[c] ?? c;

/** Expand an eligibility rule to the set of eligible countries (null = everyone / not enumerable). */
export function eligibleCountries(e: Eligibility, groups: Groups): ReadonlySet<CountryCode> | null {
  switch (e.type) {
    case "list": return new Set(e.countries);
    case "group": {
      const g = groups[e.group];
      if (!g) throw new Error(`Unknown country group "${e.group}"`);
      return new Set(g.countries);
    }
    default: return null;
  }
}

/** Can a citizen of `nat` apply? `nat` = null means "no nationality chosen". */
export function resolveEligibility(e: Eligibility, nat: CountryCode | null, groups: Groups, names?: CountryNames): EligibilityResult {
  if (e.type === "check") return { status: nat ? "check" : "unknown", reason: e.note };
  if (!nat) return { status: "unknown", reason: describeEligibility(e, groups, names) };
  switch (e.type) {
    case "all":
      return { status: "eligible", reason: "Open to all nationalities" };
    case "exclude":
      return e.countries.includes(nat)
        ? { status: "ineligible", reason: `Not open to citizens of ${name(nat, names)}` }
        : { status: "eligible", reason: describeEligibility(e, groups, names) };
    case "list":
    case "group": {
      const set = eligibleCountries(e, groups)!;
      return set.has(nat)
        ? { status: "eligible", reason: describeEligibility(e, groups, names) }
        : { status: "ineligible", reason: `Not open to citizens of ${name(nat, names)} (${describeEligibility(e, groups, names)})` };
    }
  }
}

/** Short description of who can apply. */
export function describeEligibility(e: Eligibility, groups: Groups, names?: CountryNames): string {
  switch (e.type) {
    case "all": return "Open to all nationalities";
    case "exclude": return `All nationalities except ${e.countries.map((c) => name(c, names)).join(", ")}`;
    case "group": return `Citizens of: ${groups[e.group]?.name ?? e.group}`;
    case "check": return e.note;
    case "list": {
      const n = e.countries.length;
      if (n <= 6) return `Only citizens of ${e.countries.map((c) => name(c, names)).join(", ")}`;
      return `Only citizens of ${n} listed countries`;
    }
  }
}

export function matchesStudyLevel(levels: readonly Level[], sl: StudyLevel): boolean {
  const want = STUDY_LEVELS[sl].levels;
  return levels.some((l) => want.includes(l));
}

/** Map legacy / free-form level values (old URL hashes) to the study-level picker. */
export function toStudyLevel(v: string | null | undefined): StudyLevel | null {
  if (!v) return null;
  const k = v.toLowerCase();
  if (k === "ug" || k === "undergraduate") return "ug";
  if (k === "masters" || k === "master's") return "masters";
  if (k === "phd" || k === "internship" || k === "research") return "phd";
  if (k === "all") return "all";
  return null;
}

/** Eligibility for one scholarship and nationality, plus the country note if any. */
export function eligibilityFor(s: Scholarship, nat: CountryCode | null, groups: Groups, names?: CountryNames) {
  const r = resolveEligibility(s.eligibility, nat, groups, names);
  return { ...r, countryNote: nat ? s.countryNotes?.[nat] ?? null : null };
}
