/**
 * Host-country names. A programme's `country` text is display text in one of two forms:
 *   "<Country>[ / <Country>…][ (qualifier)]"   e.g. "Germany", "Austria (multi-country)", "Germany / United Kingdom"
 *   "Any[ (qualifier)]"                          e.g. "Any (UNDP offices worldwide)"
 * Each <Country> must be a canonical name: the name in countries.json, except "Hong Kong" and "Macao".
 * The host-country filter works on these canonical names, so each country appears once.
 */
import countriesRaw from "./data/countries.json";

const DISPLAY_OVERRIDES: Record<string, string> = { HK: "Hong Kong", MO: "Macao" };

/** Every canonical host-country name. */
export const HOST_NAMES: ReadonlySet<string> = new Set(
  (countriesRaw as { code: string; name: string }[]).map((c) => DISPLAY_OVERRIDES[c.code] ?? c.name),
);

/** Filter bucket for programmes with no single host (`Any (…)`). */
export const ANY_HOST = "Multiple / any country";

/** Common non-canonical spellings → canonical name (lower-case keys). */
const ALIASES: Record<string, string> = {
  "uk": "United Kingdom", "u.k.": "United Kingdom", "great britain": "United Kingdom", "britain": "United Kingdom", "england": "United Kingdom", "scotland": "United Kingdom", "wales": "United Kingdom",
  "usa": "United States", "us": "United States", "u.s.": "United States", "united states of america": "United States", "america": "United States",
  "uae": "United Arab Emirates", "emirates": "United Arab Emirates",
  "turkey": "Türkiye", "turkiye": "Türkiye",
  "korea": "South Korea", "republic of korea": "South Korea", "korea, republic of": "South Korea",
  "czech republic": "Czechia",
  "hong kong sar china": "Hong Kong", "hong kong sar": "Hong Kong", "hk": "Hong Kong",
  "macao sar china": "Macao", "macau": "Macao",
  "côte d'ivoire": "Côte d’Ivoire", "cote d'ivoire": "Côte d’Ivoire", "cote d’ivoire": "Côte d’Ivoire", "ivory coast": "Côte d’Ivoire",
  "holland": "Netherlands", "the netherlands": "Netherlands",
  "russian federation": "Russia", "viet nam": "Vietnam", "prc": "China", "mainland china": "China",
  "republic of china": "Taiwan", "ksa": "Saudi Arabia",
};

/** Split "Base (qualifier)" at the first "(". */
function splitText(text: string): { base: string; qualifier: string } {
  const t = text.trim();
  const i = t.indexOf("(");
  return i < 0 ? { base: t, qualifier: "" } : { base: t.slice(0, i).trim(), qualifier: t.slice(i).trim() };
}

/** Canonical name for one country name or alias, or null if unknown. */
export function canonicalHost(name: string): string | null {
  const t = name.trim().replace(/\s+/g, " ");
  if (HOST_NAMES.has(t)) return t;
  const lower = t.toLowerCase();
  const alias = ALIASES[lower];
  if (alias) return alias;
  for (const n of HOST_NAMES) if (n.toLowerCase() === lower) return n;
  return null;
}

/** Canonical host countries named in a `country` text; [] for "Any (…)". Unknown parts are kept as written. */
export function hostsOf(country: string): string[] {
  const { base } = splitText(country);
  if (!base || /^any$/i.test(base)) return [];
  const out: string[] = [];
  for (const part of base.split("/")) {
    const p = part.trim();
    if (!p) continue;
    const c = canonicalHost(p) ?? p;
    if (!out.includes(c)) out.push(c);
  }
  return out;
}

/** Host-filter value(s) for a value from a URL/link: canonical names, or ANY_HOST. Accepts legacy raw `country` texts. */
export function normaliseHostFilter(value: string): string[] {
  const v = value.trim();
  if (!v) return [];
  if (v === ANY_HOST) return [ANY_HOST];
  const { base } = splitText(v);
  if (/^(any|europe|multiple)$/i.test(base)) return [ANY_HOST];
  return hostsOf(v);
}

/** Labels a programme belongs to in the host filter. */
export function hostLabelsOf(country: string): string[] {
  const h = hostsOf(country);
  return h.length ? h : [ANY_HOST];
}

/** Problems with a `country` text (used by the data validator). */
export function countryTextProblems(country: string): string[] {
  const errs: string[] = [];
  const t = country.trim();
  if (t !== country) errs.push(`country "${country}" has leading/trailing spaces`);
  const { base, qualifier } = splitText(t);
  if (qualifier && !qualifier.endsWith(")")) errs.push(`country "${country}": qualifier must be "(…)" at the end`);
  if (/^any$/i.test(base)) {
    if (base !== "Any") errs.push(`country "${country}": write "Any", not "${base}"`);
    return errs;
  }
  if (!base) return [...errs, `country "${country}" has no country name before "("`];
  for (const part of base.split("/")) {
    const p = part.trim();
    if (HOST_NAMES.has(p)) continue;
    const c = canonicalHost(p);
    errs.push(c ? `country "${country}": use the canonical name "${c}" instead of "${p}"`
      : `country "${country}": "${p}" is not a canonical country name (see src/hosts.ts; use "Any (…)" for multi-country or unspecified hosts, and "A / B" for several countries)`);
  }
  if (base.includes("/") && !/^[^/]+( \/ [^/]+)+$/.test(base)) errs.push(`country "${country}": separate several countries with " / "`);
  return errs;
}
