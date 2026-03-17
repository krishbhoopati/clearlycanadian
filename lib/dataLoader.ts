import fs from "fs";
import path from "path";
import type { Persona, Scenario, Evidence } from "./types";

const PROCESSED_DIR = path.join(process.cwd(), "data", "processed");

const cache: Record<string, unknown> = {};

function loadJSON<T>(filename: string): T {
  if (cache[filename]) return cache[filename] as T;

  const filepath = path.join(PROCESSED_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.warn(`[dataLoader] Missing file: ${filepath}. Returning empty fallback.`);
    const fallback = ([] as unknown) as T;
    cache[filename] = fallback;
    return fallback;
  }

  const raw = fs.readFileSync(filepath, "utf-8");
  const parsed = JSON.parse(raw) as T;
  cache[filename] = parsed;
  return parsed;
}

export function loadPersonas(): Persona[] {
  return loadJSON<Persona[]>("personas.json");
}

export function loadScenarios(): Scenario[] {
  return loadJSON<Scenario[]>("scenarios.json");
}

export function loadEvidence(): Evidence[] {
  return loadJSON<Evidence[]>("evidence.json");
}

export function clearCache(): void {
  Object.keys(cache).forEach((k) => delete cache[k]);
}
