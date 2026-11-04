import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { describeEligibility, eligibilityFor, eligibleCountries, matchesStudyLevel, resolveEligibility, toStudyLevel } from "../src/eligibility";
import { validateGroups } from "../src/validate";
import type { Scholarship } from "../src/types";
import { COUNTRY_CODES, GROUPS, make } from "./fixtures";

const NAMES = { PK: "Pakistan", IN: "India", FR: "France" };

describe("resolveEligibility", () => {
  it("all", () => {
    expect(resolveEligibility({ type: "all" }, "PK", GROUPS).status).toBe("eligible");
  });
  it("list", () => {
    const e = { type: "list" as const, countries: ["PK", "IN"] };
    expect(resolveEligibility(e, "IN", GROUPS).status).toBe("eligible");
    const r = resolveEligibility(e, "FR", GROUPS, NAMES);
    expect(r.status).toBe("ineligible");
    expect(r.reason).toBe("Not open to citizens of France (Only citizens of Pakistan, India)");
  });
  it("exclude", () => {
    const e = { type: "exclude" as const, countries: ["FR"] };
    expect(resolveEligibility(e, "PK", GROUPS).status).toBe("eligible");
    expect(resolveEligibility(e, "FR", GROUPS, NAMES)).toEqual({ status: "ineligible", reason: "Not open to citizens of France" });
  });
  it("group", () => {
    const e = { type: "group" as const, group: "commonwealth" };
    expect(resolveEligibility(e, "PK", GROUPS).status).toBe("eligible");
    expect(resolveEligibility(e, "FR", GROUPS).status).toBe("ineligible");
    expect(resolveEligibility({ type: "group", group: "african-union" }, "KE", GROUPS).status).toBe("eligible");
    expect(resolveEligibility({ type: "group", group: "asean" }, "TL", GROUPS).status).toBe("eligible");
    expect(() => resolveEligibility({ type: "group", group: "nope" }, "PK", GROUPS)).toThrow(/Unknown country group/);
  });
  it("check", () => {
    expect(resolveEligibility({ type: "check", note: "See list" }, "PK", GROUPS)).toEqual({ status: "check", reason: "See list" });
  });
  it("no nationality chosen = unknown, never hidden", () => {
    for (const e of [{ type: "all" as const }, { type: "list" as const, countries: ["PK"] }, { type: "check" as const, note: "x" }]) {
      expect(resolveEligibility(e, null, GROUPS).status).toBe("unknown");
    }
  });
  it("describes long lists briefly", () => {
    expect(describeEligibility({ type: "list", countries: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"] }, GROUPS)).toBe("Only citizens of 7 listed countries");
    expect(describeEligibility({ type: "group", group: "oic" }, GROUPS)).toMatch(/Islamic Cooperation/);
  });
  it("expands groups", () => {
    expect(eligibleCountries({ type: "group", group: "eu-eea" }, GROUPS)!.size).toBe(30);
    expect(eligibleCountries({ type: "all" }, GROUPS)).toBeNull();
  });
  it("returns the country note for the chosen nationality", () => {
    const s = make({ countryNotes: { PK: "Apply via HEC too" } });
    expect(eligibilityFor(s, "PK", GROUPS).countryNote).toBe("Apply via HEC too");
    expect(eligibilityFor(s, "IN", GROUPS).countryNote).toBeNull();
    expect(eligibilityFor(s, null, GROUPS).countryNote).toBeNull();
  });
});

describe("study levels", () => {
  it("maps the picker to data levels", () => {
    expect(matchesStudyLevel(["Internship"], "intern")).toBe(true);
    expect(matchesStudyLevel(["Internship"], "phd")).toBe(false);
    expect(matchesStudyLevel(["PhD"], "intern")).toBe(false);
    expect(matchesStudyLevel(["PhD"], "masters")).toBe(false);
    expect(matchesStudyLevel(["Undergraduate", "Master's"], "ug")).toBe(true);
    expect(matchesStudyLevel(["PhD"], "all")).toBe(true);
  });
  it("parses legacy values", () => {
    expect(toStudyLevel("Master's")).toBe("masters");
    expect(toStudyLevel("Internship")).toBe("intern");
    expect(toStudyLevel("bogus")).toBeNull();
  });
});

describe("country groups file", () => {
  it("is valid and has the expected sizes", () => {
    expect(validateGroups(GROUPS, COUNTRY_CODES)).toEqual([]);
    expect(GROUPS.commonwealth.countries).toHaveLength(56);
    expect(GROUPS["african-union"].countries).toHaveLength(55);
    expect(GROUPS.oic.countries).toHaveLength(57);
    expect(GROUPS.asean.countries).toHaveLength(11);
  });
});

describe("v2 → v3 migration", () => {
  const data = JSON.parse(readFileSync(new URL("../src/data/scholarships.json", import.meta.url), "utf8")) as (Scholarship & Record<string, unknown>)[];
  // The 55 programmes that existed in v2 were all verified as open to Pakistani citizens.
  const V2_IDS = "eth yenching hkpfs gates mbzuai epfl clarendon eiffel kaust erasmus hungary cern turkiye gks aga fulbright oist aus mext daad chevening cw kh rhodes cgs swiss imprs-is ellis-phd cs-maxplanck nus-soc-phd singa kaist tsinghua schwarzman oist-phd mila imperial-presidents ucl-res edinburgh-informatics leiden-lexs nl-scholarship helsinki aalto polimi padua kuleuven-science google-phd daad-rise summer-epfl eth-ssrf mitacs-gri koc bilkent epfl-edic ista-phd".split(" ");
  const byId = new Map(data.map((s) => [s.id, s]));

  it("keeps every v2 programme", () => {
    for (const id of V2_IDS) expect(byId.has(id), id).toBe(true);
  });
  it("removes the Pakistan-only fields", () => {
    for (const s of data) for (const k of ["abroad", "hec", "nomination"]) expect(k in s, `${s.id}.${k}`).toBe(false);
  });
  it("keeps every v2 programme open (or 'check') for Pakistani citizens", () => {
    for (const id of V2_IDS) expect(resolveEligibility(byId.get(id)!.eligibility, "PK", GROUPS).status, id).not.toBe("ineligible");
  });
  it("moves HEC / Pakistan-specific guidance into countryNotes.PK", () => {
    for (const id of ["hungary", "cw", "cgs", "fulbright", "aus", "mext", "rhodes", "swiss"]) {
      expect(byId.get(id)!.countryNotes?.PK, id).toBeTruthy();
    }
    for (const id of ["hungary", "cw", "cgs"]) expect(byId.get(id)!.countryNotes!.PK).toMatch(/HEC/);
  });
  it("keeps residency rules from v2 (abroad=false → residencyRequired)", () => {
    for (const id of ["aga", "fulbright", "aus", "mext", "cw", "swiss"]) expect(byId.get(id)!.residencyRequired, id).toBe(true);
  });
});
