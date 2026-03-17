import fs from "fs";
import path from "path";
import type { Persona, Scenario, BehaviorFact, BrandFact } from "./types";

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

/** @deprecated Use loadBehaviorFacts() instead. Returns empty array. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadEvidence(): any[] {
  return [];
}

export function loadBehaviorFacts(): BehaviorFact[] {
  return loadJSON<BehaviorFact[]>("behavior_facts.json");
}

export function loadBrandFacts(): BrandFact[] {
  return loadJSON<BrandFact[]>("brand_truth.json");
}

export function clearCache(): void {
  Object.keys(cache).forEach((k) => delete cache[k]);
}
