import type {
  Persona,
  BehaviorFact,
  AnalysisResult,
  PerPersonaScore,
} from "@/lib/types";
import type { RedditPost, NutritionData } from "@/lib/dataFetcher";
import {
  isPuterAvailable,
  generateStreamingResponse,
  generateAnalysis,
} from "@/lib/puterAI";
import {
  fetchRedditPosts,
  fetchNutritionData,
  searchWeb,
  fetchCocktailRecipes,
} from "@/lib/dataFetcher";
import { buildPersonaPrompt, buildAnalysisPrompt } from "@/lib/promptBuilder";

export type { AnalysisResult, PerPersonaScore };

// ─── Step A: Classify Question ───────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  price_sensitivity: [
    "price", "$", "cost", "expensive", "cheap", "afford", "premium",
    "value", "worth", "budget", "per can", "per unit", "6-pack", "12-pack",
  ],
  product_innovation: [
    "maple", "new flavor", "caffeinated", "zero sugar", "product", "launch",
    "innovation", "sleekcan", "sleek can", "format", "glass bottle",
  ],
  occasion_usage: [
    "bar", "cocktail", "mixer", "mocktail", "restaurant", "festival",
    "party", "dinner", "hosting", "gift", "occasion",
  ],
  campaign_creative: [
    "tiktok", "campaign", "ad", "message", "tagline", "billboard", "shania",
    "twain", "commercial", "advertising", "marketing", "super bowl",
  ],
  channel_place: [
    "costco", "walmart", "store", "shelf", "aisle", "convenience", "7-eleven",
    "target", "grocery", "amazon", "whole foods", "distribution",
  ],
  competitive: [
    "lacroix", "bubly", "poppi", "olipop", "liquid death", "topo chico",
    "perrier", "san pellegrino", "spindrift", "switch", "competitor",
    "compare", "vs", "versus", "alternative",
  ],
  brand_perception: [
    "think", "feel", "perception", "brand", "aware", "awareness", "nostalgia",
    "canadian", "identity", "image", "reputation", "remember",
  ],
};

function classifyQuestion(question: string): string[] {
  const lower = question.toLowerCase();
  const matched: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(category);
    }
  }

  return matched.length > 0 ? matched : ["brand_perception"];
}

// ─── Step B: Select Personas ─────────────────────────────────────────────────

const DEFAULT_PANEL_IDS = [
  "ca_genz_potential",    // Chloe
  "ca_mill_potential",    // Jake
  "nostalgia_loyalist",   // Linda
  "bartender_mixologist", // Ethan
  "household_stockup",    // Karen_H
];

const CATEGORY_PERSONA_MAP: Record<string, string[]> = {
  occasion_usage: [
    "bartender_mixologist",
    "ca_genz_sober_curious",
    "premium_lifestyle",
    "ca_mill_potential",
  ],
  price_sensitivity: [
    "household_stockup",
    "premium_lifestyle",
    "us_mill_convenience",
    "ca_genz_potential",
    "us_genz_potential",
  ],
  campaign_creative: [
    "ca_genz_potential",
    "us_genz_potential",
    "nostalgia_loyalist",
    "ca_mill_loyal",
    "us_mill_lapsed",
  ],
  competitive: [
    "ca_genz_potential",
    "us_genz_potential",
    "us_mill_convenience",
    "premium_lifestyle",
    "household_stockup",
  ],
  product_innovation: [
    "us_genz_wellness",
    "ca_genz_sober_curious",
    "bartender_mixologist",
    "ca_mill_potential",
    "ca_genz_potential",
  ],
  channel_place: [
    "us_mill_convenience",
    "household_stockup",
    "ca_genz_potential",
    "nostalgia_loyalist",
    "premium_lifestyle",
  ],
  brand_perception: [
    "ca_genz_potential",
    "ca_mill_potential",
    "nostalgia_loyalist",
    "us_mill_lapsed",
    "premium_lifestyle",
  ],
};

function selectPersonaIds(categories: string[], question: string): string[] {
  const lower = question.toLowerCase();
  const selected = new Set<string>();

  for (const cat of categories) {
    const ids = CATEGORY_PERSONA_MAP[cat];
    if (ids) {
      for (const id of ids) selected.add(id);
    }
  }

  if (lower.includes("bar") || lower.includes("cocktail") || lower.includes("mixer")) {
    selected.add("bartender_mixologist");
  }
  if (lower.includes("campus") || lower.includes("university") || lower.includes("student")) {
    selected.add("ca_genz_potential");
    selected.add("us_genz_potential");
  }
  if (lower.includes("nostalgia") || lower.includes("90s") || lower.includes("remember")) {
    selected.add("nostalgia_loyalist");
    selected.add("ca_mill_loyal");
  }

  if (selected.size === 0) {
    return DEFAULT_PANEL_IDS;
  }

  const arr = [...selected];
  return arr.length > 5 ? arr.slice(0, 5) : arr;
}

// ─── Client-side data loading ────────────────────────────────────────────────

interface ClientData {
  personas: Persona[];
  behaviorFacts: BehaviorFact[];
  brandFacts: any[];
}

let clientDataCache: ClientData | null = null;

async function loadClientData(): Promise<ClientData> {
  if (clientDataCache) return clientDataCache;

  const [personasModule, factsModule, brandModule] = await Promise.all([
    import("@/data/processed/personas.json"),
    import("@/data/processed/behavior_facts.json"),
    import("@/data/processed/brand_truth.json"),
  ]);

  clientDataCache = {
    personas: personasModule.default as Persona[],
    behaviorFacts: factsModule.default as BehaviorFact[],
    brandFacts: brandModule.default as any[],
  };
  return clientDataCache;
}

// ─── Fact filtering ──────────────────────────────────────────────────────────

function filterFactsForPersona(
  facts: BehaviorFact[],
  persona: Persona,
  categories: string[]
): BehaviorFact[] {
  const segment = persona.behavioral_segment;
  const gen = persona.generation?.toLowerCase().replace(" ", "_");
  const market = persona.market?.toLowerCase();

  return facts.filter((f) => {
    const appliesTo = f.applies_to ?? [];
    const matchesSegment =
      appliesTo.includes(segment) ||
      appliesTo.includes("all") ||
      (gen && appliesTo.includes(gen)) ||
      (market && appliesTo.includes(market));

    const matchesCategory = categories.length === 0 || categories.some((cat) => {
      const catLower = cat.toLowerCase().replace(/_/g, " ");
      return (
        (f.category ?? "").toLowerCase().includes(catLower) ||
        (f.tags ?? []).some((t) => t.toLowerCase().includes(catLower))
      );
    });

    return matchesSegment || matchesCategory;
  });
}

function extractSearchTerms(question: string): string {
  return question
    .replace(/[?!.,'"]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6)
    .join(" ");
}

// ─── Step C: Fetch live data ─────────────────────────────────────────────────

interface LiveData {
  reddit: RedditPost[];
  webSearch: string;
  nutrition: NutritionData[];
  competitorNutrition: NutritionData[];
  cocktails: any[];
}

async function fetchLiveData(
  question: string,
  categories: string[]
): Promise<LiveData> {
  const result: LiveData = {
    reddit: [],
    webSearch: "",
    nutrition: [],
    competitorNutrition: [],
    cocktails: [],
  };

  const terms = extractSearchTerms(question);
  const tasks: Promise<void>[] = [];

  tasks.push(
    fetchRedditPosts(terms, undefined, 5)
      .then((posts) => { result.reddit = posts; })
      .catch(() => {})
  );

  tasks.push(
    searchWeb(`${question} beverage market 2026`)
      .then((text) => { result.webSearch = text; })
      .catch(() => {})
  );

  if (
    categories.includes("product_innovation") ||
    categories.includes("price_sensitivity")
  ) {
    tasks.push(
      fetchNutritionData("Clearly Canadian")
        .then((d) => { result.nutrition = d; })
        .catch(() => {})
    );
  }

  if (categories.includes("competitive")) {
    const lower = question.toLowerCase();
    let competitor = "LaCroix";
    if (lower.includes("poppi")) competitor = "Poppi";
    else if (lower.includes("olipop")) competitor = "Olipop";
    else if (lower.includes("bubly")) competitor = "Bubly";
    else if (lower.includes("liquid death")) competitor = "Liquid Death";
    else if (lower.includes("topo chico")) competitor = "Topo Chico";

    tasks.push(
      fetchNutritionData(competitor)
        .then((d) => { result.competitorNutrition = d; })
        .catch(() => {})
    );
  }

  if (categories.includes("occasion_usage")) {
    tasks.push(
      fetchCocktailRecipes("sparkling water")
        .then((d) => { result.cocktails = d; })
        .catch(() => {})
    );
  }

  await Promise.allSettled(tasks);
  return result;
}

// ─── Step D & E: Main simulation ─────────────────────────────────────────────

// Hard ceiling: if the entire simulation hasn't finished in this many ms,
// abort and show the rule-based fallback so the UI is never stuck forever.
const SIMULATION_HARD_TIMEOUT_MS = 45_000;

export async function runSimulation(
  question: string,
  onPersonaChunk: (personaId: string, chunk: string) => void,
  onPersonaComplete: (personaId: string, fullResponse: string) => void,
  onAnalysisComplete: (analysis: AnalysisResult) => void
): Promise<void> {
  console.log("[runSimulation] ▶ Starting simulation for question:", question);

  const puterReady = isPuterAvailable();
  console.log("[runSimulation] isPuterAvailable:", puterReady);

  if (!puterReady) {
    console.warn(
      "[runSimulation] Puter not available — falling back to rule-based engine."
    );
    await runFallbackSimulation(question, onPersonaComplete, onAnalysisComplete);
    return;
  }

  // Safety net: if anything hangs longer than the hard timeout, run the
  // rule-based fallback so the loading screen never gets stuck forever.
  let hardTimeoutFired = false;
  const hardTimeoutId = setTimeout(async () => {
    hardTimeoutFired = true;
    console.warn(`[runSimulation] Hard timeout (${SIMULATION_HARD_TIMEOUT_MS}ms) — falling back to rule-based engine.`);
    await runFallbackSimulation(question, onPersonaComplete, onAnalysisComplete);
  }, SIMULATION_HARD_TIMEOUT_MS);

  try {
    // Step A: classify
    console.log("[runSimulation] Step A: Classifying question...");
    const categories = classifyQuestion(question);
    console.log("[runSimulation] Step A complete — categories:", categories);

    // Load static data + select personas
    const { personas, behaviorFacts, brandFacts } = await loadClientData();

    // Step B: select personas
    console.log("[runSimulation] Step B: Selecting personas...");
    const selectedIds = selectPersonaIds(categories, question);
    const selectedPersonas = selectedIds
      .map((id) => personas.find((p) => p.id === id))
      .filter((p): p is Persona => p !== undefined);

    console.log(
      "[runSimulation] Step B complete — selected personas:",
      selectedPersonas.map((p) => `${p.name} (${p.id})`)
    );

    if (selectedPersonas.length === 0) {
      throw new Error("No matching personas found");
    }

    // Step C: fetch live data in parallel
    console.log("[runSimulation] Step C: Fetching live data...");
    const liveData = await fetchLiveData(question, categories);
    console.log("[runSimulation] Step C complete — reddit posts:", liveData.reddit.length, "| webSearch chars:", liveData.webSearch.length);
    const allNutrition = [...liveData.nutrition, ...liveData.competitorNutrition];

    // Step D: build prompts and stream all persona responses in parallel
    console.log("[runSimulation] Step D: Building prompts and calling Puter AI for each persona...");
    const personaResponses: { persona: Persona; response: string }[] = [];

    await Promise.all(
      selectedPersonas.map(async (persona) => {
        const relevantFacts = filterFactsForPersona(
          behaviorFacts,
          persona,
          categories
        );
        const combinedFacts = [
          ...relevantFacts.slice(0, 20),
          ...brandFacts.slice(0, 5),
        ];

        const systemPrompt = buildPersonaPrompt(
          persona,
          question,
          combinedFacts,
          liveData.reddit,
          liveData.webSearch,
          allNutrition
        );

        console.log(`[runSimulation] Step E: Calling Puter AI for persona "${persona.name}" (${persona.id})...`);

        try {
          const fullResponse = await generateStreamingResponse(
            systemPrompt,
            question,
            (chunk) => onPersonaChunk(persona.id, chunk)
          );
          console.log(`[runSimulation] Step F: Got response from "${persona.name}" — ${fullResponse.length} chars`);
          personaResponses.push({ persona, response: fullResponse });
          onPersonaComplete(persona.id, fullResponse);
        } catch (err) {
          console.error(`[runSimulation] Puter AI call failed for "${persona.name}":`, err);
          const fallbackMsg =
            `I'd need to think more about that. As someone who ${persona.core_traits[0] ?? "has their own perspective"}, I don't have a quick answer.`;
          personaResponses.push({ persona, response: fallbackMsg });
          onPersonaComplete(persona.id, fallbackMsg);
        }
      })
    );

    console.log("[runSimulation] Step G: Running analysis on", personaResponses.length, "persona responses...");

    // Step G: run analysis after all personas respond
    try {
      const responseSummaries = personaResponses.map((pr) => ({
        name: pr.persona.name,
        response: pr.response,
        demographics: `${pr.persona.age ?? pr.persona.age_range}yo ${pr.persona.generation}, ${pr.persona.location}, ${pr.persona.behavioral_segment}`,
      }));

      const dataContext = [
        liveData.webSearch ? `Web research: ${liveData.webSearch.slice(0, 1000)}` : "",
        liveData.reddit.length > 0
          ? `Reddit sentiment: ${liveData.reddit.slice(0, 3).map((r) => r.title).join("; ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const analysisPrompt = buildAnalysisPrompt(
        question,
        responseSummaries,
        dataContext
      );

      const rawAnalysis = await generateAnalysis(analysisPrompt);
      const analysis = normalizeAnalysis(rawAnalysis);
      console.log("[runSimulation] Step H: Complete — analysis ready, net_resonance:", analysis.net_resonance);
      onAnalysisComplete(analysis);
    } catch (err) {
      console.error("[runSimulation] Puter AI call failed (analysis):", err);
      console.warn("[runSimulation] Falling back to rule-based analysis.");
      onAnalysisComplete(buildFallbackAnalysis(personaResponses));
    }
  } catch (err) {
    console.error("[runSimulation] Simulation failed at top level:", err);
    await runFallbackSimulation(question, onPersonaComplete, onAnalysisComplete);
  } finally {
    clearTimeout(hardTimeoutId);
    if (hardTimeoutFired) {
      console.log("[runSimulation] Note: hard timeout already fired and delivered results.");
    }
  }
}

// ─── Persona Chat (1-on-1 mode) ──────────────────────────────────────────────

export async function chatWithPersona(
  personaId: string,
  message: string,
  conversationHistory: { role: string; content: string }[],
  onChunk: (chunk: string) => void
): Promise<string> {
  if (!isPuterAvailable()) {
    throw new Error("Puter AI is not available for persona chat.");
  }

  const { personas, behaviorFacts, brandFacts } = await loadClientData();
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) throw new Error(`Persona not found: ${personaId}`);

  const categories = classifyQuestion(message);
  const relevantFacts = filterFactsForPersona(behaviorFacts, persona, categories);

  let webContext = "";
  try {
    webContext = await searchWeb(`${message} sparkling water 2026`);
  } catch {}

  const systemPrompt = buildPersonaPrompt(
    persona,
    message,
    [...relevantFacts.slice(0, 15), ...brandFacts.slice(0, 5)],
    [],
    webContext,
    []
  );

  const augmentedPrompt = `${systemPrompt}

═══ CONVERSATION SO FAR ═══
${conversationHistory
  .map((m) => `${m.role === "user" ? "Human" : persona.name}: ${m.content}`)
  .join("\n")}

Continue the conversation AS ${persona.name}. Stay in character. Keep replies to 2-4 sentences.`;

  return generateStreamingResponse(augmentedPrompt, message, onChunk);
}

// ─── Normalize analysis JSON ─────────────────────────────────────────────────

function normalizeAnalysis(raw: any): AnalysisResult {
  return {
    net_resonance: raw.net_resonance ?? 50,
    sentiment_distribution: {
      positive: raw.sentiment_distribution?.positive ?? 0,
      friction: raw.sentiment_distribution?.friction ?? 0,
      neutral: raw.sentiment_distribution?.neutral ?? 0,
      negative: raw.sentiment_distribution?.negative ?? 0,
    },
    dominant_themes: Array.isArray(raw.dominant_themes)
      ? raw.dominant_themes.map((t: any) => ({
          theme: t.theme ?? "Unknown",
          evidence: t.evidence ?? "",
          persona_count: t.persona_count ?? 0,
        }))
      : [],
    key_insight: raw.key_insight ?? "Analysis could not determine a clear insight.",
    strategic_recommendations: Array.isArray(raw.strategic_recommendations)
      ? raw.strategic_recommendations.map((r: any) => ({
          action: r.action ?? "",
          rationale: r.rationale ?? "",
          priority: (["high", "medium", "low"].includes(r.priority) ? r.priority : "medium") as
            | "high"
            | "medium"
            | "low",
        }))
      : [],
    risk_factors: Array.isArray(raw.risk_factors) ? raw.risk_factors : [],
    follow_up_questions: Array.isArray(raw.follow_up_questions)
      ? raw.follow_up_questions.slice(0, 3)
      : [],
    per_persona_scores: Array.isArray(raw.per_persona_scores)
      ? raw.per_persona_scores.map((s: any) => ({
          persona_name: s.persona_name ?? "Unknown",
          resonance: s.resonance ?? 50,
          key_driver: s.key_driver ?? "Not identified",
          key_blocker: s.key_blocker ?? "None",
          decision: s.decision ?? "indifferent",
        }))
      : [],
  };
}

// ─── Fallback (rule-based) ───────────────────────────────────────────────────

function buildFallbackAnalysis(
  responses: { persona: Persona; response: string }[]
): AnalysisResult {
  return {
    net_resonance: 50,
    sentiment_distribution: {
      positive: Math.ceil(responses.length / 2),
      friction: Math.floor(responses.length / 4),
      neutral: Math.floor(responses.length / 4),
      negative: 0,
    },
    dominant_themes: [
      {
        theme: "Mixed reception",
        evidence: "Personas showed varied responses based on their individual priorities.",
        persona_count: responses.length,
      },
    ],
    key_insight:
      "AI analysis was unavailable. Review individual persona responses for detailed insights.",
    strategic_recommendations: [
      {
        action: "Review individual persona responses manually",
        rationale: "Automated analysis could not be generated for this session.",
        priority: "high",
      },
    ],
    risk_factors: ["Analysis generated from fallback — re-run with AI for deeper insights."],
    follow_up_questions: [
      "What specific barriers did each persona mention?",
      "Which persona showed the strongest positive signal?",
      "What price point or channel was most discussed?",
    ],
    per_persona_scores: responses.map((pr) => ({
      persona_name: pr.persona.name,
      resonance: 50,
      key_driver: "See individual response",
      key_blocker: "See individual response",
      decision: "indifferent" as const,
    })),
  };
}

async function runFallbackSimulation(
  question: string,
  onPersonaComplete: (personaId: string, fullResponse: string) => void,
  onAnalysisComplete: (analysis: AnalysisResult) => void
): Promise<void> {
  try {
    const { personas, behaviorFacts } = await loadClientData();
    const categories = classifyQuestion(question);
    const selectedIds = selectPersonaIds(categories, question);
    const selectedPersonas = selectedIds
      .map((id) => personas.find((p) => p.id === id))
      .filter((p): p is Persona => p !== undefined);

    const responses: { persona: Persona; response: string }[] = [];

    for (const persona of selectedPersonas) {
      const relevantFacts = filterFactsForPersona(behaviorFacts, persona, categories);
      const topFact = relevantFacts[0]?.statement ?? "";

      const decision = persona.customer_type === "existing" ? "already buying" : "would consider trying";
      const trigger = persona.buying_triggers[0] ?? "if I encountered it naturally";
      const objection = persona.objections[0] ?? "";
      const priceNote = persona.price_sensitivity ?? "";

      const response = [
        `${topFact ? topFact + " " : ""}`,
        `For me, I'd say I'm ${decision} — mainly because ${trigger.toLowerCase()}.`,
        objection ? `My main hesitation: ${objection}` : "",
        priceNote ? `On price: ${priceNote}.` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      responses.push({ persona, response });
      onPersonaComplete(persona.id, response);
    }

    onAnalysisComplete(buildFallbackAnalysis(responses));
  } catch (err) {
    console.error("[aiSimulationEngine] Fallback simulation also failed:", err);
    onAnalysisComplete({
      net_resonance: 0,
      sentiment_distribution: { positive: 0, friction: 0, neutral: 0, negative: 0 },
      dominant_themes: [],
      key_insight: "Simulation could not be completed. Check data files and try again.",
      strategic_recommendations: [],
      risk_factors: ["Complete simulation failure"],
      follow_up_questions: [],
      per_persona_scores: [],
    });
  }
}
