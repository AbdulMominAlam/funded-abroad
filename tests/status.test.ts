import { describe, expect, it } from "vitest";
import { DAY_MS, deadlineRank, formatCountdown, getStatus, parseOpens } from "../src/status";
import { make, NOW } from "./fixtures";

describe("getStatus", () => {
  it("is open when the deadline is more than 30 days away", () => {
    const i = getStatus(make({ deadline: "2027-02-01T23:59:00+01:00" }), NOW);
    expect(i.kind).toBe("open");
    expect(i.group).toBe("open");
    expect(i.label).toBe("Open");
    expect(i.days).toBe(90);
  });

  it("is closing soon at exactly 30 days and below", () => {
    const at30 = new Date(NOW.getTime() + 30 * DAY_MS).toISOString();
    expect(getStatus(make({ deadline: at30 }), NOW).kind).toBe("soon");
    const i = getStatus(make({ deadline: "2026-11-30T11:59:00+01:00" }), NOW);
    expect(i.kind).toBe("soon");
    expect(i.label).toBe("Closing soon");
    expect(i.group).toBe("open");
    expect(i.days).toBe(26);
  });

  it("is open (not soon) at 31 days", () => {
    const at31 = new Date(NOW.getTime() + 30 * DAY_MS + 1000).toISOString();
    expect(getStatus(make({ deadline: at31 }), NOW).kind).toBe("open");
  });

  it("is upcoming when applications open in the future", () => {
    const i = getStatus(make({ opens: "2027-01-10", deadline: "2027-02-20T23:59:00+03:00" }), NOW);
    expect(i.kind).toBe("upcoming");
    expect(i.group).toBe("up");
    expect(i.label).toBe("Opens 10 Jan");
    expect(i.opens?.toISOString()).toBe("2027-01-10T00:00:00.000Z");
  });

  it("upcoming wins over expected while the opening date is in the future", () => {
    expect(getStatus(make({ opens: "2026-11-15", expected: true }), NOW).kind).toBe("upcoming");
  });

  it("is expected when the date is estimated and already open (or no opening date)", () => {
    const i = getStatus(make({ expected: true }), NOW);
    expect(i.kind).toBe("expected");
    expect(i.group).toBe("up");
    expect(i.label).toBe("Expected");
    expect(getStatus(make({ expected: true, opens: "2026-10-01" }), NOW).kind).toBe("expected");
  });

  it("is varies when the deadline depends on the course", () => {
    const i = getStatus(make({ varies: true, deadline: "2026-11-20T23:59:00+01:00" }), NOW);
    expect(i.kind).toBe("varies");
    expect(i.group).toBe("open");
    expect(i.label).toBe("Varies");
  });

  it("is closed once the deadline has passed", () => {
    const i = getStatus(make({ deadline: "2026-10-06T11:00:00+00:00", nextText: "Next round ~Aug 2027" }), NOW);
    expect(i.kind).toBe("closed");
    expect(i.group).toBe("closed");
    expect(i.label).toBe("Closed");
    expect(i.days).toBeLessThan(0);
  });

  it("is closed even a few hours after the deadline (no '0 days left')", () => {
    const i = getStatus(make({ deadline: "2026-11-04T09:00:00+00:00" }), NOW);
    expect(i.kind).toBe("closed");
  });

  it("closed beats expected/varies/upcoming", () => {
    for (const over of [{ expected: true }, { varies: true }, { opens: "2027-01-01" }]) {
      expect(getStatus(make({ deadline: "2026-10-01T00:00:00Z", ...over }), NOW).kind).toBe("closed");
    }
  });

  it("respects the deadline's time zone", () => {
    // 23:59 in UTC+5 on 4 Nov is 18:59Z, i.e. still open at 12:00Z.
    expect(getStatus(make({ deadline: "2026-11-04T23:59:00+05:00" }), NOW).kind).toBe("soon");
    // 11:59 in UTC+5 is 06:59Z — already passed at 12:00Z.
    expect(getStatus(make({ deadline: "2026-11-04T11:59:00+05:00" }), NOW).kind).toBe("closed");
  });
});

describe("formatCountdown", () => {
  it("shows whole days (rounded up) from 2 days", () => {
    expect(formatCountdown(2 * DAY_MS)).toEqual({ big: "2", small: "days left" });
    expect(formatCountdown(10.2 * DAY_MS)).toEqual({ big: "11", small: "days left" });
  });
  it("shows hours and minutes in the last 48 hours", () => {
    expect(formatCountdown(47 * 3_600_000 + 5 * 60_000)).toEqual({ big: "47h 5m", small: "left" });
    expect(formatCountdown(20 * 60_000)).toEqual({ big: "20m", small: "left" });
  });
  it("shows a dash once closed", () => {
    expect(formatCountdown(0).big).toBe("—");
    expect(formatCountdown(-5).big).toBe("—");
  });
});

describe("parseOpens / deadlineRank", () => {
  it("parses dates and rejects garbage", () => {
    expect(parseOpens(undefined)).toBeNull();
    expect(parseOpens("nope")).toBeNull();
    expect(parseOpens("2027-01-10T09:00:00+03:00")?.toISOString()).toBe("2027-01-10T06:00:00.000Z");
  });
  it("ranks open before closed, nearest first, most recently closed first", () => {
    const a = getStatus(make({ deadline: "2026-12-01T00:00:00Z" }), NOW);
    const b = getStatus(make({ deadline: "2027-03-01T00:00:00Z" }), NOW);
    const c1 = getStatus(make({ deadline: "2026-10-30T00:00:00Z" }), NOW);
    const c2 = getStatus(make({ deadline: "2026-08-01T00:00:00Z" }), NOW);
    const sorted = [c2, b, c1, a].sort((x, y) => deadlineRank(x) - deadlineRank(y));
    expect(sorted).toEqual([a, b, c1, c2]);
  });
});
