/** Node-side loader for the split programme data (src/data/programmes/<level>/<file>.json). */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { Scholarship } from "../../src/types";

export const PROGRAMMES_DIR = fileURLToPath(new URL("../../src/data/programmes/", import.meta.url));
export const ROOT = fileURLToPath(new URL("../../", import.meta.url));

export function listProgrammeFiles(dir = PROGRAMMES_DIR): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listProgrammeFiles(p));
    else if (name.endsWith(".json")) out.push(p);
  }
  return out;
}

export interface LoadedFile {
  file: string;
  /** Path relative to the repo root, for messages. */
  rel: string;
  data: unknown;
  error?: string;
}

export function readProgrammeFiles(files = listProgrammeFiles()): LoadedFile[] {
  return files.map((file) => {
    const rel = relative(ROOT, file);
    try {
      return { file, rel, data: JSON.parse(readFileSync(file, "utf8")) };
    } catch (e) {
      return { file, rel, data: null, error: (e as Error).message };
    }
  });
}

/** All programmes from all files (throws if any file is unreadable). */
export function loadAllProgrammes(): Scholarship[] {
  const out: Scholarship[] = [];
  for (const f of readProgrammeFiles()) {
    if (f.error) throw new Error(`${f.rel}: ${f.error}`);
    out.push(...(f.data as Scholarship[]));
  }
  return out;
}
