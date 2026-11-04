/**
 * Validates programme data.
 *   npm run validate-data                         # every file under src/data/programmes
 *   npm run validate-data -- path/to/file.json    # only these files (ids are still checked against all other files)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { duplicateNameKey, validateGroups, validateScholarships } from "../src/validate";
import { listProgrammeFiles, readProgrammeFiles } from "./lib/programmes";

const read = (rel: string): unknown => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
const countries = read("../src/data/countries.json") as { code: string }[];
const codes = new Set(countries.map((c) => c.code));
const groups = read("../src/data/country-groups.json");
const ctx = { countries: codes, groups: new Set(Object.keys(groups as object)) };

const only = process.argv.slice(2).filter((a) => !a.startsWith("--")).map((p) => resolve(p));
const all = readProgrammeFiles(listProgrammeFiles());
const targets = only.length ? all.filter((f) => only.includes(f.file)) : all;
if (only.length && targets.length !== only.length) {
  console.error("✖ Not found under src/data/programmes: " + only.filter((p) => !all.some((f) => f.file === p)).join(", "));
  process.exit(1);
}

const errors: string[] = validateGroups(groups, codes).map((e) => "country-groups.json: " + e);
let count = 0;
for (const f of targets) {
  if (f.error) { errors.push(`${f.rel}: invalid JSON: ${f.error}`); continue; }
  for (const e of validateScholarships(f.data, ctx)) errors.push(`${f.rel}: ${e}`);
  if (Array.isArray(f.data)) count += f.data.length;
}
// Cross-file duplicates: same id, or same normalised name + host.
const seenId = new Map<string, string>();
const seenName = new Map<string, string>();
for (const f of all) {
  if (f.error || !Array.isArray(f.data)) continue;
  const isTarget = targets.includes(f);
  for (const s of f.data as { id?: unknown; name?: unknown; host?: unknown }[]) {
    if (typeof s?.id !== "string") continue;
    const prevId = seenId.get(s.id);
    if (prevId && prevId !== f.rel) { if (isTarget || targets.some((t) => t.rel === prevId)) errors.push(`${f.rel}: id "${s.id}" already used in ${prevId}`); }
    else seenId.set(s.id, f.rel);
    if (typeof s.name === "string" && typeof s.host === "string") {
      const k = duplicateNameKey(s.name, s.host);
      const prev = seenName.get(k);
      if (prev && prev !== `${f.rel}#${s.id}`) { if (isTarget || targets.some((t) => prev.startsWith(t.rel + "#"))) errors.push(`${f.rel}: "${s.name}" (${s.id}) looks like a duplicate of ${prev}`); }
      else seenName.set(k, `${f.rel}#${s.id}`);
    }
  }
}
if (errors.length) {
  console.error(`✖ Data has ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✔ ${targets.length} file(s), ${count} programmes valid${only.length ? "" : ` (${codes.size} countries, ${Object.keys(groups as object).length} groups)`}.`);
