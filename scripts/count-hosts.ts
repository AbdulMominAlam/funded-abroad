/** Prints programme counts by level and by canonical host country: npm run -s count-hosts [-- --json] */
import { loadAllProgrammes } from "./lib/programmes";
import { hostCountries } from "../src/filters";
import { LEVELS } from "../src/types";

const all = loadAllProgrammes();
const levels = Object.fromEntries(LEVELS.map((l) => [l, all.filter((s) => s.levels.includes(l)).length]));
const hosts = hostCountries(all);
if (process.argv.includes("--json")) console.log(JSON.stringify({ total: all.length, levels, hosts }, null, 1));
else {
  console.log(`Total ${all.length} · ` + Object.entries(levels).map(([l, n]) => `${l} ${n}`).join(" · "));
  console.log(`${hosts.length} host-filter options:`);
  for (const h of hosts) console.log(`  ${String(h.count).padStart(3)}  ${h.name}`);
}
