/** Prints "id | name | host | levels | file" for every programme (used to avoid duplicates when researching). */
import { readProgrammeFiles } from "./lib/programmes";
for (const f of readProgrammeFiles()) {
  if (f.error || !Array.isArray(f.data)) continue;
  for (const s of f.data as { id: string; name: string; host: string; levels: string[] }[]) {
    console.log(`${s.id} | ${s.name} | ${s.host} | ${s.levels.join("/")} | ${f.rel}`);
  }
}
