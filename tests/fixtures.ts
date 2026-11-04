import type { Scholarship } from "../src/types";

export const NOW = new Date("2026-11-04T12:00:00Z");

export function make(over: Partial<Scholarship> = {}): Scholarship {
  return {
    id: "test",
    name: "Test Scholarship",
    host: "Test University",
    country: "Testland",
    region: "europe",
    levels: ["Master's"],
    full: true,
    amount: "Everything",
    deadline: "2027-02-01T23:59:00+01:00",
    dlText: "1 Feb 2027",
    tags: [],
    eligibility: { type: "all" },
    residencyRequired: false,
    work: false,
    nominationBody: null,
    fields: "All fields",
    fieldCats: ["any"],
    note: "A note.",
    url: "https://example.org/",
    source: "https://example.org/",
    verifiedOn: "2026-11-04",
    ...over,
  };
}

import groupsJson from "../src/data/country-groups.json";
import countriesJson from "../src/data/countries.json";
import type { Groups } from "../src/eligibility";
export const GROUPS = groupsJson as Groups;
export const COUNTRY_CODES = new Set(countriesJson.map((c) => c.code));
export const CTX = { countries: COUNTRY_CODES, groups: new Set(Object.keys(groupsJson)) };
