import type { Scenario } from "./types";
import { loadScenarios } from "./dataLoader";

export function resolveScenario(id: string): Scenario | null {
  const scenarios = loadScenarios();
  return scenarios.find((s) => s.id === id) ?? null;
}

export function listScenarios(): Scenario[] {
  return loadScenarios();
}
