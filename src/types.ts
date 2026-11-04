/** Study levels a programme funds. */
export type Level = "Undergraduate" | "Master's" | "PhD" | "Internship";

/** The study-level picker: "phd" covers PhD and research internships. */
export type StudyLevel = "ug" | "masters" | "phd" | "all";

/** ISO 3166-1 alpha-2 country code (plus XK for Kosovo). */
export type CountryCode = string;

/**
 * Who can apply, by nationality.
 * - all: any nationality
 * - list: only these nationalities
 * - exclude: any nationality except these
 * - group: a named group from src/data/country-groups.json (only when the official source defines it that way)
 * - check: eligibility is a long official country list we could not reproduce reliably; the card asks you to check
 */
export type Eligibility =
  | { type: "all" }
  | { type: "list"; countries: CountryCode[] }
  | { type: "exclude"; countries: CountryCode[] }
  | { type: "group"; group: string }
  | { type: "check"; note: string };

export interface CountryGroup {
  name: string;
  source: string;
  countries: CountryCode[];
}

/** Region used by the region filter. */
export type Region =
  | "europe"
  | "uk"
  | "east-asia"
  | "middle-east"
  | "north-america"
  | "oceania"
  | "turkiye"
  | "global";

/** Broad field categories used by the field filter. */
export type FieldCat =
  | "cs-ai" // computer science, AI, ML, data science
  | "engineering"
  | "sciences" // natural sciences and maths
  | "social" // social sciences, economics, policy, development
  | "any"; // open to (almost) any field

export interface Scholarship {
  /** Unique, URL-safe id (lowercase letters, digits, hyphens). */
  id: string;
  name: string;
  host: string;
  /** Country (or "Europe (multi-country)", "Any (you choose)"). */
  country: string;
  region: Region;
  levels: Level[];
  /** true = fully funded; false = partial funding. */
  full: boolean;
  /** Human-readable amount. Use "check official page" if unknown. */
  amount: string;
  /** When applications open: YYYY-MM-DD or ISO date-time with offset. */
  opens?: string;
  /** Deadline as ISO 8601 with an explicit offset, e.g. 2026-11-30T23:59:00+01:00. */
  deadline: string;
  /** Human-readable deadline text shown on the card. */
  dlText: string;
  /** Deadline is estimated from the last cycle (not yet published). */
  expected?: boolean;
  /** Deadline varies by course/university; the date is a representative one. */
  varies?: boolean;
  /** Shown instead of the countdown when the round is closed. */
  nextText?: string;
  /** Requirements / key facts shown as tags. */
  tags: string[];
  /** Nationalities that can apply. */
  eligibility: Eligibility;
  /** You must live in your home country (country of citizenship) when you apply. */
  residencyRequired: boolean;
  /** Work experience required. */
  work: boolean;
  /** Who must nominate you, if anyone (e.g. "Your national scholarship agency", "Your university"); null if you apply directly. */
  nominationBody: string | null;
  /** Notes for applicants of a particular nationality, keyed by country code (e.g. {"PK": "Apply on the HEC portal as well"}). */
  countryNotes?: Record<CountryCode, string>;
  /** Free-text fields description. */
  fields: string;
  fieldCats: FieldCat[];
  note: string;
  /** Official programme page. */
  url: string;
  /** Official page the dates/amounts were verified against. */
  source: string;
  /** Date (YYYY-MM-DD) the entry was last checked against the source. */
  verifiedOn: string;
  /** Extra programme-specific checklist items. */
  checklist?: string[];
}

export const LEVELS: readonly Level[] = ["Undergraduate", "Master's", "PhD", "Internship"];

export const STUDY_LEVELS: Record<StudyLevel, { label: string; levels: readonly Level[] }> = {
  ug: { label: "Undergraduate", levels: ["Undergraduate"] },
  masters: { label: "Master's", levels: ["Master's"] },
  phd: { label: "PhD & research", levels: ["PhD", "Internship"] },
  all: { label: "All levels", levels: ["Undergraduate", "Master's", "PhD", "Internship"] },
};

export const REGIONS: Record<Region, string> = {
  europe: "Europe",
  uk: "United Kingdom",
  "east-asia": "East & Southeast Asia",
  "middle-east": "Middle East",
  "north-america": "North America",
  oceania: "Oceania",
  turkiye: "Türkiye",
  global: "Global / any country",
};

export const FIELD_CATS: Record<FieldCat, string> = {
  "cs-ai": "CS / AI / data",
  engineering: "Engineering",
  sciences: "Natural sciences & maths",
  social: "Social sciences & development",
  any: "Any field",
};
