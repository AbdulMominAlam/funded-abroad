import type { Scholarship } from "../types";
import { getStatus } from "../status";
import { esc } from "./dom";

const fmtM = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export const shortName = (n: string): string =>
  n.replace(/\s*\(.*?\)\s*/g, " ").replace(/ Scholarships?$| Fellowships?$/, "").trim();

/** Six-month deadline strip, starting with the current month (device time zone). */
export function stripHtml(data: readonly Scholarship[], now: Date): string {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  let html = "";
  for (let m = 0; m < 6; m++) {
    const ms = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const me = new Date(start.getFullYear(), start.getMonth() + m + 1, 1);
    const items = data
      .map((s) => ({ s, i: getStatus(s, now) }))
      .filter(({ i }) => i.kind !== "closed" && i.deadline >= ms && i.deadline < me)
      .sort((a, b) => a.i.deadline.getTime() - b.i.deadline.getTime());
    html += `<div class="month ${m === 0 ? "now" : ""}"><div class="mname">${fmtM.format(ms)}</div><ul>${
      items.length
        ? items.map(({ s, i }) => `<li class="${i.kind === "soon" ? "soon" : ""}"><button type="button" data-jump="${esc(s.id)}" aria-label="${esc(s.name)}, deadline ${esc(s.dlText)}"><span class="d">${s.expected || s.varies ? "~" : ""}${i.deadline.getDate()}</span><span class="n">${esc(shortName(s.name))}</span></button></li>`).join("")
        : '<li style="color:var(--muted);font-size:.8rem">No deadlines</li>'
    }</ul></div>`;
  }
  return html;
}
