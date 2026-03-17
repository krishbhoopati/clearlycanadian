import type { Persona, Scenario, BehaviorFact, BrandFact, Evidence, ParsedQuery } from "./types";
import {
  getPersonaById,
  getScenarioById,
  getAllBehaviorFacts,
  getAllBrandFacts,
  loadBehaviorFacts,
} from "./dataLoader";

export interface RetrievalResult {
  persona: Persona;
  scenario: Scenario | null;
  relevant_behavior_facts: BehaviorFact[];
  relevant_brand_facts: BrandFact[];
}

function scoreBehaviorFact(
  fact: BehaviorFact,
  persona: Persona,
  scenario: Scenario | null
): number {
  let score = 0;
  if (fact.applies_to.includes(persona.id)) score += 3;
  if (fact.applies_to.includes(persona.generation)) score += 2;
  if (fact.applies_to.includes(persona.market)) score += 1;
  if (persona.evidence_ids.includes(fact.id)) score += 2;
  if (scenario?.required_fact_categories.includes(fact.category)) score += 2;
  return score;
}

function selectBrandFacts(all: BrandFact[]): BrandFact[] {
  return [...all].sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

export function retrieveForPersona(
  personaId: string,
  scenarioId?: string,
  options: { maxBehaviorFacts?: number } = {}
): RetrievalResult {
  const { maxBehaviorFacts = 10 } = options;
  const cap = Math.min(maxBehaviorFacts, 12);

  const persona = getPersonaById(personaId);
  const scenario = scenarioId ? getScenarioById(scenarioId) : null;

  const allBehaviorFacts = getAllBehaviorFacts();
  const scored = allBehaviorFacts
    .map((f) => ({ fact: f, score: scoreBehaviorFact(f, persona, scenario) }))
    .sort((a, b) => b.score - a.score || b.fact.confidence - a.fact.confidence);

  const positive = scored.filter((s) => s.score > 0).slice(0, cap);
  const behaviorFacts =
    positive.length >= 8
      ? positive.map((s) => s.fact)
      : [
          ...positive,
          ...scored.filter((s) => s.score === 0).slice(0, 8 - positive.length),
        ].map((s) => s.fact);

  const brandFacts = selectBrandFacts(getAllBrandFacts());

  return { persona, scenario, relevant_behavior_facts: behaviorFacts, relevant_brand_facts: brandFacts };
}

const TOPIC_SYNONYMS: Record<string, string[]> = {
  sustainability: ["sustainability", "eco", "environment", "recycle", "recyclable", "sustainable"],
  health_wellness: ["health", "wellness", "healthy", "natural", "organic"],
  zero_sugar:     ["zero sugar", "low sugar", "sugar free", "no sugar"],
  nostalgia:      ["nostalgia", "retro", "90s", "brand revival"],
  social_media:   ["tiktok", "instagram", "social media", "social discovery"],
  packaging:      ["packaging", "bottle", "glass bottle", "label"],
  convenience:    ["convenience", "impulse", "cold case"],
  price:          ["price", "cost", "affordable", "willingness to pay"],
  cans:           ["cans", "can", "aluminum"],
};

function isTopicMatch(fact: BehaviorFact, topic: string): boolean {
  if (fact.category === topic) return true;
  const synonyms = TOPIC_SYNONYMS[topic] ?? [topic];
  const haystack = (fact.statement + " " + (fact.tags ?? []).join(" ")).toLowerCase();
  return synonyms.some((s) => haystack.includes(s));
}

export function retrieveEvidence(
  parsed: ParsedQuery,
  options: { topN?: number; tagFilter?: string[] } = {}
): Evidence[] {
  const { topN = 5 } = options;
  const allFacts = loadBehaviorFacts();

  const scored = allFacts.map((fact) => {
    let s = 0;
    if (parsed.market && (fact.applies_to.includes(parsed.market) || fact.market === parsed.market)) s += 3;
    if (parsed.generation && fact.applies_to.includes(parsed.generation)) s += 2;
    if (parsed.customerType && fact.applies_to.some((a) => a.includes(parsed.customerType!))) s += 1;
    if (parsed.topic && fact.category === parsed.topic) s += 5;
    const haystack = (fact.statement + " " + (fact.tags ?? []).join(" ")).toLowerCase();
    for (const kw of parsed.keywords) {
      if (haystack.includes(kw)) s += 1;
    }
    return { fact, s };
  }).sort((a, b) => b.s - a.s || b.fact.confidence - a.fact.confidence);

  let selected: Array<{ fact: BehaviorFact; s: number }>;
  if (parsed.topic) {
    const topicMatched  = scored.filter((x) => x.s > 0 && isTopicMatch(x.fact, parsed.topic!));
    const otherPositive = scored.filter((x) => x.s > 0 && !isTopicMatch(x.fact, parsed.topic!));
    const dominantCount = Math.ceil(topN * 0.6);
    const topicSlots    = Math.min(dominantCount, topicMatched.length);
    const fillSlots     = topN - topicSlots;
    selected = [...topicMatched.slice(0, topicSlots), ...otherPositive.slice(0, fillSlots)];
    // pad with zero-scored if still short
    if (selected.length < topN) {
      const used = new Set(selected.map((x) => x.fact.id));
      selected = [...selected, ...scored.filter((x) => !used.has(x.fact.id)).slice(0, topN - selected.length)];
    }
  } else {
    const positive = scored.filter((x) => x.s > 0).slice(0, topN);
    selected = positive.length > 0 ? positive : scored.slice(0, topN);
  }

  const maxScore = selected[0]?.s ?? 1;

  return selected.map(({ fact, s }) => ({
    id: fact.id,
    text: fact.statement,
    tags: fact.tags,
    category: fact.category,
    relevanceScore: maxScore > 0 ? Math.round((s / maxScore) * 100) / 100 : 0,
    source: fact.source,
  }));
}
