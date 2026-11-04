import type { Scholarship } from "./types";
import { parseOpens } from "./status";

const CRLF = "\r\n";

/** UTC timestamp in iCalendar basic format, e.g. 20261130T105900Z. */
export function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** All-day date value in iCalendar format (YYYYMMDD, using the UTC date). */
export function toIcsDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export function escapeText(t: string): string {
  return t.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a content line to at most 75 octets per line (RFC 5545 §3.1), without splitting characters. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let curBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (curBytes + b > limit) {
      parts.push(cur);
      cur = "";
      curBytes = 0;
      limit = 74; // continuation lines start with a space
    }
    cur += ch;
    curBytes += b;
  }
  parts.push(cur);
  return parts.join(CRLF + " ");
}

function alarm(trigger: string, text: string): string[] {
  return ["BEGIN:VALARM", "ACTION:DISPLAY", `TRIGGER:${trigger}`, `DESCRIPTION:${escapeText(text)}`, "END:VALARM"];
}

/** VEVENT lines for one scholarship: the deadline (with 14- and 3-day reminders) and, if in the future, the opening date. */
export function eventLines(s: Scholarship, now: Date): string[] {
  const dl = new Date(s.deadline);
  const estimated = s.expected || s.varies;
  const summary = `Deadline: ${s.name}${estimated ? " (estimated)" : ""}`;
  const desc = [
    `Deadline: ${s.dlText}`,
    estimated ? "This date is an estimate or varies by course. Confirm on the official page." : "",
    s.note,
    `Official page: ${s.url}`,
    "Added from Funded Abroad.",
  ].filter(Boolean).join("\n");
  const stamp = toIcsUtc(now);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${s.id}-deadline-${toIcsDate(dl)}@funded-abroad`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtc(new Date(dl.getTime() - 30 * 60_000))}`,
    `DTEND:${toIcsUtc(dl)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(desc)}`,
    `URL:${s.url}`,
    "TRANSP:TRANSPARENT",
    ...alarm("-P14D", `14 days left: ${s.name}`),
    ...alarm("-P3D", `3 days left: ${s.name}`),
    "END:VEVENT",
  ];
  const opens = parseOpens(s.opens);
  if (opens && opens > now) {
    const next = new Date(opens.getTime() + 86_400_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.id}-opens-${toIcsDate(opens)}@funded-abroad`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toIcsDate(opens)}`,
      `DTEND;VALUE=DATE:${toIcsDate(next)}`,
      `SUMMARY:${escapeText(`Applications open: ${s.name}${s.expected ? " (estimated)" : ""}`)}`,
      `DESCRIPTION:${escapeText(`Deadline: ${s.dlText}\nOfficial page: ${s.url}`)}`,
      `URL:${s.url}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  return lines;
}

/** Build a complete .ics calendar. Deadlines are written in UTC so every calendar app shows the correct local time. */
export function buildCalendar(items: readonly Scholarship[], now: Date, name = "Funded Abroad deadlines"): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Funded Abroad//Scholarship deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    ...items.flatMap((s) => eventLines(s, now)),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join(CRLF) + CRLF;
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
