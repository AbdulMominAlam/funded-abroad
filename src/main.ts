import "./styles.css";
import { SCHOLARSHIPS, LAST_VERIFIED, byId } from "./data/load";
import { FIELD_CATS, REGIONS, type Scholarship } from "./types";
import { formatCountdown, getStatus } from "./status";
import { applyFilters, DEFAULT_FILTERS, filtersToHash, hashToFilters, type FilterState } from "./filters";
import {
  loadChecklists, loadShortlist, loadTheme, saveChecklists, saveShortlist, saveTheme, storageAvailable,
  type ChecklistState, type ThemePref,
} from "./storage";
import { addCustomItem, removeCustomItem, toggleItem } from "./checklist";
import { buildCalendar, downloadFile } from "./ics";
import { buildExport, mergeImport, parseExport } from "./backup";
import { $, esc, prefersReducedMotion } from "./ui/dom";
import { checklistBodyHtml, listHtml, progressHtml, type ListContext } from "./ui/list";
import { stripHtml } from "./ui/strip";
import { compareTableHtml } from "./ui/compare";

const MAX_COMPARE = 3;
const now = () => new Date();

let filters: FilterState = hashToFilters(location.hash);
let shortlist = loadShortlist();
let checklists: ChecklistState = loadChecklists();
const compare = new Set<string>();
const openChecklists = new Set<string>();

/* ---------- Filters UI ---------- */
const selects = ["level", "status", "sort", "field", "region"] as const;
const chips = [["f-full", "full"], ["f-abroad", "abroad"], ["f-nowork", "nowork"], ["f-saved", "saved"]] as const;

function fillSelectOptions(): void {
  const field = $<HTMLSelectElement>("field");
  for (const [k, v] of Object.entries(FIELD_CATS)) field.add(new Option(k === "any" ? "Open to any field" : v, k));
  const region = $<HTMLSelectElement>("region");
  for (const [k, v] of Object.entries(REGIONS)) region.add(new Option(v, k));
}

function syncControls(): void {
  $<HTMLInputElement>("q").value = filters.q;
  for (const k of selects) $<HTMLSelectElement>(k).value = filters[k];
  for (const [id, k] of chips) $(id).setAttribute("aria-pressed", String(filters[k]));
}

function isDefault(f: FilterState): boolean {
  return (Object.keys(DEFAULT_FILTERS) as (keyof FilterState)[]).every((k) => k === "sort" || f[k] === DEFAULT_FILTERS[k]);
}

function writeHash(): void {
  const h = filtersToHash(filters);
  if (h !== location.hash && !(h === "" && location.hash === "")) {
    history.replaceState(null, "", h || location.pathname + location.search);
  }
}

/* ---------- Rendering ---------- */
function ctx(): ListContext {
  return { shortlist, checklists, compare, openChecklists, maxCompare: MAX_COMPARE };
}

function render(): void {
  const rows = applyFilters(SCHOLARSHIPS, now(), filters, shortlist);
  $("count").textContent = `${rows.length} of ${SCHOLARSHIPS.length} programmes`;
  $("list").innerHTML = listHtml(rows, ctx(), filters.saved);
  $("f-clear").hidden = isDefault(filters);
  renderCompareBar();
}

function renderStrip(): void {
  $("months").innerHTML = stripHtml(SCHOLARSHIPS, now());
}

function update(partial: Partial<FilterState>): void {
  filters = { ...filters, ...partial };
  writeHash();
  render();
}

/** Live countdowns: refresh the numbers in place every 30 s (no full re-render, so focus is kept). */
function tick(): void {
  const t = now();
  document.querySelectorAll<HTMLElement>("[data-countdown]").forEach((el) => {
    const s = byId.get(el.dataset.countdown!);
    if (!s) return;
    const i = getStatus(s, t);
    if (i.kind === "closed") return; // will update on next full render
    const c = formatCountdown(i.msLeft);
    el.innerHTML = `${esc(c.big)}<small>${esc(c.small)}</small>`;
  });
}

/* ---------- Messages ---------- */
let msgTimer = 0;
function message(text: string, isError = false): void {
  const el = $("t-msg");
  el.textContent = text;
  el.classList.toggle("err", isError);
  clearTimeout(msgTimer);
  msgTimer = window.setTimeout(() => (el.textContent = ""), 6000);
}

/* ---------- Shortlist ---------- */
function toggleShortlist(id: string): void {
  if (shortlist.has(id)) shortlist.delete(id);
  else shortlist.add(id);
  saveShortlist(shortlist);
  render();
  // keep keyboard focus on the same star after re-render
  document.querySelector<HTMLElement>(`.star[data-id="${CSS.escape(id)}"]`)?.focus();
}

/* ---------- Checklists ---------- */
function persistChecklists(sid: string): void {
  saveChecklists(checklists);
  const s = byId.get(sid);
  const prog = document.querySelector<HTMLElement>(`[data-prog="${CSS.escape(sid)}"]`);
  if (s && prog) prog.innerHTML = progressHtml(s, checklists[sid]);
}

function rerenderChecklistBody(sid: string, focusSelector?: string): void {
  const s = byId.get(sid);
  const det = document.querySelector<HTMLDetailsElement>(`details[data-check="${CSS.escape(sid)}"]`);
  if (!s || !det) return;
  det.querySelectorAll(":scope > :not(summary)").forEach((n) => n.remove());
  det.insertAdjacentHTML("beforeend", checklistBodyHtml(s, checklists[sid]));
  persistChecklists(sid);
  if (focusSelector) det.querySelector<HTMLElement>(focusSelector)?.focus();
}

/* ---------- Calendar ---------- */
function slugFile(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "deadline";
}

function addToCalendar(s: Scholarship): void {
  downloadFile(`${slugFile(s.name)}.ics`, buildCalendar([s], now(), s.name), "text/calendar;charset=utf-8");
  message(`Calendar file downloaded for ${s.name}. Open it to add the deadline and reminders.`);
}

function exportShortlistCalendar(): void {
  const t = now();
  const items = [...shortlist].map((id) => byId.get(id)).filter((s): s is Scholarship => !!s && getStatus(s, t).kind !== "closed");
  if (!items.length) {
    message(shortlist.size ? "All shortlisted programmes are closed for this year." : "Your shortlist is empty. Tap ☆ on a programme first.", true);
    return;
  }
  downloadFile("funded-abroad-shortlist.ics", buildCalendar(items, t, "Funded Abroad shortlist"), "text/calendar;charset=utf-8");
  message(`Calendar file with ${items.length} deadline${items.length > 1 ? "s" : ""} downloaded.`);
}

/* ---------- Export / import ---------- */
function exportData(): void {
  const data = buildExport(shortlist, checklists, now());
  downloadFile(`funded-abroad-backup-${data.exportedAt.slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
  message(`Exported ${shortlist.size} shortlisted programme${shortlist.size === 1 ? "" : "s"} and your checklists.`);
}

async function importData(file: File): Promise<void> {
  try {
    if (file.size > 1_000_000) throw new Error("That file is too large to be a Funded Abroad export.");
    const incoming = parseExport(await file.text());
    const r = mergeImport(shortlist, checklists, incoming, new Set(byId.keys()));
    shortlist = r.shortlist;
    checklists = r.checklists;
    const ok = saveShortlist(shortlist) && saveChecklists(checklists);
    render();
    message(
      `Imported: ${r.added} new shortlist item${r.added === 1 ? "" : "s"}, checklists merged.` +
        (r.unknown ? ` ${r.unknown} unknown programme${r.unknown === 1 ? "" : "s"} skipped.` : "") +
        (ok ? "" : " (Storage is blocked, so this will not be saved.)"),
    );
  } catch (e) {
    message((e as Error).message || "Could not import that file.", true);
  }
}

async function copyLink(): Promise<void> {
  writeHash();
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    message("Link copied. It opens this exact filtered view.");
  } catch {
    message("Copy this link from the address bar: " + url);
  }
}

/* ---------- Compare ---------- */
function renderCompareBar(): void {
  const bar = $("compare-bar");
  bar.hidden = compare.size === 0;
  $("compare-count").textContent =
    compare.size < 2 ? `${compare.size} selected · pick 1–2 more` : `${compare.size} selected`;
  $<HTMLButtonElement>("compare-open").disabled = compare.size < 2;
}

function openCompare(): void {
  const items = [...compare].map((id) => byId.get(id)).filter((s): s is Scholarship => !!s);
  if (items.length < 2) return;
  $("compare-body").innerHTML = compareTableHtml(items, now(), checklists);
  const dlg = $<HTMLDialogElement>("compare");
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "");
  $("compare-close").focus();
}

/* ---------- Theme ---------- */
const THEME_LABEL: Record<ThemePref, string> = { auto: "Theme: auto", light: "Theme: light", dark: "Theme: dark" };
function applyTheme(t: ThemePref): void {
  if (t === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  const b = $("theme");
  b.textContent = THEME_LABEL[t];
  b.setAttribute("aria-label", `Colour theme: ${t === "auto" ? "automatic" : t}. Change theme`);
}

/* ---------- Events ---------- */
function bind(): void {
  $<HTMLInputElement>("q").addEventListener("input", (e) => update({ q: (e.target as HTMLInputElement).value.trim() }));
  for (const k of selects) {
    $<HTMLSelectElement>(k).addEventListener("change", (e) => update({ [k]: (e.target as HTMLSelectElement).value } as Partial<FilterState>));
  }
  for (const [id, k] of chips) {
    $(id).addEventListener("click", (e) => {
      const v = !filters[k];
      (e.currentTarget as HTMLElement).setAttribute("aria-pressed", String(v));
      update({ [k]: v } as Partial<FilterState>);
    });
  }
  $("f-clear").addEventListener("click", () => {
    filters = { ...DEFAULT_FILTERS, sort: filters.sort };
    syncControls();
    writeHash();
    render();
    $("q").focus();
  });
  window.addEventListener("hashchange", () => {
    filters = hashToFilters(location.hash);
    syncControls();
    render();
  });

  $("t-cal").addEventListener("click", exportShortlistCalendar);
  $("t-export").addEventListener("click", exportData);
  $("t-import").addEventListener("click", () => $<HTMLInputElement>("t-file").click());
  $<HTMLInputElement>("t-file").addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) void importData(f);
    input.value = "";
  });
  $("t-link").addEventListener("click", () => void copyLink());

  let theme = loadTheme();
  applyTheme(theme);
  $("theme").addEventListener("click", () => {
    theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    saveTheme(theme);
    applyTheme(theme);
  });

  $("compare-open").addEventListener("click", openCompare);
  $("compare-clear").addEventListener("click", () => {
    compare.clear();
    render();
  });
  const dlg = $<HTMLDialogElement>("compare");
  $("compare-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close(); // click on backdrop
  });
  dlg.addEventListener("close", () => $("compare-open").focus());

  const list = $("list");
  list.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const star = t.closest<HTMLElement>(".star");
    if (star) return toggleShortlist(star.dataset.id!);
    const ics = t.closest<HTMLElement>("[data-ics]");
    if (ics) {
      const s = byId.get(ics.dataset.ics!);
      if (s) addToCalendar(s);
      return;
    }
    const rm = t.closest<HTMLElement>("[data-rm]");
    if (rm) {
      const sid = rm.dataset.rm!;
      checklists = removeCustomItem(checklists, sid, rm.dataset.item!);
      rerenderChecklistBody(sid, "form input");
    }
  });
  list.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.ck) {
      checklists = toggleItem(checklists, t.dataset.ck, t.dataset.item!, t.checked);
      persistChecklists(t.dataset.ck);
    } else if (t.dataset.cmp) {
      const id = t.dataset.cmp;
      if (t.checked && compare.size < MAX_COMPARE) compare.add(id);
      else compare.delete(id);
      render();
      document.querySelector<HTMLElement>(`[data-cmp="${CSS.escape(id)}"]`)?.focus();
    }
  });
  list.addEventListener("submit", (e) => {
    const form = (e.target as HTMLElement).closest<HTMLFormElement>("form[data-add]");
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector("input")!;
    const sid = form.dataset.add!;
    const before = checklists;
    checklists = addCustomItem(checklists, sid, input.value);
    if (checklists !== before) rerenderChecklistBody(sid, "form input");
  });
  list.addEventListener("toggle", (e) => {
    const det = e.target as HTMLDetailsElement;
    if (!(det instanceof HTMLDetailsElement) || !det.dataset.check) return;
    const sid = det.dataset.check;
    if (det.open) {
      openChecklists.add(sid);
      if (!det.querySelector("ul")) det.insertAdjacentHTML("beforeend", checklistBodyHtml(byId.get(sid)!, checklists[sid]));
    } else openChecklists.delete(sid);
  }, true);

  $("months").addEventListener("click", (e) => {
    const j = (e.target as HTMLElement).closest<HTMLElement>("[data-jump]");
    if (!j) return;
    filters = { ...DEFAULT_FILTERS, sort: filters.sort };
    syncControls();
    writeHash();
    render();
    const el = document.getElementById("p-" + j.dataset.jump);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      el.classList.add("flash");
      el.querySelector<HTMLElement>(".star")?.focus({ preventScroll: true });
      setTimeout(() => el.classList.remove("flash"), 1600);
    }
  });
}

/* ---------- Boot ---------- */
fillSelectOptions();
syncControls();
if (LAST_VERIFIED) {
  $("asof").textContent = new Date(LAST_VERIFIED + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
$("storage-warn").hidden = storageAvailable();
bind();
renderStrip();
render();
setInterval(tick, 30_000);
// Re-render fully every 10 minutes so statuses roll over (e.g. a deadline passing) on long-open tabs.
setInterval(() => { renderStrip(); render(); }, 600_000);
