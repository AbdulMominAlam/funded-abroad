import type { AlertLevel, AlertPrefs, Frequency } from "./types.ts";

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const LEVELS: AlertLevel[] = ["ug", "masters", "phd", "all"];
const FREQS: Frequency[] = ["weekly", "none"];
const ID = /^[a-z0-9][a-z0-9-]{0,59}$/;

export function normaliseEmail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const e = v.trim().toLowerCase();
  if (e.length < 3 || e.length > 254 || !EMAIL.test(e)) return null;
  return e;
}

export type ParseResult = { ok: true; email: string; prefs: AlertPrefs } | { ok: false; error: string };

/** Validate the JSON body sent by the site's alerts form. Unknown shortlist ids are dropped if `knownIds` is given. */
export function parseSubscribeBody(body: unknown, knownIds?: ReadonlySet<string>): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;
  if (typeof b.website === "string" && b.website.trim() !== "") return { ok: false, error: "Invalid request." }; // honeypot
  const email = normaliseEmail(b.email);
  if (!email) return { ok: false, error: "Please enter a valid email address." };
  const nat = b.nationality == null || b.nationality === "" ? null : String(b.nationality).toUpperCase();
  if (nat !== null && !/^[A-Z]{2}$/.test(nat)) return { ok: false, error: "Unknown nationality." };
  const level = (b.level ?? "masters") as AlertLevel;
  if (!LEVELS.includes(level)) return { ok: false, error: "Unknown study level." };
  const frequency = (b.frequency ?? "weekly") as Frequency;
  if (!FREQS.includes(frequency)) return { ok: false, error: "Unknown frequency." };
  const day = b.digest_day == null ? 1 : Number(b.digest_day);
  if (!Number.isInteger(day) || day < 0 || day > 6) return { ok: false, error: "Unknown weekday." };
  const remind = b.remind_shortlist === undefined ? true : b.remind_shortlist === true;
  const raw = Array.isArray(b.shortlist) ? b.shortlist : [];
  if (raw.length > 200) return { ok: false, error: "Shortlist is too long." };
  const shortlist = [...new Set(raw.filter((x): x is string => typeof x === "string" && ID.test(x)))]
    .filter((id) => !knownIds || knownIds.has(id));
  if (frequency === "none" && !(remind && shortlist.length)) {
    return { ok: false, error: "Choose the weekly digest, or shortlist some programmes for reminders." };
  }
  return { ok: true, email, prefs: { nationality: nat, level, shortlist, frequency, digest_day: day, remind_shortlist: remind } };
}

/** Tokens are 48 hex characters (192 bits). */
export function isToken(v: unknown): v is string {
  return typeof v === "string" && /^[a-f0-9]{48}$/.test(v);
}

export function newToken(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(text: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
