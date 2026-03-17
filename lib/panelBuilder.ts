import type { QueryResult, ScoringResult, PanelData, Persona } from "./types";

export function buildPanel(
  queryResult: QueryResult,
  scoringResult: ScoringResult,
  personas: Persona[] = []
): PanelData {
  return {
    title: personas.length > 0
      ? `Panel (${personas.length} personas): "${queryResult.query}"`
      : `Results for: "${queryResult.query}"`,
    evidenceItems: queryResult.evidence,
    scoringResult,
    queryResult,
    personas,
  };
}
