import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateGroups, validateScholarships } from "../src/validate";

const read = (rel: string): unknown => {
  const file = fileURLToPath(new URL(rel, import.meta.url));
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`✖ Could not read/parse ${file}:\n  ${(e as Error).message}`);
    process.exit(1);
  }
};

const countries = read("../src/data/countries.json") as { code: string; name: string }[];
const codes = new Set(countries.map((c) => c.code));
const groups = read("../src/data/country-groups.json");
const data = read("../src/data/scholarships.json");

const errors = [
  ...validateGroups(groups, codes).map((e) => "country-groups.json: " + e),
  ...validateScholarships(data, { countries: codes, groups: new Set(Object.keys(groups as object)) }),
];
if (errors.length) {
  console.error(`✖ Data has ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✔ scholarships.json is valid (${(data as unknown[]).length} programmes, ${codes.size} countries, ${Object.keys(groups as object).length} groups).`);
