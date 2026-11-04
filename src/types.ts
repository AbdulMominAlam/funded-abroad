/** Study levels a programme funds. */
export type Level = "Master's" | "PhD" | "Internship";

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
  /** Can apply while living outside Pakistan (false = must reside in Pakistan). */
  abroad: boolean;
  /** Work experience required. */
  work: boolean;
  /** Requires HEC (Higher Education Commission of Pakistan) nomination. */
  hec: boolean;
  /** Requires nomination by your university/department/supervisor (you cannot apply directly). */
  nomination?: boolean;
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

export const LEVELS: readonly Level[] = ["Master's", "PhD", "Internship"];

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
