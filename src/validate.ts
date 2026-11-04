import { FIELD_CATS, LEVELS, REGIONS } from "./types";

const ISO_TZ = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-](\d{2}):(\d{2}))$/;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ID = /^[a-z0-9][a-z0-9-]*$/;

const REQUIRED_STRINGS = [
  "id", "name", "host", "country", "amount", "deadline", "dlText", "fields", "note", "url", "source", "verifiedOn",
] as const;
const REQUIRED_BOOLS = ["full", "abroad", "work", "hec"] as const;
const OPTIONAL_BOOLS = ["expected", "varies", "nomination"] as const;
const KNOWN_KEYS = new Set<string>([
  ...REQUIRED_STRINGS, ...REQUIRED_BOOLS, ...OPTIONAL_BOOLS,
  "region", "levels", "tags", "fieldCats", "opens", "nextText", "checklist",
]);

function validDate(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** ISO 8601 date-time with an explicit time zone (Z or ±hh:mm). */
export function isIsoWithTz(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const m = ISO_TZ.exec(v);
  if (!m) return false;
  if (!validDate(+m[1], +m[2], +m[3])) return false;
  if (+m[4] > 23 || +m[5] > 59 || (m[6] !== undefined && +m[6] > 59)) return false;
  if (m[8] !== undefined && (+m[8] > 14 || +m[9] > 59)) return false;
  return !Number.isNaN(Date.parse(v));
}

export function isDateOnly(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const m = DATE_ONLY.exec(v);
  return !!m && validDate(+m[1], +m[2], +m[3]);
}

export function isHttpsUrl(v: unknown): boolean {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Validate the whole dataset. Returns a list of human-readable errors (empty = valid). */
export function validateScholarships(data: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(data)) return ["Data must be a JSON array of scholarships."];
  if (data.length === 0) errors.push("Data array is empty.");
  const seen = new Map<string, number>();

  data.forEach((raw, i) => {
    const where = `entry #${i}` + (raw && typeof raw === "object" && typeof (raw as any).id === "string" ? ` (${(raw as any).id})` : "");
    const err = (msg: string) => errors.push(`${where}: ${msg}`);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return err("must be an object");
    const s = raw as Record<string, unknown>;

    for (const k of Object.keys(s)) if (!KNOWN_KEYS.has(k)) err(`unknown field "${k}" (typo?)`);
    for (const k of REQUIRED_STRINGS) {
      if (typeof s[k] !== "string" || !(s[k] as string).trim()) err(`missing or empty string field "${k}"`);
    }
    for (const k of REQUIRED_BOOLS) if (typeof s[k] !== "boolean") err(`"${k}" must be true or false`);
    for (const k of OPTIONAL_BOOLS) if (k in s && typeof s[k] !== "boolean") err(`"${k}" must be a boolean if present`);

    if (typeof s.id === "string") {
      if (!ID.test(s.id)) err(`id "${s.id}" must be lowercase letters, digits and hyphens`);
      if (seen.has(s.id)) err(`duplicate id "${s.id}" (also entry #${seen.get(s.id)})`);
      else seen.set(s.id, i);
    }
    if (typeof s.deadline === "string" && !isIsoWithTz(s.deadline)) {
      err(`deadline "${s.deadline}" must be ISO 8601 with a time zone, e.g. 2026-11-30T23:59:00+01:00`);
    }
    if ("opens" in s) {
      if (!isDateOnly(s.opens) && !isIsoWithTz(s.opens)) err(`opens "${String(s.opens)}" must be YYYY-MM-DD or ISO 8601 with a time zone`);
      else if (isIsoWithTz(s.deadline)) {
        const o = Date.parse(isDateOnly(s.opens) ? s.opens + "T00:00:00Z" : (s.opens as string));
        if (o >= Date.parse(s.deadline as string)) err("opens must be before the deadline");
      }
    }
    if (typeof s.verifiedOn === "string" && !isDateOnly(s.verifiedOn)) err(`verifiedOn "${s.verifiedOn}" must be YYYY-MM-DD`);
    for (const k of ["url", "source"] as const) {
      if (typeof s[k] === "string" && !isHttpsUrl(s[k])) err(`${k} "${s[k]}" must be a valid https:// URL`);
    }
    if (typeof s.region !== "string" || !(s.region in REGIONS)) {
      err(`region must be one of: ${Object.keys(REGIONS).join(", ")}`);
    }
    if (!Array.isArray(s.levels) || s.levels.length === 0) err("levels must be a non-empty array");
    else for (const l of s.levels) if (!LEVELS.includes(l as never)) err(`unknown level "${String(l)}"`);
    if (!Array.isArray(s.fieldCats) || s.fieldCats.length === 0) err("fieldCats must be a non-empty array");
    else for (const f of s.fieldCats) if (typeof f !== "string" || !(f in FIELD_CATS)) err(`unknown fieldCat "${String(f)}"`);
    if (!Array.isArray(s.tags) || s.tags.some((t) => typeof t !== "string" || !t.trim())) err("tags must be an array of non-empty strings");
    if ("checklist" in s && (!Array.isArray(s.checklist) || s.checklist.some((t) => typeof t !== "string" || !t.trim()))) {
      err("checklist must be an array of non-empty strings");
    }
    if ("nextText" in s && (typeof s.nextText !== "string" || !s.nextText.trim())) err("nextText must be a non-empty string");
    if (s.expected === true && s.varies === true) err("use either expected or varies, not both");
  });
  return errors;
}
