/** All localStorage access goes through here so the page still works when storage is blocked. */

export const KEYS = {
  shortlist: "fa-saved",
  checklists: "fa-checklists",
  theme: "fa-theme",
} as const;

export function storageAvailable(): boolean {
  try {
    const k = "__fa_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage blocked */
  }
}

function readJson<T>(key: string, fallback: T, guard: (v: unknown) => v is T): T {
  const raw = safeGet(key);
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return guard(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

export function loadShortlist(): Set<string> {
  return new Set(readJson(KEYS.shortlist, [] as string[], isStringArray));
}

export function saveShortlist(ids: ReadonlySet<string>): boolean {
  return safeSet(KEYS.shortlist, JSON.stringify([...ids]));
}

export interface CustomItem {
  id: string;
  text: string;
}
export interface ChecklistEntry {
  /** Ids of ticked items (default and custom). */
  done: string[];
  /** User-added items. */
  custom: CustomItem[];
}
export type ChecklistState = Record<string, ChecklistEntry>;

export function isChecklistEntry(v: unknown): v is ChecklistEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    isStringArray(e.done) &&
    Array.isArray(e.custom) &&
    e.custom.every(
      (c) => !!c && typeof c === "object" && typeof (c as CustomItem).id === "string" && typeof (c as CustomItem).text === "string",
    )
  );
}

export function isChecklistState(v: unknown): v is ChecklistState {
  return !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every(isChecklistEntry);
}

export function loadChecklists(): ChecklistState {
  return readJson(KEYS.checklists, {} as ChecklistState, isChecklistState);
}

export function saveChecklists(state: ChecklistState): boolean {
  return safeSet(KEYS.checklists, JSON.stringify(state));
}

export type ThemePref = "auto" | "light" | "dark";
export function loadTheme(): ThemePref {
  const t = safeGet(KEYS.theme);
  return t === "light" || t === "dark" ? t : "auto";
}
export function saveTheme(t: ThemePref): void {
  if (t === "auto") safeRemove(KEYS.theme);
  else safeSet(KEYS.theme, t);
}
