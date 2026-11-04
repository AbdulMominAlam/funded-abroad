import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isHttpsUrl, isIsoWithTz, validateScholarships } from "../src/validate";
import { make } from "./fixtures";

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
    expect(validateScholarships([make()])).toEqual([]);
  });
  it("reports bad data loudly", () => {
    const bad = { ...make({ id: "a" }), deadline: "2027-01-01", url: "http://x.org", region: "mars", levels: ["BSc"], extra: 1 } as unknown;
    const { name: _n, ...noName } = make({ id: "b" });
    const errs = validateScholarships([bad, noName, make({ id: "a" })]);
    const all = errs.join("\n");
    expect(all).toMatch(/deadline/);
    expect(all).toMatch(/url/);
    expect(all).toMatch(/region/);
    expect(all).toMatch(/unknown level/);
    expect(all).toMatch(/unknown field "extra"/);
    expect(all).toMatch(/"name"/);
    expect(all).toMatch(/duplicate id "a"/);
  });
  it("rejects opens after deadline", () => {
    expect(validateScholarships([make({ opens: "2027-03-01" })]).join()).toMatch(/opens must be before/);
  });
  it("the shipped dataset is valid", () => {
    const data = JSON.parse(readFileSync(new URL("../src/data/scholarships.json", import.meta.url), "utf8"));
    expect(validateScholarships(data)).toEqual([]);
  });
});
