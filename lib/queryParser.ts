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

function detectMarket(text: string): ParsedQuery["market"] {
  const lower = text.toLowerCase();
  if (/\bu\.?s\.?\b|american|\bunited states\b/i.test(lower)) return "US";
  if (/\bcanada\b|(?<!clearly\s)\bcanadian\b/i.test(lower)) return "CA";
  return undefined;
}

function detectGeneration(text: string): ParsedQuery["generation"] {
  const lower = text.toLowerCase();
  if (/gen\s*z\b|generation\s*z\b|zoomer/i.test(lower)) return "Gen Z";
  if (/\bmillennial(s)?\b/i.test(lower)) return "Millennial";
  if (/gen\s*x\b|generation\s*x\b/i.test(lower)) return "Gen X";
  if (/\bboomer(s)?\b|\bbaby\s+boomer/i.test(lower)) return "Boomer";
  return undefined;
}

function detectCustomerType(text: string): ParsedQuery["customerType"] {
  const lower = text.toLowerCase();
  if (/existing\s+customer(s)?|loyal(ist)?|\breturning\b/i.test(lower)) return "existing";
  if (/new\s+customer(s)?|\bpotential\b|\bprospect\b/i.test(lower)) return "potential";
  return undefined;
}

function detectTopic(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/zero[\s-]sugar|no\s+sugar|sugar[\s-]free/i.test(lower)) return "zero_sugar";
  if (/sustainab|eco\b|environment|green/i.test(lower)) return "sustainability";
  if (/\bcan\b|\bcans\b|aluminum/i.test(lower)) return "cans";
  if (/packag|\bbottle\b|\bglass\b/i.test(lower)) return "packaging";
  if (/\bprice\b|\bcost\b|expensive|\bcheap\b|affordable|\bvalue\b/i.test(lower)) return "price";
  if (/nostalgi|retro|\b90s\b|\bclassic\b/i.test(lower)) return "nostalgia";
  if (/social\s+media|tiktok|instagram|\bonline\b/i.test(lower)) return "social_media";
  if (/grocery|\bshelf\b|supermarket/i.test(lower)) return "grocery_shelf";
  if (/convenience|impulse/i.test(lower)) return "convenience";
  if (/health|healthy|wellness|natural|organic/i.test(lower)) return "health_wellness";
  return undefined;
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
  const market = detectMarket(rawText);
  const generation = detectGeneration(rawText);
  const customerType = detectCustomerType(rawText);
  const topic = detectTopic(rawText);

  const personaMatch = rawText.match(/\bas\s+([a-z-]+(?:\s+[a-z-]+)*)/i);
  const scenarioMatch = rawText.match(/\bscenario[:\s]+([a-z-]+(?:\s+[a-z-]+)*)/i);

  const confidence = Math.round((
    (market ? 1 / 3 : 0) +
    (generation || customerType ? 1 / 3 : 0) +
    (topic ? 1 / 3 : 0)
  ) * 100) / 100;

  const missingFields: string[] = [];
  if (!market) missingFields.push("market");
  if (!generation && !customerType) missingFields.push("audience");
  if (!topic) missingFields.push("topic");

  return {
    rawText,
    keywords,
    intent,
    category,
    personaFilter: personaMatch?.[1]?.trim().toLowerCase().replace(/\s+/g, "-"),
    scenarioFilter: scenarioMatch?.[1]?.trim().toLowerCase().replace(/\s+/g, "-"),
    market,
    generation,
    customerType,
    topic,
    confidence,
    missingFields,
  };
}
