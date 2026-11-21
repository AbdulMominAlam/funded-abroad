import { describe, expect, it } from "vitest";
import { ANY_HOST, canonicalHost, hostLabelsOf, hostsOf, normaliseHostFilter } from "../src/hosts";
import { applyFilters, DEFAULT_FILTERS, hashToFilters, hostCountries } from "../src/filters";
import { GROUPS, make, NOW } from "./fixtures";

describe("host countries", () => {
  it("canonicalises names and aliases", () => {
    expect(canonicalHost("UK")).toBe("United Kingdom");
    expect(canonicalHost("uae")).toBe("United Arab Emirates");
    expect(canonicalHost("Hong Kong SAR China")).toBe("Hong Kong");
    expect(canonicalHost("Turkey")).toBe("Türkiye");
    expect(canonicalHost("germany")).toBe("Germany");
    expect(canonicalHost("Narnia")).toBeNull();
  });
  it("parses country text", () => {
    expect(hostsOf("Austria (multi-country)")).toEqual(["Austria"]);
    expect(hostsOf("Germany / UK / Germany")).toEqual(["Germany", "United Kingdom"]);
    expect(hostsOf("Any (UN offices)")).toEqual([]);
    expect(hostLabelsOf("Any")).toEqual([ANY_HOST]);
  });
  it("maps legacy filter links to canonical names", () => {
    expect(normaliseHostFilter("UAE")).toEqual(["United Arab Emirates"]);
    expect(normaliseHostFilter("Netherlands (multi-country)")).toEqual(["Netherlands"]);
    expect(normaliseHostFilter("Europe (multi-country)")).toEqual([ANY_HOST]);
    expect(hashToFilters("#host=UK|United%20Kingdom|Germany").hosts).toEqual(["United Kingdom", "Germany"]);
  });
  it("lists each country once and filters multi-country programmes under each", () => {
    const data = [
      make({ id: "a", country: "Germany" }),
      make({ id: "b", country: "Germany (multi-country)" }),
      make({ id: "c", country: "Germany / United Kingdom" }),
      make({ id: "d", country: "Any (worldwide)" }),
    ];
    expect(hostCountries(data)).toEqual([
      { name: "Germany", count: 3 },
      { name: ANY_HOST, count: 1 },
      { name: "United Kingdom", count: 1 },
    ]);
    const ids = (hosts: string[]) => applyFilters(data, NOW, { ...DEFAULT_FILTERS, lvl: "all", hosts }, new Set(), { groups: GROUPS }).rows.map((r) => r.s.id);
    expect(ids(["United Kingdom"])).toEqual(["c"]);
    expect(ids([ANY_HOST])).toEqual(["d"]);
  });
});
