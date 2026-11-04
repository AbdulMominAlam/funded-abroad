import countriesRaw from "./countries.json";
import groupsRaw from "./country-groups.json";
import type { CountryGroup, Scholarship } from "../types";
import type { CountryNames, Groups } from "../eligibility";

/**
 * Programme data lives in many small files under ./programmes/<level>/<topic>.json and is merged here at build
 * time. Validated by `npm run validate-data` (runs before every build), including duplicates across files.
 */
const modules = import.meta.glob<Scholarship[]>("./programmes/**/*.json", { eager: true, import: "default" });
export const SCHOLARSHIPS: readonly Scholarship[] = Object.keys(modules).sort().flatMap((k) => modules[k]);

export const COUNTRIES: readonly { code: string; name: string }[] = countriesRaw;
export const COUNTRY_NAMES: CountryNames = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));
export const GROUPS: Groups = groupsRaw as Record<string, CountryGroup>;

/** Most recent verifiedOn date across all entries (YYYY-MM-DD). */
export const LAST_VERIFIED: string = SCHOLARSHIPS.reduce((m, s) => (s.verifiedOn > m ? s.verifiedOn : m), "");

export const byId = new Map(SCHOLARSHIPS.map((s) => [s.id, s]));
