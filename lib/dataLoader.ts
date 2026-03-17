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

// ─── Strict helpers ────────────────────────────────────────────────────────────

function loadJSONStrict<T>(filename: string): T {
  const filepath = path.join(PROCESSED_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`[dataLoader] Required file not found: ${filepath}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch (e) {
    throw new Error(`[dataLoader] Failed to parse ${filename}: ${(e as Error).message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`[dataLoader] Expected array in ${filename}, got ${typeof parsed}`);
  }
  return parsed as T;
}

function validatePersona(p: unknown, index: number): asserts p is Persona {
  const r = p as Record<string, unknown>;
  if (!r.id || !r.name) {
    throw new Error(`[dataLoader] personas.json[${index}] missing required field id or name`);
  }
}

function validateScenario(s: unknown, index: number): asserts s is Scenario {
  const r = s as Record<string, unknown>;
  if (!r.id || !r.name) {
    throw new Error(`[dataLoader] scenarios.json[${index}] missing required field id or name`);
  }
}

function validateBehaviorFact(b: unknown, index: number): asserts b is BehaviorFact {
  const r = b as Record<string, unknown>;
  if (!r.id || !r.statement) {
    throw new Error(`[dataLoader] behavior_facts.json[${index}] missing required field id or statement`);
  }
}

function validateBrandFact(b: unknown, index: number): asserts b is BrandFact {
  const r = b as Record<string, unknown>;
  if (!r.id || !r.statement) {
    throw new Error(`[dataLoader] brand_truth.json[${index}] missing required field id or statement`);
  }
}

export function getAllPersonas(): Persona[] {
  const items = loadJSONStrict<Persona[]>("personas.json");
  items.forEach(validatePersona);
  return items;
}

export function getPersonaById(id: string): Persona {
  const persona = getAllPersonas().find((p) => p.id === id);
  if (!persona) throw new Error(`[dataLoader] Persona not found: ${id}`);
  return persona;
}

export function getAllScenarios(): Scenario[] {
  const items = loadJSONStrict<Scenario[]>("scenarios.json");
  items.forEach(validateScenario);
  return items;
}

export function getScenarioById(id: string): Scenario {
  const scenario = getAllScenarios().find((s) => s.id === id);
  if (!scenario) throw new Error(`[dataLoader] Scenario not found: ${id}`);
  return scenario;
}

export function getAllBehaviorFacts(): BehaviorFact[] {
  const items = loadJSONStrict<BehaviorFact[]>("behavior_facts.json");
  items.forEach(validateBehaviorFact);
  return items;
}

export function getAllBrandFacts(): BrandFact[] {
  const items = loadJSONStrict<BrandFact[]>("brand_truth.json");
  items.forEach(validateBrandFact);
  return items;
}
