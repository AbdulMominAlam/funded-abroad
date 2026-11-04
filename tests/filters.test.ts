import { describe, expect, it } from "vitest";
import { applyFilters, countApplicable, DEFAULT_FILTERS, filtersToHash, hashToFilters, hostCountries, paginate } from "../src/filters";
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
    const f = { ...DEFAULT_FILTERS, q: "machine learning", nat: "PK", lvl: "phd" as const, inel: true, status: "open" as const, field: "cs-ai" as const, region: "europe" as const, sort: "name" as const, funding: "full" as const, saved: true };
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

describe("v4 scale filters", () => {
  const big = [
    make({ id: "de1", country: "Germany", deadline: "2026-11-20T00:00:00Z", funding: "salaried" }),
    make({ id: "de2", country: "Germany", deadline: "2027-01-20T00:00:00Z", full: false }),
    make({ id: "jp1", country: "Japan", deadline: "2026-12-20T00:00:00Z" }),
    make({ id: "roll", country: "Japan", rolling: true, deadline: undefined, funding: "paid-internship" }),
    make({ id: "var", country: "France", varies: true, deadline: "2027-03-01T00:00:00Z" }),
  ];
  const run = (f = {}) => applyFilters(big, NOW, { ...DEFAULT_FILTERS, ...f }, new Set(), { groups: GROUPS }).rows.map((r) => r.s.id);
  it("host countries (multi-select)", () => {
    expect(run({ hosts: ["Germany"] })).toEqual(["de1", "de2"]);
    expect(run({ hosts: ["Germany", "France"] }).sort()).toEqual(["de1", "de2", "var"]);
  });
  it("funding type", () => {
    expect(run({ funding: "salaried" })).toEqual(["de1"]);
    expect(run({ funding: "paid-internship" })).toEqual(["roll"]);
    expect(run({ funding: "partial" })).toEqual(["de2"]);
    expect(run({ funding: "full" }).sort()).toEqual(["jp1", "var"]);
  });
  it("deadline within 30/60/90 days (rolling excluded)", () => {
    expect(run({ within: 30 })).toEqual(["de1"]);
    expect(run({ within: 60 })).toEqual(["de1", "jp1"]);
    expect(run({ within: 90 })).toEqual(["de1", "jp1", "de2"]);
  });
  it("rolling / no fixed deadline", () => expect(run({ nofixed: true }).sort()).toEqual(["roll", "var"]));
  it("hash round-trip and legacy full=1", () => {
    const f = { ...DEFAULT_FILTERS, hosts: ["Germany", "United Kingdom"], funding: "salaried" as const, within: 60 as const, nofixed: true };
    expect(hashToFilters(filtersToHash(f))).toEqual(f);
    expect(hashToFilters("#full=1").funding).toBe("full");
    expect(hashToFilters("#within=45&funding=free").within).toBe(0);
  });
  it("pagination, counts and host list", () => {
    const rows = Array.from({ length: 70 }, (_, i) => i);
    expect(paginate(rows, 1)).toEqual({ visible: rows.slice(0, 30), remaining: 40 });
    expect(paginate(rows, 3).remaining).toBe(0);
    expect(paginate(rows, 0).visible).toHaveLength(30);
    expect(countApplicable(big, "PK", "masters", { groups: GROUPS })).toBe(5);
    expect(hostCountries(big)[0]).toEqual({ name: "Germany", count: 2 });
  });
});
