import { loadPersonas } from "./dataLoader";
import type { PersonaSimulationResult, BehaviorFact, BrandFact } from "./types";

export function validateQuery(text: string): string | null {
  if (!text || text.trim().length === 0) return "Query cannot be empty.";
  if (text.trim().length < 3) return "Query is too short. Please enter at least 3 characters.";
  if (text.length > 500) return "Query is too long. Please keep it under 500 characters.";
  return null;
}

export function validatePersonaId(id: string): boolean {
  const personas = loadPersonas();
  return personas.some((p) => p.id === id);
}

export function validateSimulationResult(
  result: PersonaSimulationResult,
  behaviorFacts: BehaviorFact[],
  brandFacts: BrandFact[],
): string[] {
  const flags: string[] = [];

  // 1. Unsupported brand claims
  const hasUnsupported = result.drivers.some((driver) => {
    const idx = driver.indexOf(" supported by:");
    if (idx === -1) return false;
    const snippet = driver.slice(idx + " supported by:".length).trim();
    const inBehavior = behaviorFacts.some((f) => f.statement.includes(snippet));
    const inBrand = brandFacts.some((f) => f.statement.includes(snippet));
    return !inBehavior && !inBrand;
  });
  if (hasUnsupported) flags.push("unsupported_brand_claim");

  // 2. Missing evidence usage
  if (result.used_evidence_ids.length === 0) flags.push("missing_evidence_usage");

  // 3. No meaningful signals
  if (result.drivers.length === 0 && result.barriers.length === 0) flags.push("no_meaningful_signals");

  // 4. Invalid decision label
  const validDecisions = [
    "likely_try",
    "likely_reject",
    "mixed_interest",
    "likely_repeat",
    "low_awareness_high_potential",
  ];
  if (!validDecisions.includes(result.decision)) flags.push("invalid_decision_label");

  return flags;
}
