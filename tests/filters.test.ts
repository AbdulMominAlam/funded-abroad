import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS, filtersToHash, hashToFilters } from "../src/filters";
import { make, NOW } from "./fixtures";

const data = [
  make({ id: "a", name: "Alpha", fieldCats: ["cs-ai"], region: "europe", deadline: "2027-03-01T00:00:00Z" }),
  make({ id: "b", name: "Bravo", fieldCats: ["any"], region: "east-asia", deadline: "2026-12-01T00:00:00Z", work: true }),
  make({ id: "c", name: "Charlie", fieldCats: ["social"], region: "uk", deadline: "2026-10-01T00:00:00Z", full: false, abroad: false }),
];
const ids = (f = {}, saved = new Set<string>()) => applyFilters(data, NOW, { ...DEFAULT_FILTERS, ...f }, saved).map((r) => r.s.id);

describe("applyFilters", () => {
  it("sorts by nearest deadline with closed last", () => expect(ids()).toEqual(["b", "a", "c"]));
  it("sorts by name", () => expect(ids({ sort: "name" })).toEqual(["a", "b", "c"]));
  it("field filter includes 'any field' programmes", () => expect(ids({ field: "cs-ai" })).toEqual(["b", "a"]));
  it("'any' field filter shows only any-field programmes", () => expect(ids({ field: "any" })).toEqual(["b"]));
  it("region filter", () => expect(ids({ region: "uk" })).toEqual(["c"]));
  it("flags", () => {
    expect(ids({ full: true })).toEqual(["b", "a"]);
    expect(ids({ abroad: true })).toEqual(["b", "a"]);
    expect(ids({ nowork: true })).toEqual(["a", "c"]);
  });
  it("status filters", () => {
    expect(ids({ status: "closed" })).toEqual(["c"]);
    expect(ids({ status: "soon" })).toEqual(["b"]);
    expect(ids({ status: "open" })).toEqual(["b", "a"]);
  });
  it("shortlist", () => expect(ids({ saved: true }, new Set(["c"]))).toEqual(["c"]));
  it("search matches every word", () => {
    expect(ids({ q: "bravo testland" })).toEqual(["b"]);
    expect(ids({ q: "east asia" })).toEqual(["b"]);
    expect(ids({ q: "zzz" })).toEqual([]);
  });
});

describe("URL hash", () => {
  it("is empty for default filters", () => expect(filtersToHash({ ...DEFAULT_FILTERS })).toBe(""));
  it("round-trips", () => {
    const f = { ...DEFAULT_FILTERS, q: "machine learning", level: "PhD" as const, status: "open" as const, field: "cs-ai" as const, region: "europe" as const, sort: "name" as const, full: true, saved: true };
    const h = filtersToHash(f);
    expect(h).toMatch(/^#/);
    expect(hashToFilters(h)).toEqual(f);
  });
  it("ignores invalid values", () => {
    expect(hashToFilters("#level=BSc&region=mars&field=x&status=zzz&full=yes")).toEqual(DEFAULT_FILTERS);
  });
});
