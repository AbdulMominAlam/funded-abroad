import type { Scholarship } from "./types";
import type { ChecklistEntry, ChecklistState } from "./storage";

export interface ChecklistItem {
  id: string;
  text: string;
  custom?: boolean;
}

export function slug(t: string): string {
  return t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

/** Default checklist: common documents plus items derived from the programme's flags and tags. */
export function defaultChecklist(s: Scholarship): ChecklistItem[] {
  const tags = s.tags.join(" | ");
  const internshipOnly = s.levels.length === 1 && s.levels[0] === "Internship";
  const items: ChecklistItem[] = [
    { id: "transcripts", text: "Transcripts and degree certificates" },
    { id: "cv", text: "CV" },
    {
      id: "sop",
      text: internshipOnly ? "Motivation letter / research interests" : "Statement of purpose / motivation letter",
    },
    { id: "refs", text: "Reference letters" },
  ];
  if (!/no ielts|no english test/i.test(tags)) {
    const m = /(IELTS[^|]*|TOEFL[^|]*)/i.exec(tags);
    items.push({ id: "english", text: m ? `English test (${m[1].trim()})` : "English test (IELTS/TOEFL) or medium-of-instruction letter" });
  }
  items.push({ id: "passport", text: "Valid passport" });

  const extra: ChecklistItem[] = [];
  const add = (id: string, text: string) => {
    if (!extra.some((e) => e.id === id)) extra.push({ id, text });
  };
  if (s.hec || /\bHEC\b/.test(tags)) add("hec-portal", "HEC portal application");
  if (/\bGRE\b/.test(tags) || s.id === "fulbright") add("gre", "GRE");
  if (/work experience/i.test(tags) || s.work) add("work-proof", "Proof of work experience (employment letters)");
  if (s.nomination || /nominat/i.test(tags)) add("nomination", "Nomination from university / department / supervisor");
  if (/host professor|supervisor letter|acceptance letter|invitation letter/i.test(tags)) add("host", "Host professor / supervisor acceptance letter");
  if (/research proposal/i.test(tags)) add("proposal", "Research proposal");
  if (/\bfee\b/i.test(tags)) add("fee", "Pay the application fee");
  if (/exam|written test|screening/i.test(tags)) add("exam", "Prepare for the screening / written exam");
  if (/two applications|two portals/i.test(tags)) add("both-apps", "Submit both applications (scholarship + university)");
  if (/guarantor/i.test(tags)) add("guarantor", "Arrange a loan guarantor");
  for (const t of s.checklist ?? []) add("x-" + slug(t), t);
  return [...items, ...extra];
}

export function emptyEntry(): ChecklistEntry {
  return { done: [], custom: [] };
}

export function itemsFor(s: Scholarship, entry: ChecklistEntry | undefined): ChecklistItem[] {
  return [...defaultChecklist(s), ...(entry?.custom ?? []).map((c) => ({ ...c, custom: true }))];
}

export function progress(s: Scholarship, entry: ChecklistEntry | undefined): { done: number; total: number } {
  const items = itemsFor(s, entry);
  const done = new Set(entry?.done ?? []);
  return { done: items.filter((it) => done.has(it.id)).length, total: items.length };
}

export function toggleItem(state: ChecklistState, sid: string, itemId: string, on: boolean): ChecklistState {
  const e = state[sid] ?? emptyEntry();
  const done = new Set(e.done);
  if (on) done.add(itemId);
  else done.delete(itemId);
  return { ...state, [sid]: { ...e, done: [...done] } };
}

export function addCustomItem(state: ChecklistState, sid: string, text: string, idSeed = Date.now()): ChecklistState {
  const t = text.trim().slice(0, 200);
  if (!t) return state;
  const e = state[sid] ?? emptyEntry();
  const id = "c-" + idSeed.toString(36) + "-" + e.custom.length;
  return { ...state, [sid]: { ...e, custom: [...e.custom, { id, text: t }] } };
}

export function removeCustomItem(state: ChecklistState, sid: string, itemId: string): ChecklistState {
  const e = state[sid];
  if (!e) return state;
  return {
    ...state,
    [sid]: { done: e.done.filter((d) => d !== itemId), custom: e.custom.filter((c) => c.id !== itemId) },
  };
}
