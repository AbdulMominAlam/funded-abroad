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
    abroad: true,
    work: false,
    hec: false,
    fields: "All fields",
    fieldCats: ["any"],
    note: "A note.",
    url: "https://example.org/",
    source: "https://example.org/",
    verifiedOn: "2026-11-04",
    ...over,
  };
}
