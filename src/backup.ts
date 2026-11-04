import { isChecklistState, type ChecklistState } from "./storage";

export const EXPORT_APP = "funded-abroad";
export const EXPORT_VERSION = 1;

export interface ExportFile {
  app: typeof EXPORT_APP;
  version: number;
  exportedAt: string;
  shortlist: string[];
  checklists: ChecklistState;
}

export function buildExport(shortlist: ReadonlySet<string>, checklists: ChecklistState, now = new Date()): ExportFile {
  return { app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: now.toISOString(), shortlist: [...shortlist], checklists };
}

/** Parse an export file. Throws an Error with a readable message on bad input. */
export function parseExport(text: string): Pick<ExportFile, "shortlist" | "checklists"> {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error("This file isn't valid JSON.");
  }
  if (!v || typeof v !== "object") throw new Error("This file isn't a Funded Abroad export.");
  const o = v as Record<string, unknown>;
  if (o.app !== EXPORT_APP) throw new Error("This file isn't a Funded Abroad export.");
  if (typeof o.version !== "number" || o.version > EXPORT_VERSION) {
    throw new Error("This export was made by a newer version of Funded Abroad.");
  }
  const shortlist = Array.isArray(o.shortlist) ? o.shortlist.filter((x): x is string => typeof x === "string") : [];
  const checklists = o.checklists === undefined ? {} : o.checklists;
  if (!isChecklistState(checklists)) throw new Error("The checklists in this file are damaged.");
  return { shortlist, checklists };
}

/** Merge imported data into the current data (union of shortlists and ticks; custom items de-duplicated by id). */
export function mergeImport(
  shortlist: ReadonlySet<string>,
  checklists: ChecklistState,
  incoming: Pick<ExportFile, "shortlist" | "checklists">,
  knownIds: ReadonlySet<string>,
): { shortlist: Set<string>; checklists: ChecklistState; added: number; unknown: number } {
  const out = new Set(shortlist);
  let added = 0;
  let unknown = 0;
  for (const id of incoming.shortlist) {
    if (!knownIds.has(id)) {
      unknown++;
      continue;
    }
    if (!out.has(id)) added++;
    out.add(id);
  }
  const merged: ChecklistState = { ...checklists };
  for (const [sid, e] of Object.entries(incoming.checklists)) {
    if (!knownIds.has(sid)) continue;
    const cur = merged[sid] ?? { done: [], custom: [] };
    const custom = [...cur.custom];
    for (const c of e.custom) if (!custom.some((x) => x.id === c.id)) custom.push({ id: c.id, text: c.text.slice(0, 200) });
    merged[sid] = { done: [...new Set([...cur.done, ...e.done])], custom };
  }
  return { shortlist: out, checklists: merged, added, unknown };
}
