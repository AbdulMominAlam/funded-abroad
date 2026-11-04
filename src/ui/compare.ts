import type { Scholarship } from "../types";
import { REGIONS } from "../types";
import { formatCountdown, getStatus } from "../status";
import { progress } from "../checklist";
import type { ChecklistState } from "../storage";
import { eligibilityFor, type CountryNames, type Groups } from "../eligibility";
import { esc } from "./dom";

const yn = (v: boolean, yes = "Yes", no = "No") => `<span class="${v ? "yes" : "no"}">${v ? yes : no}</span>`;

export function compareTableHtml(items: readonly Scholarship[], now: Date, checklists: ChecklistState, nat: string | null, groups: Groups, names: CountryNames): string {
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
    [nat ? `Eligible (${names[nat] ?? nat})` : "Who can apply", (s) => {
      const e = eligibilityFor(s, nat, groups, names);
      if (e.status === "eligible") return `<span class="yes">Yes</span><br>${esc(e.reason)}`;
      if (e.status === "ineligible") return `<span class="no">No</span><br>${esc(e.reason)}`;
      if (e.status === "check") return `<span class="no">Check</span><br>${esc(e.reason)}`;
      return esc(e.reason);
    }],
    ["No need to live in home country", (s) => yn(!s.residencyRequired)],
    ["No work experience needed", (s) => yn(!s.work)],
    ["Nomination", (s) => (s.nominationBody ? `<span class="no">Required</span><br>${esc(s.nominationBody)}` : "Not needed")],
    ...(nat ? [[`Notes for ${names[nat] ?? nat}`, (s: Scholarship) => esc(s.countryNotes?.[nat] ?? "—")] as [string, (s: Scholarship) => string]] : []),
    ["Requirements", (s) => (s.tags.length ? `<ul>${s.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "—")],
    ["Your checklist", (s) => { const p = progress(s, checklists[s.id], nat); return `${p.done}/${p.total} done`; }],
    ["Notes", (s) => esc(s.note)],
    ["Official page", (s) => `<a class="go" href="${esc(s.url)}" target="_blank" rel="noopener">Open ↗</a>`],
  ];
  return `<table>
    <caption class="sr">Side-by-side comparison of ${items.length} programmes</caption>
    <thead><tr><td></td>${items.map((s) => `<th scope="col">${esc(s.name)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([label, f]) => `<tr><th scope="row">${esc(label)}</th>${items.map((s) => `<td>${f(s)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;
}
