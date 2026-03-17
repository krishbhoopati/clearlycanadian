import type { Evidence, ParsedQuery, AggregatedResult } from "./types";

export function aggregate(evidence: Evidence[], _query: ParsedQuery): AggregatedResult {
  const byCategory: Record<string, Evidence[]> = {};
  const seen = new Set<string>();
  const topEvidence: Evidence[] = [];

  for (const item of evidence) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);

    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
    topEvidence.push(item);
  }

  return {
    byCategory,
    topEvidence,
    totalCount: topEvidence.length,
  };
}
