import type { Evidence, Persona, ParsedQuery } from "./types";

const INTENT_OPENERS: Record<string, string> = {
  explore:  "Based on available research,",
  compare:  "Comparing the evidence,",
  validate: "The data suggests that",
  explain:  "The underlying reasons appear to be",
};

export function composeSummary(query: ParsedQuery, evidence: Evidence[]): string {
  const opener = INTENT_OPENERS[query.intent] ?? "Based on available research,";

  if (evidence.length === 0) {
    return `${opener} no matching evidence was found for "${query.rawText}". Try broadening your query or selecting a different scenario.`;
  }

  const topTexts = evidence
    .slice(0, 3)
    .map((e) => e.text)
    .join(" Additionally, ");

  const categoryList = [...new Set(evidence.map((e) => e.category))].join(", ");

  return `${opener} ${topTexts} This evidence spans the following categories: ${categoryList}.`;
}

export function composePersonaReply(
  persona: Persona,
  userMessage: string,
  evidence: Evidence[]
): string {
  const valueStr = persona.shoppingValues.slice(0, 2).join(" and ");
  const evidenceHint =
    evidence.length > 0
      ? ` The research backs this up — ${evidence[0].text.slice(0, 100)}...`
      : "";

  const priceNote =
    persona.priceElasticity > 0.7
      ? "Price is a big deal for me."
      : persona.priceElasticity < 0.3
      ? "Price is less of a concern honestly."
      : "I try to balance price with quality.";

  return (
    `As someone from ${persona.region} who values ${valueStr}, here's my take on "${userMessage}": ` +
    `${priceNote}${evidenceHint}`
  );
}
