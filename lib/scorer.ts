import type { Evidence, ParsedQuery, ScoringResult } from "./types";

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
