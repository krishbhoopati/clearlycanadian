import type { ParsedQuery } from "./types";

const INTENT_KEYWORDS: Record<ParsedQuery["intent"], string[]> = {
  explore:  ["what", "how", "tell me", "describe", "overview", "explain"],
  compare:  ["compare", "versus", "vs", "difference", "better", "prefer"],
  validate: ["is it true", "do canadians", "are consumers", "does", "verify"],
  explain:  ["why", "reason", "cause", "because", "due to"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  grocery:     ["grocery", "food", "supermarket", "produce", "meat", "dairy"],
  electronics: ["electronics", "tech", "phone", "laptop", "device", "gadget"],
  apparel:     ["clothing", "apparel", "fashion", "shoes", "wear", "outfit"],
  automotive:  ["car", "vehicle", "auto", "truck", "ev", "electric vehicle"],
  health:      ["health", "pharmacy", "vitamin", "wellness", "supplement"],
};

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been",
  "do", "does", "did", "will", "would", "could", "should", "can",
  "i", "me", "my", "you", "your", "we", "us", "our", "it", "its",
  "in", "on", "at", "to", "for", "of", "and", "or", "but", "not",
  "with", "about", "from", "this", "that", "what", "how", "why",
]);

function detectIntent(text: string): ParsedQuery["intent"] {
  const lower = text.toLowerCase();
  for (const [intent, words] of Object.entries(INTENT_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) {
      return intent as ParsedQuery["intent"];
    }
  }
  return "explore";
}

function detectCategory(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return category;
  }
  return undefined;
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function parseQuery(rawText: string): ParsedQuery {
  const keywords = extractKeywords(rawText);
  const intent = detectIntent(rawText);
  const category = detectCategory(rawText);

  const personaMatch = rawText.match(/\bas\s+([a-z-]+(?:\s+[a-z-]+)*)/i);
  const scenarioMatch = rawText.match(/\bscenario[:\s]+([a-z-]+(?:\s+[a-z-]+)*)/i);

  return {
    rawText,
    keywords,
    intent,
    category,
    personaFilter: personaMatch?.[1]?.trim().toLowerCase().replace(/\s+/g, "-"),
    scenarioFilter: scenarioMatch?.[1]?.trim().toLowerCase().replace(/\s+/g, "-"),
  };
}
