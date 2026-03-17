import type { QueryResult, ScoringResult, PanelData } from "./types";

export function buildPanel(queryResult: QueryResult, scoringResult: ScoringResult): PanelData {
  return {
    title: `Results for: "${queryResult.query}"`,
    evidenceItems: queryResult.evidence,
    scoringResult,
    queryResult,
  };
}
