import type { Scholarship } from "../types";
import { REGIONS } from "../types";
import { formatCountdown, type StatusInfo } from "../status";
import type { Row } from "../filters";
import { itemsFor, progress } from "../checklist";
import type { ChecklistEntry, ChecklistState } from "../storage";
import type { CountryNames } from "../eligibility";
import { esc } from "./dom";

export interface ListContext {
  shortlist: ReadonlySet<string>;
  checklists: ChecklistState;
  compare: ReadonlySet<string>;
  openChecklists: ReadonlySet<string>;
  maxCompare: number;
  /** Selected nationality, or null. */
  nat: string | null;
  names: CountryNames;
}

export function statusClass(s: Scholarship, i: StatusInfo): string {
  switch (i.kind) {
    case "closed": return "s-closed";
    case "soon": return "s-soon";
    case "upcoming":
    case "expected": return "s-up";
    case "varies": return "s-varies";
    default: return s.varies ? "s-varies" : "s-open";
  }
}

const FLAG_RE = /reside|residency|work experience|dual|born after|\bage\b|age limit|must |not eligible|\bonly\b|enrolled at|not resident/i;

export function countdownHtml(s: Scholarship, i: StatusInfo): string {
  if (i.kind === "closed") return `<div class="days">—<small>${esc(s.nextText ?? "next round 2027")}</small></div>`;
  const c = formatCountdown(i.msLeft);
  return `<div class="days" data-countdown="${esc(s.id)}">${esc(c.big)}<small>${esc(c.small)}</small></div>`;
}

export function progressHtml(s: Scholarship, entry: ChecklistEntry | undefined, nat: string | null = null): string {
  const p = progress(s, entry, nat);
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  return `<span class="prog${p.done === p.total ? " done" : ""}">${p.done}/${p.total}</span><span class="bar" aria-hidden="true"><i style="width:${pct}%"></i></span>`;
}

export function checklistBodyHtml(s: Scholarship, entry: ChecklistEntry | undefined, nat: string | null = null): string {
  const done = new Set(entry?.done ?? []);
  const items = itemsFor(s, entry, nat);
  return `<ul>${items.map((it) => {
    const cid = `ck-${s.id}-${it.id}`;
    return `<li><label for="${esc(cid)}"><input type="checkbox" id="${esc(cid)}" data-ck="${esc(s.id)}" data-item="${esc(it.id)}"${done.has(it.id) ? " checked" : ""}><span>${esc(it.text)}</span></label>${
      it.custom ? `<button type="button" class="rm" data-rm="${esc(s.id)}" data-item="${esc(it.id)}" aria-label="Remove item: ${esc(it.text)}">✕</button>` : ""
    }</li>`;
  }).join("")}</ul>
  <form data-add="${esc(s.id)}"><label class="sr" for="add-${esc(s.id)}">Add your own checklist item for ${esc(s.name)}</label><input id="add-${esc(s.id)}" type="text" maxlength="200" placeholder="Add your own item…" autocomplete="off"><button type="submit" class="act">Add</button></form>`;
}

/** Country-specific notes: the selected nationality's note, or all notes (labelled) when none is selected. */
export function countryNotesHtml(s: Scholarship, nat: string | null, names: CountryNames): string {
  const notes = s.countryNotes ?? {};
  const entries = nat ? (notes[nat] ? [[nat, notes[nat]] as const] : []) : Object.entries(notes);
  return entries
    .map(([c, t]) => `<p class="cnote"><b>For applicants from ${esc(names[c] ?? c)}:</b> ${esc(t)}</p>`)
    .join("");
}

export function cardHtml({ s, i, e }: Row, ctx: ListContext): string {
  const inelig = e.status === "ineligible";
  const tags = [
    `<span class="tag good">${s.full ? "Fully funded" : "Partial funding"}</span>`,
    ...s.levels.map((l) => `<span class="tag">${esc(l)}</span>`),
    e.status === "check" || (e.status === "unknown" && s.eligibility.type !== "all")
      ? `<span class="tag flag" title="${esc(e.reason)}">${s.eligibility.type === "check" ? "Check your country is eligible" : "Limited nationalities"}</span>`
      : "",
    s.residencyRequired ? `<span class="tag flag">Must live in your home country</span>` : "",
    s.nominationBody ? `<span class="tag nom">Nomination: ${esc(s.nominationBody)}</span>` : "",
    ...s.tags.map((t) => `<span class="tag${FLAG_RE.test(t) ? " flag" : ""}">${esc(t)}</span>`),
  ].join("");
  const on = ctx.shortlist.has(s.id);
  const inCmp = ctx.compare.has(s.id);
  const cmpDisabled = !inCmp && ctx.compare.size >= ctx.maxCompare;
  const entry = ctx.checklists[s.id];
  const open = ctx.openChecklists.has(s.id);
  const verified = new Date(s.verifiedOn + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const eligLine = inelig
    ? `<p class="inelig-reason"><b>Not eligible:</b> ${esc(e.reason)}</p>`
    : e.status === "check"
      ? `<p class="elig-check"><b>Eligibility:</b> ${esc(e.reason)}</p>`
      : s.eligibility.type !== "all"
        ? `<p class="elig-info"><b>Who can apply:</b> ${esc(e.reason)}</p>`
        : "";
  return `<article class="item ${i.kind === "closed" ? "closed" : ""}${inelig ? " ineligible" : ""}" id="p-${esc(s.id)}" aria-labelledby="h-${esc(s.id)}">
    <div class="when"><span class="status ${statusClass(s, i)}">${esc(i.label)}</span>${countdownHtml(s, i)}</div>
    <div class="main">
      <h3 id="h-${esc(s.id)}">${esc(s.name)}${inelig ? '<span class="sr"> (not eligible for your nationality)</span>' : ""}</h3>
      <div class="meta">${esc(s.host)} · ${esc(s.country)} · ${esc(s.fields)}</div>
      ${eligLine}
      <div class="dl"><span>Deadline</span> ${esc(s.dlText)}</div>
      <div class="amount">${esc(s.amount)}</div>
      <div class="tags">${tags}</div>
      <p class="note">${esc(s.note)}</p>
      ${countryNotesHtml(s, ctx.nat, ctx.names)}
      <div class="verified">Checked ${esc(verified)} against <a href="${esc(s.source)}" target="_blank" rel="noopener">${esc(new URL(s.source).hostname.replace(/^www\./, ""))}</a> · ${esc(REGIONS[s.region])}</div>
      <details class="check" data-check="${esc(s.id)}"${open ? " open" : ""}>
        <summary>Application checklist <span data-prog="${esc(s.id)}" class="progwrap">${progressHtml(s, entry, ctx.nat)}</span></summary>
        ${open ? checklistBodyHtml(s, entry, ctx.nat) : ""}
      </details>
    </div>
    <div class="side">
      <button type="button" class="star" data-id="${esc(s.id)}" aria-pressed="${on}" aria-label="${on ? "Remove from" : "Add to"} shortlist: ${esc(s.name)}">${on ? "★" : "☆"}</button>
      <a class="go" href="${esc(s.url)}" target="_blank" rel="noopener">Official page ↗<span class="sr"> (${esc(s.name)}, opens in new tab)</span></a>
      ${i.kind !== "closed" ? `<button type="button" class="act" data-ics="${esc(s.id)}" aria-label="Add ${esc(s.name)} deadline to calendar">📅 Add to calendar</button>` : ""}
      <label class="cmp${cmpDisabled ? " disabled" : ""}"><input type="checkbox" data-cmp="${esc(s.id)}"${inCmp ? " checked" : ""}${cmpDisabled ? " disabled" : ""}> Compare<span class="sr"> ${esc(s.name)}</span></label>
    </div>
  </article>`;
}

export function listHtml(rows: Row[], ctx: ListContext, savedOnly: boolean): string {
  if (!rows.length) {
    return savedOnly
      ? '<div class="empty">Your shortlist is empty. Tap ☆ on any programme to add it here.</div>'
      : '<div class="empty">No programmes match these filters. Try clearing one.</div>';
  }
  return rows.map((r) => cardHtml(r, ctx)).join("");
}
