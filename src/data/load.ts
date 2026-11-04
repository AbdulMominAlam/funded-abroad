import raw from "./scholarships.json";
import type { Scholarship } from "../types";

/** Scholarship data. Validated at build time by `npm run validate-data` (runs before every build). */
export const SCHOLARSHIPS: readonly Scholarship[] = raw as Scholarship[];

/** Most recent verifiedOn date across all entries (YYYY-MM-DD). */
export const LAST_VERIFIED: string = SCHOLARSHIPS.reduce((m, s) => (s.verifiedOn > m ? s.verifiedOn : m), "");

export const byId = new Map(SCHOLARSHIPS.map((s) => [s.id, s]));
