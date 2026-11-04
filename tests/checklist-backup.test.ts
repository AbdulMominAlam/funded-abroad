import { describe, expect, it } from "vitest";
import { addCustomItem, defaultChecklist, progress, removeCustomItem, toggleItem } from "../src/checklist";
import { buildExport, mergeImport, parseExport } from "../src/backup";
import { make } from "./fixtures";

describe("checklist", () => {
  it("has the default items", () => {
    const ids = defaultChecklist(make()).map((i) => i.id);
    expect(ids).toEqual(["transcripts", "cv", "sop", "refs", "english", "passport"]);
  });
  it("derives programme-specific items", () => {
    const s = make({ countryNotes: { PK: "Apply on the HEC portal as well." }, nominationBody: "Your national agency", residencyRequired: true, tags: ["GRE required", "2 years work experience", "No IELTS needed"], checklist: ["Research proposal draft"] });
    const ids = defaultChecklist(s, "PK").map((i) => i.id);
    expect(defaultChecklist(s, "IN").map((i) => i.id)).not.toContain("hec-portal");
    expect(ids).toContain("nomination");
    expect(ids).toContain("residence-proof");
    expect(ids).toContain("hec-portal");
    expect(ids).toContain("gre");
    expect(ids).toContain("work-proof");
    expect(ids).not.toContain("english");
    expect(ids).toContain("x-research-proposal-draft");
  });
  it("uses the specific English score when tagged", () => {
    expect(defaultChecklist(make({ tags: ["IELTS 7.0 / TOEFL 100"] })).find((i) => i.id === "english")?.text).toBe("English test (IELTS 7.0 / TOEFL 100)");
  });
  it("tracks progress with custom items", () => {
    const s = make();
    let st = toggleItem({}, s.id, "cv", true);
    st = addCustomItem(st, s.id, "  Ask Dr. X  ", 1);
    const custom = st[s.id].custom[0];
    expect(custom.text).toBe("Ask Dr. X");
    st = toggleItem(st, s.id, custom.id, true);
    expect(progress(s, st[s.id])).toEqual({ done: 2, total: 7 });
    st = removeCustomItem(st, s.id, custom.id);
    expect(progress(s, st[s.id])).toEqual({ done: 1, total: 6 });
    expect(addCustomItem(st, s.id, "   ")).toBe(st);
  });
});

describe("export / import", () => {
  it("round-trips and merges", () => {
    const file = JSON.stringify(buildExport(new Set(["a", "zzz"]), { a: { done: ["cv"], custom: [{ id: "c1", text: "x" }] } }));
    const parsed = parseExport(file);
    const r = mergeImport(new Set(["b"]), { a: { done: ["refs"], custom: [] } }, parsed, new Set(["a", "b"]));
    expect([...r.shortlist].sort()).toEqual(["a", "b"]);
    expect(r.added).toBe(1);
    expect(r.unknown).toBe(1);
    expect(r.checklists.a.done.sort()).toEqual(["cv", "refs"]);
    expect(r.checklists.a.custom).toEqual([{ id: "c1", text: "x" }]);
  });
  it("rejects bad files", () => {
    expect(() => parseExport("{")).toThrow(/JSON/);
    expect(() => parseExport('{"app":"other"}')).toThrow(/export/);
    expect(() => parseExport('{"app":"funded-abroad","version":99}')).toThrow(/newer/);
    expect(() => parseExport('{"app":"funded-abroad","version":1,"checklists":{"a":5}}')).toThrow(/damaged/);
  });
});
