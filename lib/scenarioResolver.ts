import type { Scenario, ParsedQuery, ScenarioMatch } from "./types";
import { loadScenarios } from "./dataLoader";

export function resolveScenario(id: string): Scenario | null {
  const scenarios = loadScenarios();
  return scenarios.find((s) => s.id === id) ?? null;
}

export function listScenarios(): Scenario[] {
  return loadScenarios();
}

const TOPIC_PRIMARY: Record<string, string> = {
  zero_sugar:      "scenario-zero-sugar-reaction",
  health_wellness: "scenario-zero-sugar-reaction",
  nostalgia:       "scenario-nostalgia-ad",
  social_media:    "scenario-online-discovery",
  convenience:     "scenario-convenience-impulse",
  cans:            "scenario-convenience-impulse",
  packaging:       "scenario-packaging-reaction",
  price:           "scenario-price-reaction",
  sustainability:  "scenario-sustainability-message",
};

const KEYWORD_AFFINITY: Record<string, string[]> = {
  // reaction / first encounter
  react:         ["scenario-grocery-shelf", "scenario-zero-sugar-reaction"],
  reaction:      ["scenario-grocery-shelf", "scenario-zero-sugar-reaction"],
  first:         ["scenario-grocery-shelf"],
  encounter:     ["scenario-grocery-shelf"],
  try:           ["scenario-grocery-shelf"],
  // repeat / loyalty
  repeat:        ["scenario-repeat-purchase"],
  habit:         ["scenario-repeat-purchase"],
  loyal:         ["scenario-repeat-purchase"],
  loyalty:       ["scenario-repeat-purchase"],
  again:         ["scenario-repeat-purchase"],
  rebuy:         ["scenario-repeat-purchase"],
  // bulk / household
  stock:         ["scenario-household-stock-up"],
  bulk:          ["scenario-household-stock-up"],
  household:     ["scenario-household-stock-up"],
  family:        ["scenario-household-stock-up"],
  // ad / campaign
  ad:            ["scenario-nostalgia-ad"],
  ads:           ["scenario-nostalgia-ad"],
  advertisement: ["scenario-nostalgia-ad"],
  campaign:      ["scenario-nostalgia-ad"],
  commercial:    ["scenario-nostalgia-ad"],
  // social / online
  tiktok:        ["scenario-online-discovery"],
  instagram:     ["scenario-online-discovery"],
  online:        ["scenario-online-discovery"],
  discover:      ["scenario-online-discovery"],
  // price
  price:         ["scenario-price-reaction"],
  cost:          ["scenario-price-reaction"],
  expensive:     ["scenario-price-reaction"],
  cheap:         ["scenario-price-reaction"],
  afford:        ["scenario-price-reaction"],
  // sustainability
  sustainable:   ["scenario-sustainability-message"],
  glass:         ["scenario-sustainability-message"],
  environment:   ["scenario-sustainability-message"],
  recycle:       ["scenario-sustainability-message"],
  // packaging
  packaging:     ["scenario-packaging-reaction"],
  bottle:        ["scenario-packaging-reaction"],
  design:        ["scenario-packaging-reaction"],
  label:         ["scenario-packaging-reaction"],
};

export function resolveScenarioForQuery(parsed: ParsedQuery): ScenarioMatch | null {
  const scores: Record<string, number> = {};

  // +5 for topic primary match
  if (parsed.topic && TOPIC_PRIMARY[parsed.topic]) {
    const scenarioId = TOPIC_PRIMARY[parsed.topic];
    scores[scenarioId] = (scores[scenarioId] ?? 0) + 5;
  }

  // +2 per keyword affinity match
  const matchedKeywords: string[] = [];
  for (const kw of parsed.keywords) {
    const normalized = kw.toLowerCase();
    if (KEYWORD_AFFINITY[normalized]) {
      matchedKeywords.push(normalized);
      for (const scenarioId of KEYWORD_AFFINITY[normalized]) {
        scores[scenarioId] = (scores[scenarioId] ?? 0) + 2;
      }
    }
  }

  if (Object.keys(scores).length === 0) return null;

  const bestId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const bestScore = scores[bestId];

  if (bestScore === 0) return null;

  const scenario = loadScenarios().find((s) => s.id === bestId);
  if (!scenario) return null;

  const explanation =
    `Matched "${scenario.name}" (score: ${bestScore}). ` +
    `Topic "${parsed.topic ?? "none"}" → primary match. ` +
    `Keywords matched: ${matchedKeywords.join(", ") || "none"}.`;

  return { scenarioId: bestId, scenario, explanation, score: bestScore };
}
