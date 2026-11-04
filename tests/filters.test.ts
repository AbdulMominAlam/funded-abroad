import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS, filtersToHash, hashToFilters } from "../src/filters";
import { GROUPS, make, NOW } from "./fixtures";

const data = [
  make({ id: "a", name: "Alpha", fieldCats: ["cs-ai"], region: "europe", deadline: "2027-03-01T00:00:00Z" }),
  make({ id: "b", name: "Bravo", fieldCats: ["any"], region: "east-asia", deadline: "2026-12-01T00:00:00Z", work: true }),
  make({ id: "c", name: "Charlie", fieldCats: ["social"], region: "uk", deadline: "2026-10-01T00:00:00Z", full: false, residencyRequired: true }),
  make({ id: "u", name: "Ug only", levels: ["Undergraduate"], eligibility: { type: "group", group: "african-union" }, deadline: "2027-01-01T00:00:00Z" }),
  make({ id: "p", name: "Phd only", levels: ["PhD"], eligibility: { type: "exclude", countries: ["PK"] }, deadline: "2027-01-01T00:00:00Z" }),
];
const CTXF = { groups: GROUPS };
const run = (f = {}, saved = new Set<string>()) => applyFilters(data, NOW, { ...DEFAULT_FILTERS, ...f }, saved, CTXF);
const ids = (f = {}, saved = new Set<string>()) => run(f, saved).rows.map((r) => r.s.id);

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

describe("nationality and study level", () => {
  it("defaults to Master's", () => expect(ids()).toEqual(["b", "a", "c"]));
  it("study levels", () => {
    expect(ids({ lvl: "ug" })).toEqual(["u"]);
    expect(ids({ lvl: "phd" })).toEqual(["p"]);
    expect(ids({ lvl: "all" })).toEqual(["b", "u", "p", "a", "c"]);
  });
  it("hides programmes the nationality can't apply for and counts them", () => {
    const r = run({ lvl: "all", nat: "PK" });
    expect(r.rows.map((x) => x.s.id)).toEqual(["b", "a", "c"]);
    expect(r.hiddenIneligible).toBe(2);
    expect(run({ lvl: "all", nat: "KE" }).rows.map((x) => x.s.id)).toEqual(["b", "u", "p", "a", "c"]);
  });
  it("shows ineligible ones last when asked, with a reason", () => {
    const r = run({ lvl: "all", nat: "PK", inel: true });
    expect(r.rows.map((x) => x.s.id)).toEqual(["b", "a", "c", "u", "p"]);
    expect(r.rows.at(-1)!.e.status).toBe("ineligible");
    expect(r.rows.at(-1)!.e.reason).toMatch(/PK/);
    expect(r.hiddenIneligible).toBe(0);
  });
  it("residency filter", () => expect(ids({ abroad: true })).toEqual(["b", "a"]));
});

describe("URL hash", () => {
  it("is empty for default filters", () => expect(filtersToHash({ ...DEFAULT_FILTERS })).toBe(""));
  it("round-trips", () => {
    const f = { ...DEFAULT_FILTERS, q: "machine learning", nat: "PK", lvl: "phd" as const, inel: true, status: "open" as const, field: "cs-ai" as const, region: "europe" as const, sort: "name" as const, full: true, saved: true };
    const h = filtersToHash(f);
    expect(h).toMatch(/^#/);
    expect(hashToFilters(h)).toEqual(f);
  });
  it("ignores invalid values", () => {
    expect(hashToFilters("#level=BSc&region=mars&field=x&status=zzz&full=yes&lvl=x")).toEqual(DEFAULT_FILTERS);
    expect(hashToFilters("#nat=ZZ", { countries: new Set(["PK"]) }).nat).toBe("");
  });
  it("understands old v2 level links and uses fallbacks", () => {
    expect(hashToFilters("#level=PhD").lvl).toBe("phd");
    expect(hashToFilters("#level=Internship").lvl).toBe("phd");
    expect(hashToFilters("#nat=pk").nat).toBe("PK");
    expect(hashToFilters("", {}, { nat: "IN", lvl: "ug" })).toMatchObject({ nat: "IN", lvl: "ug" });
    expect(hashToFilters("#nat=PK", {}, { nat: "IN" }).nat).toBe("PK");
  });
});
