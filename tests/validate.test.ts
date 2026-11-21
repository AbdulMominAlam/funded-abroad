import { loadAllProgrammes } from "../scripts/lib/programmes";
import { describe, expect, it } from "vitest";
import { isHttpsUrl, isIsoWithTz, validateScholarships } from "../src/validate";
import { CTX, make as baseMake } from "./fixtures";
import type { Scholarship } from "../src/types";

/** Validator tests need a canonical host-country name. */
const make = (over: Partial<Scholarship> = {}) => baseMake({ country: "Germany", ...over });

describe("validators", () => {
  it("accepts ISO dates with time zones only", () => {
    expect(isIsoWithTz("2026-11-30T11:59:00+01:00")).toBe(true);
    expect(isIsoWithTz("2026-11-30T11:59Z")).toBe(true);
    expect(isIsoWithTz("2026-11-30T11:59:00")).toBe(false);
    expect(isIsoWithTz("2026-11-30")).toBe(false);
    expect(isIsoWithTz("2026-02-30T10:00:00+01:00")).toBe(false);
    expect(isIsoWithTz("2026-11-30T25:00:00+01:00")).toBe(false);
  });
  it("accepts https URLs only", () => {
    expect(isHttpsUrl("https://ethz.ch/x")).toBe(true);
    expect(isHttpsUrl("http://ethz.ch/x")).toBe(false);
    expect(isHttpsUrl("ethz.ch")).toBe(false);
    expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("validateScholarships", () => {
  it("passes a good entry", () => {
    expect(validateScholarships([make()], CTX)).toEqual([]);
  });
  it("reports bad data loudly", () => {
    const bad = { ...make({ id: "a" }), deadline: "2027-01-01", url: "http://x.org", region: "mars", levels: ["BSc"], extra: 1 } as unknown;
    const { name: _n, ...noName } = make({ id: "b" });
    const errs = validateScholarships([bad, noName, make({ id: "a" })], CTX);
    const all = errs.join("\n");
    expect(all).toMatch(/deadline/);
    expect(all).toMatch(/url/);
    expect(all).toMatch(/region/);
    expect(all).toMatch(/unknown level/);
    expect(all).toMatch(/unknown field "extra"/);
    expect(all).toMatch(/"name"/);
    expect(all).toMatch(/duplicate id "a"/);
  });
  it("validates eligibility rules", () => {
    const errs = validateScholarships([
      make({ id: "a", eligibility: { type: "list", countries: ["PK", "ZZ"] } }),
      make({ id: "b", eligibility: { type: "group", group: "nope" } }),
      make({ id: "c", eligibility: { type: "exclude", countries: [] } }),
      make({ id: "d", eligibility: { type: "check", note: "" } }),
      make({ id: "e", eligibility: { type: "weird" } as never }),
      make({ id: "f", countryNotes: { XX: "hi" } }),
      make({ id: "g", nominationBody: "" }),
    ], CTX).join("\n");
    expect(errs).toMatch(/\(a\).*unknown country code "ZZ"/);
    expect(errs).toMatch(/\(b\).*group "nope"/);
    expect(errs).toMatch(/\(c\).*non-empty array/);
    expect(errs).toMatch(/\(d\).*note/);
    expect(errs).toMatch(/\(e\).*type must be one of/);
    expect(errs).toMatch(/\(f\).*countryNotes: unknown country code "XX"/);
    expect(errs).toMatch(/\(g\).*nominationBody/);
    expect(validateScholarships([make({ eligibility: { type: "group", group: "asean" } })], CTX)).toEqual([]);
  });
  it("requires a deadline unless rolling, and forbids one when rolling", () => {
    const { deadline: _d, ...noDl } = make({ id: "a" });
    expect(validateScholarships([noDl], CTX).join()).toMatch(/missing deadline/);
    expect(validateScholarships([{ ...noDl, rolling: true }], CTX)).toEqual([]);
    expect(validateScholarships([make({ rolling: true })], CTX).join()).toMatch(/rolling programme has no single deadline/);
  });
  it("rejects opens after deadline", () => {
    expect(validateScholarships([make({ opens: "2027-03-01" })], CTX).join()).toMatch(/opens must be before/);
  });
  it("the shipped dataset is valid", () => {
    expect(validateScholarships(loadAllProgrammes(), CTX)).toEqual([]);
  });
});

describe("host-country names", () => {
  it("flags non-canonical country text", () => {
    const errs = validateScholarships([
      make({ id: "a", country: "UK" }),
      make({ id: "b", country: "Europe (multi-country)" }),
      make({ id: "c", country: "Germany / UAE" }),
      make({ id: "d", country: "Germany (Berlin" }),
      make({ id: "e", country: "any (offices)" }),
    ], CTX).join("\n");
    expect(errs).toMatch(/\(a\).*canonical name "United Kingdom" instead of "UK"/);
    expect(errs).toMatch(/\(b\).*"Europe" is not a canonical country name/);
    expect(errs).toMatch(/\(c\).*"United Arab Emirates" instead of "UAE"/);
    expect(errs).toMatch(/\(d\).*qualifier/);
    expect(errs).toMatch(/\(e\).*write "Any"/);
  });
  it("accepts canonical forms", () => {
    const ok = ["United Kingdom", "Hong Kong", "Côte d’Ivoire (and regional offices)", "Germany / United Kingdom", "Any", "Any (UNDP offices worldwide)", "Austria (multi-country)"];
    expect(validateScholarships(ok.map((country, i) => make({ id: `ok${i}`, name: `N${i}`, country })), CTX)).toEqual([]);
  });
});
