import type { Evidence, ParsedQuery, ScoringResult, Persona, BehaviorFact, BrandFact, PersonaSimulationResult } from "./types";

export function score(evidence: Evidence[], query: ParsedQuery): ScoringResult {
  if (evidence.length === 0) {
    return {
      overallScore: 0,
      breakdown: { relevance: 0, recency: 0, coverage: 0 },
      notes: ["No evidence found for this query."],
    };
  }

  const avgRelevance =
    evidence.reduce((sum, e) => sum + (e.relevanceScore ?? 0), 0) / evidence.length;

  const categories = new Set(evidence.map((e) => e.category));
  const coverage = Math.min(categories.size / 3, 1); // normalize: 3+ categories = full coverage

  const now = Date.now();
  const recencyScores = evidence.map((e) => {
    if (!e.datePublished) return 0.5;
    const ageMs = now - new Date(e.datePublished).getTime();
    const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30);
    return Math.max(0, 1 - ageMonths / 24); // decay over 24 months
  });
  const recency = recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length;

  const overallScore = avgRelevance * 0.5 + recency * 0.25 + coverage * 0.25;

  const notes: string[] = [];
  if (avgRelevance < 0.3) notes.push("Low keyword overlap with query.");
  if (coverage === 1) notes.push(`Evidence spans ${categories.size} categories.`);
  if (query.category && categories.has(query.category))
    notes.push(`Includes evidence from target category: ${query.category}.`);

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    breakdown: {
      relevance: Math.round(avgRelevance * 100) / 100,
      recency: Math.round(recency * 100) / 100,
      coverage: Math.round(coverage * 100) / 100,
    },
    notes,
  };
}

export function scoreSimulation(
  result: PersonaSimulationResult,
  persona: Persona,
  behaviorFacts: BehaviorFact[],
  brandFacts: BrandFact[],
): { confidence: number; explanation: string } {
  const evidenceDepth = Math.min(behaviorFacts.length / 10, 1) * 0.25;
  const personaFit =
    Math.min(
      result.drivers.length /
        Math.max(persona.motivations.length + persona.buying_triggers.length, 1),
      1,
    ) * 0.35;
  const brandSupport = brandFacts.length > 0 ? 0.15 : 0;
  const base = 0.25;

  let confidence = evidenceDepth + personaFit + brandSupport + base;

  // Apply validator flag penalties
  confidence -= result.validator_flags.length * 0.08;

  // Clamp to [0.1, 0.95]
  confidence = Math.min(0.95, Math.max(0.1, confidence));
  confidence = Math.round(confidence * 100) / 100;

  const N = result.drivers.length;
  let explanation: string;
  if (confidence >= 0.75) {
    explanation = `High confidence — strong persona fit with ${N} drivers and supporting evidence.`;
  } else if (confidence >= 0.5 && brandFacts.length > 0) {
    explanation = "Moderate confidence — persona fit supported by brand facts.";
  } else if (confidence >= 0.5) {
    explanation = `Moderate confidence — ${N} drivers matched but limited brand support.`;
  } else if (result.validator_flags.includes("no_meaningful_signals")) {
    explanation = "Low confidence — no drivers or barriers identified.";
  } else if (result.validator_flags.includes("unsupported_brand_claim")) {
    explanation = "Low confidence — some drivers lack fact backing.";
  } else {
    explanation = "Low confidence — insufficient evidence or persona fit.";
  }

  return { confidence, explanation };
}
