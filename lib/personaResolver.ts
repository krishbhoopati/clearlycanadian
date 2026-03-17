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
  zero_sugar:     ["wellness optimizer", "social media discoverer", "wellness trend follower"],
  nostalgia:      ["nostalgia loyalist", "nostalgia + health seeker"],
  social_media:   ["social media discoverer", "wellness trend follower"],
  convenience:    ["grab-and-go maximizer"],
  packaging:      ["premium curator", "wellness trend follower", "social media discoverer"],
  health_wellness:["wellness optimizer", "nostalgia + health seeker"],
  sustainability: ["premium curator"],
  price:          ["grab-and-go maximizer", "premium water switcher"],
  cans:           ["grab-and-go maximizer", "social media discoverer"],
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
