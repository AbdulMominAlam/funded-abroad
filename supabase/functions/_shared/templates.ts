/** E-mail templates: HTML (inline styles, site palette) + plain text. Pure functions, no I/O. */
import type { AlertLevel } from "./types.ts";

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

export interface AlertItem {
  id: string;
  name: string;
  host: string;
  /** ISO 8601 with offset, e.g. 2026-11-30T23:59:00+01:00 */
  deadline: string;
  dlText: string;
  daysLeft: number;
  url: string;
  estimated: boolean;
}

const C = { bg: "#f3f5f2", surface: "#ffffff", ink: "#14201a", muted: "#5b6a62", line: "#d9e0db", accent: "#0f5c3f", warn: "#a3560a" };
const FONT = "'IBM Plex Sans','Segoe UI',system-ui,-apple-system,sans-serif";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LEVEL_LABELS: Record<AlertLevel, string> = { ug: "Undergraduate", masters: "Master's", phd: "PhD", intern: "Internships", all: "All levels" };

export function esc(t: unknown): string {
  return String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function countryName(code: string | null): string {
  if (!code) return "any nationality";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** "30 Nov 2026, 23:59 (UTC+01:00)" — shown in the programme's own time zone, as written in the data. */
export function formatDeadline(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.exec(iso);
  if (!m) return iso;
  const zone = m[6] === "Z" || m[6] === "+00:00" ? "UTC" : m[6] === "-12:00" ? "AoE, UTC-12:00" : `UTC${m[6]}`;
  return `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}, ${m[4]}:${m[5]} (${zone})`;
}

const daysText = (d: number) => (d <= 0 ? "closes today" : d === 1 ? "1 day left" : `${d} days left`);

function layout(title: string, bodyHtml: string, footerHtml: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="padding:0 4px 14px;font-size:22px;font-weight:800;letter-spacing:-0.01em;color:${C.ink};">Funded Abroad</td></tr>
<tr><td style="background:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:22px 20px;font-size:15px;line-height:1.5;">${bodyHtml}</td></tr>
<tr><td style="padding:14px 4px;font-size:12px;line-height:1.5;color:${C.muted};">${footerHtml}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${C.accent};color:#ffffff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:8px;">${esc(label)}</a>`;
}

function footer(unsubscribeUrl: string | null, siteUrl: string): { html: string; text: string } {
  const unsub = unsubscribeUrl
    ? `<a href="${esc(unsubscribeUrl)}" style="color:${C.muted};">Unsubscribe and delete my data</a> (one click) · `
    : "";
  return {
    html: `${unsub}<a href="${esc(siteUrl)}/privacy.html" style="color:${C.muted};">Privacy</a> · Always confirm deadlines on the official page before applying.`,
    text: `${unsubscribeUrl ? `Unsubscribe and delete my data (one click): ${unsubscribeUrl}\n` : ""}Privacy: ${siteUrl}/privacy.html\nAlways confirm deadlines on the official page before applying.`,
  };
}

function itemsHtml(items: AlertItem[]): string {
  return items
    .map(
      (it) => `<tr><td style="padding:12px 0;border-top:1px solid ${C.line};">
<div style="font-weight:700;font-size:16px;"><a href="${esc(it.url)}" style="color:${C.ink};text-decoration:none;">${esc(it.name)}</a></div>
<div style="color:${C.muted};font-size:13px;">${esc(it.host)}</div>
<div style="margin-top:4px;font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:13px;">Deadline: ${esc(formatDeadline(it.deadline))}${it.estimated ? " · estimated" : ""}</div>
<div style="margin-top:2px;font-weight:600;color:${it.daysLeft <= 7 ? C.warn : C.accent};">${esc(daysText(it.daysLeft))}</div>
<div style="margin-top:6px;"><a href="${esc(it.url)}" style="color:${C.accent};font-weight:600;">Official page ↗</a></div>
</td></tr>`,
    )
    .join("");
}

function itemsText(items: AlertItem[]): string {
  return items
    .map((it) => `- ${it.name} (${it.host})\n  Deadline: ${formatDeadline(it.deadline)}${it.estimated ? " (estimated)" : ""} — ${daysText(it.daysLeft)}\n  ${it.url}`)
    .join("\n\n");
}

export function renderConfirmEmail(p: { confirmUrl: string; siteUrl: string; nationality: string | null; level: AlertLevel; isUpdate: boolean }): Rendered {
  const what = `${LEVEL_LABELS[p.level]} programmes for citizens of ${countryName(p.nationality)}`;
  const subject = p.isUpdate ? "Confirm your new Funded Abroad alert settings" : "Confirm your Funded Abroad deadline alerts";
  const lead = p.isUpdate
    ? "Someone (hopefully you) asked to change the deadline alerts for this address."
    : "Someone (hopefully you) signed up for scholarship deadline alerts with this address.";
  const f = footer(null, p.siteUrl);
  const html = layout(subject, `<p style="margin:0 0 12px;">${esc(lead)}</p>
<p style="margin:0 0 16px;">Alerts will cover <b>${esc(what)}</b>. Click the button to confirm. The link works for 7 days.</p>
<p style="margin:0 0 16px;">${button(p.confirmUrl, p.isUpdate ? "Confirm new settings" : "Confirm my alerts")}</p>
<p style="margin:0;color:${C.muted};font-size:13px;">If you didn't ask for this, ignore this email: nothing will be sent, and unconfirmed sign-ups are deleted after 7 days.</p>`, f.html);
  const text = `${lead}\n\nAlerts will cover ${what}.\nConfirm (link valid for 7 days):\n${p.confirmUrl}\n\nIf you didn't ask for this, ignore this email.\n\n${f.text}`;
  return { subject, html, text };
}

export function renderDigestEmail(p: { items: AlertItem[]; siteUrl: string; unsubscribeUrl: string; nationality: string | null; level: AlertLevel }): Rendered {
  const n = p.items.length;
  const subject = `${n} scholarship deadline${n === 1 ? "" : "s"} in the next 30 days`;
  const intro = `${LEVEL_LABELS[p.level]} programmes open to citizens of ${countryName(p.nationality)} with deadlines in the next 30 days:`;
  const f = footer(p.unsubscribeUrl, p.siteUrl);
  const html = layout(subject, `<p style="margin:0 0 6px;">${esc(intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(p.items)}</table>
<p style="margin:16px 0 0;">${button(p.siteUrl, "See all programmes")}</p>`, f.html);
  const text = `${intro}\n\n${itemsText(p.items)}\n\nAll programmes: ${p.siteUrl}\n\n${f.text}`;
  return { subject, html, text };
}

export function renderReminderEmail(p: { items: AlertItem[]; siteUrl: string; unsubscribeUrl: string }): Rendered {
  const first = p.items[0];
  const subject = p.items.length === 1
    ? `Reminder: ${first.name} closes in ${first.daysLeft <= 1 ? "1 day" : `${first.daysLeft} days`}`
    : `Reminder: ${p.items.length} shortlisted deadlines are coming up`;
  const f = footer(p.unsubscribeUrl, p.siteUrl);
  const html = layout(subject, `<p style="margin:0 0 6px;">Deadlines from your shortlist are coming up:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(p.items)}</table>`, f.html);
  const text = `Deadlines from your shortlist are coming up:\n\n${itemsText(p.items)}\n\n${f.text}`;
  return { subject, html, text };
}

export function renderAdminNotice(p: { nationality: string | null; level: AlertLevel; siteUrl: string }): Rendered {
  const line = `New subscriber: ${countryName(p.nationality)}, ${LEVEL_LABELS[p.level]}`;
  const html = layout(line, `<p style="margin:0;">${esc(line)}</p>`, `Sent because NOTIFY_ADMIN_ON_CONFIRM is on. ${esc(p.siteUrl)}`);
  return { subject: line, html, text: `${line}\n\n(Sent because NOTIFY_ADMIN_ON_CONFIRM is on.)` };
}

/** Headers for one-click unsubscribe (RFC 8058), supported by Gmail, Outlook and Apple Mail. */
export function unsubscribeHeaders(unsubscribeUrl: string): Record<string, string> {
  return { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
}
