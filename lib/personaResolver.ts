import type { Persona, ParsedQuery } from "./types";
import { loadPersonas } from "./dataLoader";

export function resolvePersona(id: string): Persona | null {
  const personas = loadPersonas();
  return personas.find((p) => p.id === id) ?? null;
}

export function listPersonas(): Persona[] {
  return loadPersonas();
}

const TOPIC_AFFINITY: Record<string, string[]> = {
  zero_sugar:      ["health_wellness", "sober_curious", "general_potential"],
  nostalgia:       ["nostalgia_loyalist"],
  social_media:    ["general_potential", "sober_curious"],
  convenience:     ["convenience_first"],
  packaging:       ["premium_lifestyle", "sober_curious", "general_potential"],
  health_wellness: ["health_wellness", "nostalgia_loyalist"],
  sustainability:  ["premium_lifestyle", "health_wellness", "sober_curious"],
  price:           ["convenience_first", "household_decision_maker"],
  cans:            ["convenience_first", "general_potential"],
  bar:             ["bartender_mixologist", "sober_curious", "premium_lifestyle"],
  maple:           ["bartender_mixologist", "premium_lifestyle", "nostalgia_loyalist"],
};

export function resolvePanel(
  parsed: ParsedQuery,
  options: { maxSize?: number } = {}
): Persona[] {
  const maxSize = options.maxSize ?? 4;
  const personas = loadPersonas();

  const affinitySegments = parsed.topic ? (TOPIC_AFFINITY[parsed.topic] ?? []) : [];

  const scored = personas.map((p) => {
    let points = 0;
    if (parsed.market && parsed.market === p.market) points += 3;
    if (parsed.generation && parsed.generation === p.generation) points += 2;
    if (parsed.customerType && parsed.customerType === p.customer_type) points += 1;
    if (affinitySegments.includes(p.behavioral_segment)) points += 2;
    return { persona: p, score: points };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, maxSize).map((s) => s.persona);

  // Enforce minimum 2 even if scores are 0
  if (top.length < 2 && scored.length >= 2) {
    return scored.slice(0, 2).map((s) => s.persona);
  }

  return top;
}
