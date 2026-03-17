import type { Evidence, ParsedQuery } from "./types";
import { loadEvidence } from "./dataLoader";

interface RetrievalOptions {
  topN?: number;
  categoryFilter?: string;
  tagFilter?: string[];
}

function scoreEvidence(evidence: Evidence, query: ParsedQuery): number {
  const textLower = evidence.text.toLowerCase();
  const evidenceTags = evidence.tags.map((t) => t.toLowerCase());

  let score = 0;

  for (const kw of query.keywords) {
    if (textLower.includes(kw)) score += 0.1;
    if (evidenceTags.includes(kw)) score += 0.2;
  }

  if (query.category && evidence.category === query.category) score += 0.3;

  return Math.min(score, 1);
}

export function retrieveEvidence(
  query: ParsedQuery,
  options: RetrievalOptions = {}
): Evidence[] {
  const { topN = 5, categoryFilter, tagFilter } = options;

  let corpus = loadEvidence();

  if (categoryFilter) {
    corpus = corpus.filter((e) => e.category === categoryFilter);
  }

  if (tagFilter && tagFilter.length > 0) {
    corpus = corpus.filter((e) =>
      tagFilter.some((t) => e.tags.map((et) => et.toLowerCase()).includes(t.toLowerCase()))
    );
  }

  const scored = corpus
    .map((e) => ({ ...e, relevanceScore: scoreEvidence(e, query) }))
    .filter((e) => e.relevanceScore > 0)
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

  // If nothing scored, return top N unscored items as fallback
  if (scored.length === 0) {
    return corpus.slice(0, topN);
  }

  return scored.slice(0, topN);
}
