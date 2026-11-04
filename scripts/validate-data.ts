import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateScholarships } from "../src/validate";

const file = fileURLToPath(new URL("../src/data/scholarships.json", import.meta.url));
let data: unknown;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`✖ Could not read/parse ${file}:\n  ${(e as Error).message}`);
  process.exit(1);
}
const errors = validateScholarships(data);
if (errors.length) {
  console.error(`✖ scholarships.json has ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✔ scholarships.json is valid (${(data as unknown[]).length} programmes).`);
