import { describe, expect, it } from "vitest";
import { buildCalendar, escapeText, foldLine, toIcsUtc } from "../src/ics";
import { make, NOW } from "./fixtures";

describe("ics", () => {
  it("converts the deadline to UTC correctly", () => {
    expect(toIcsUtc(new Date("2026-11-30T11:59:00+01:00"))).toBe("20261130T105900Z");
    expect(toIcsUtc(new Date("2027-04-30T14:00:00+10:00"))).toBe("20270430T040000Z");
  });
  it("escapes text", () => expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\;c\\\\d\\ne"));
  it("folds long lines at 75 octets", () => {
    const folded = foldLine("DESCRIPTION:" + "é".repeat(100));
    for (const line of folded.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.split("\r\n").map((l, i) => (i ? l.slice(1) : l)).join("")).toBe("DESCRIPTION:" + "é".repeat(100));
  });
  it("builds a calendar with deadline and two reminders", () => {
    const ics = buildCalendar([make({ deadline: "2026-11-30T11:59:00+01:00", name: "ETH, Excellence" })], NOW);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTEND:20261130T105900Z");
    expect(ics).toContain("TRIGGER:-P14D");
    expect(ics).toContain("TRIGGER:-P3D");
    expect(ics).toContain("SUMMARY:Deadline: ETH\\, Excellence");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
  it("adds an 'applications open' event for future opening dates and marks estimates", () => {
    const ics = buildCalendar([make({ opens: "2027-01-10", expected: true })], NOW);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270110");
    expect(ics).toContain("(estimated)");
  });
  it("puts multiple programmes into one file", () => {
    const ics = buildCalendar([make({ id: "a" }), make({ id: "b" })], NOW);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("UID:a-deadline-");
    expect(ics).toContain("UID:b-deadline-");
  });
});
