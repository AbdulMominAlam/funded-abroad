import type { Scholarship } from "../types";
import { REGIONS } from "../types";
import { formatCountdown, getStatus } from "../status";
import { progress } from "../checklist";
import type { ChecklistState } from "../storage";
import { esc } from "./dom";

const yn = (v: boolean, yes = "Yes", no = "No") => `<span class="${v ? "yes" : "no"}">${v ? yes : no}</span>`;

export function compareTableHtml(items: readonly Scholarship[], now: Date, checklists: ChecklistState): string {
  const rows: [string, (s: Scholarship) => string][] = [
    ["Host", (s) => `${esc(s.host)}<br>${esc(s.country)} · ${esc(REGIONS[s.region])}`],
    ["Funding", (s) => yn(s.full, "Fully funded", "Partial")],
    ["Amount", (s) => esc(s.amount)],
    ["Levels", (s) => esc(s.levels.join(", "))],
    ["Deadline", (s) => {
      const i = getStatus(s, now);
      const c = formatCountdown(i.msLeft);
      return `${esc(s.dlText)}<br><b>${esc(i.label)}</b>${i.kind === "closed" ? (s.nextText ? " · " + esc(s.nextText) : "") : ` · ${esc(c.big)} ${esc(c.small)}`}`;
    }],
    ["Opens", (s) => (s.opens ? esc(s.opens.slice(0, 10)) : "—")],
    ["Fields", (s) => esc(s.fields)],
    ["Apply from outside Pakistan", (s) => yn(s.abroad)],
    ["No work experience needed", (s) => yn(!s.work)],
    ["HEC nomination", (s) => (s.hec ? `<span class="no">Required</span>` : "Not needed")],
    ["Nomination by university", (s) => (s.nomination ? `<span class="no">Required</span>` : "Not needed")],
    ["Requirements", (s) => (s.tags.length ? `<ul>${s.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "—")],
    ["Your checklist", (s) => { const p = progress(s, checklists[s.id]); return `${p.done}/${p.total} done`; }],
    ["Notes", (s) => esc(s.note)],
    ["Official page", (s) => `<a class="go" href="${esc(s.url)}" target="_blank" rel="noopener">Open ↗</a>`],
  ];
  return `<table>
    <caption class="sr">Side-by-side comparison of ${items.length} programmes</caption>
    <thead><tr><td></td>${items.map((s) => `<th scope="col">${esc(s.name)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([label, f]) => `<tr><th scope="row">${esc(label)}</th>${items.map((s) => `<td>${f(s)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;
}
