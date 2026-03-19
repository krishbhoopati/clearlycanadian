import type { Persona } from "@/lib/types";
import type { RedditPost, NutritionData } from "@/lib/dataFetcher";

// ─── Helper: Never-Say List ──────────────────────────────────────────────────

function generateNeverSayList(persona: Persona): string {
  const custom = persona.never_say ?? [];

  const generationDefaults: Record<string, string[]> = {
    "Gen Z": [
      "I appreciate the heritage of this brand",
      "As a consumer, I value...",
      "From a marketing perspective...",
      "The brand equity resonates with my demographic",
      "anything that sounds like a marketing textbook or business case study",
    ],
    "Gen X": [
      "slay",
      "that's giving...",
      "lowkey obsessed",
      "no cap",
      "bestie",
      "reference TikTok trends or creators by name",
      "use any Gen Z slang unironically",
    ],
    Millennial: [
      "yeet",
      "no cap",
      "that's bussin'",
      "slay",
      "Gen Z slang — you're not that generation and it would sound forced",
      "back in my day — you're not old enough for that to land naturally",
    ],
    Boomer: [
      "internet slang of any generation",
      "brand jargon or marketing terminology",
      "anything implying you're out of touch — you just have different priorities",
    ],
  };

  const segmentOverrides: Record<string, string[]> = {
    bartender_mixologist: [
      "anything a customer would say — you think like a professional evaluating a product for your business",
      "Oh my god I love this!",
      "The packaging is so cute",
      "I saw my favorite influencer drinking it",
      "You evaluate on taste-in-cocktail, carbonation consistency, back-bar aesthetics, and charge-through margin",
    ],
    sober_curious: [
      "anything dismissive about non-alcoholic options",
      "just have a real drink",
      "mocktails are pointless",
      "why go to a bar if you're not drinking",
    ],
    health_wellness: [
      "anything endorsing artificial sweeteners or ingredients",
      "sugar content doesn't matter",
      "I don't read labels",
      "a little artificial flavoring won't hurt",
    ],
    nostalgia_loyalist: [
      "I don't really care about the brand",
      "whatever sparkling water is fine",
      "they should completely reinvent themselves",
      "the original flavors weren't that special",
    ],
    convenience_first: [
      "I'm passionate about this brand's mission",
      "the brand story resonates with my values",
      "I curate my beverage choices carefully",
      "long or elaborate answers about brand identity — you keep it short and practical",
    ],
    premium_lifestyle: [
      "whatever's cheapest",
      "price is my main consideration",
      "I'll just grab the store brand",
      "all sparkling water tastes the same",
    ],
    household_decision_maker: [
      "anything that ignores the family/kids dimension",
      "I just buy for myself without thinking about the household",
      "price doesn't matter for beverages",
      "my kids' preferences don't factor in",
    ],
  };

  const genRules = generationDefaults[persona.generation] ?? [];
  const segRules = segmentOverrides[persona.behavioral_segment] ?? [];

  const merged = [
    ...custom,
    ...genRules.filter((r) => !custom.some((c) => c.toLowerCase().includes(r.toLowerCase().slice(0, 20)))),
    ...segRules.filter((r) => !custom.some((c) => c.toLowerCase().includes(r.toLowerCase().slice(0, 20)))),
  ];

  const unique = [...new Set(merged)];
  if (unique.length === 0) return "No specific restrictions.";

  return unique.map((s) => `• "${s}"`).join("\n");
}

// ─── Helper: Format Facts ────────────────────────────────────────────────────

interface RelevantFact {
  id?: string;
  statement?: string;
  text?: string;
  category?: string;
  applies_to?: string[];
  tags?: string[];
  confidence?: number;
}

function formatRelevantFacts(
  facts: RelevantFact[],
  persona: Persona
): string {
  if (!facts || facts.length === 0) return "No specific market data available.";

  const segment = persona.behavioral_segment;
  const generation = persona.generation?.toLowerCase().replace(" ", "_");

  const scored = facts
    .map((f) => {
      let score = 0;
      const appliesTo = f.applies_to ?? [];
      if (appliesTo.includes(segment)) score += 3;
      if (appliesTo.includes("all")) score += 2;
      if (generation && appliesTo.includes(generation)) score += 2;
      if (appliesTo.includes(persona.market?.toLowerCase())) score += 1;
      if ((f.confidence ?? 0) >= 0.85) score += 1;
      return { fact: f, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  if (scored.length === 0) {
    const fallback = facts.slice(0, 15);
    return fallback
      .map((f) => `• ${f.statement ?? f.text ?? ""}`)
      .filter((s) => s.length > 2)
      .join("\n");
  }

  return scored
    .map((s) => `• ${s.fact.statement ?? s.fact.text ?? ""}`)
    .filter((s) => s.length > 2)
    .join("\n");
}

// ─── Helper: Format Reddit Posts ─────────────────────────────────────────────

function formatRedditPosts(posts: RedditPost[]): string {
  if (!posts || posts.length === 0) {
    return "No relevant online discussions found.";
  }

  const top = posts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return top
    .map((p) => {
      const excerpt = p.selftext
        ? p.selftext.slice(0, 200) + (p.selftext.length > 200 ? "..." : "")
        : "No description.";
      return `A real person on Reddit said: "${p.title}" — ${excerpt} (score: ${p.score}, subreddit: r/${p.subreddit})`;
    })
    .join("\n\n");
}

// ─── Helper: Format Nutrition Data ───────────────────────────────────────────

function formatNutritionData(data: NutritionData[]): string {
  if (!data || data.length === 0) return "";

  return data
    .slice(0, 6)
    .map((d) => {
      const cal = Math.round(d.nutriments.energy_kcal);
      const sugar = Math.round(d.nutriments.sugars * 10) / 10;
      const brand = d.brands !== "Unknown" ? ` (${d.brands})` : "";
      const eco = d.ecoscore_grade
        ? ` | eco-score: ${d.ecoscore_grade.toUpperCase()}`
        : "";
      return `${d.product_name}${brand}: ${cal} cal, ${sugar}g sugar per 100g${eco}`;
    })
    .join("\n");
}

// ─── Main: Build Persona Prompt ──────────────────────────────────────────────

export function buildPersonaPrompt(
  persona: Persona,
  question: string,
  relevantFacts: RelevantFact[],
  redditPosts: RedditPost[],
  webSearchData: string,
  nutritionData: NutritionData[]
): string {
  const age = persona.age ?? persona.age_range;
  const occupation = persona.occupation ?? "consumer";
  const location = persona.location ?? persona.market;
  const currentBeverages = persona.current_beverages?.join(", ") ?? "various sparkling waters";
  const discoveryChannels = persona.discovery_channels?.join(", ") ?? "various channels";
  const shoppingLocations = persona.shopping_locations?.join(", ") ?? "grocery stores";
  const priceSensitivity = persona.price_sensitivity ?? "not specified";

  return `You are ${persona.name}, a ${age}-year-old ${occupation} living in ${location}.

═══ WHO YOU ARE ═══
${persona.description}
Generation: ${persona.generation}
You currently drink: ${currentBeverages}

═══ HOW YOU THINK ABOUT DRINKS ═══
${persona.beverage_psychology ?? "You have practical reasons for your beverage choices."}

═══ HOW YOU MAKE PURCHASE DECISIONS ═══
Decision style: ${persona.decision_style}
You discover new products through: ${discoveryChannels}
You shop at: ${shoppingLocations}
Your price sensitivity: ${priceSensitivity}

═══ YOUR WORLD ═══
How you feel about Canadian brands: ${persona.canadian_identity_relevance ?? "Neutral"}
Your stance on sustainability: ${persona.sustainability_attitude ?? "Moderate"}
How 90s nostalgia hits you: ${persona.nostalgia_relevance ?? "Not a factor"}
Social media: ${persona.social_media_behavior ?? "Average usage"}

═══ YOUR RELATIONSHIP WITH CLEARLY CANADIAN ═══
Awareness: ${persona.cc_awareness ?? "Not aware"}
Your perception: ${persona.cc_perception ?? "No strong opinion"}
How you'd react to CC Maple: ${persona.response_to_maple_product ?? "Uncertain"}
How relevant bars/festivals are to you: ${persona.bar_and_festival_relevance ?? "Not very relevant"}

═══ HOW YOU TALK ═══
${persona.language_style}

═══ THINGS YOU WOULD NEVER SAY ═══
${generateNeverSayList(persona)}

═══ YOUR RULES (how you make decisions) ═══
${persona.behavior_rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

═══ REAL MARKET DATA YOU'D REALISTICALLY KNOW ═══
${formatRelevantFacts(relevantFacts, persona)}

═══ WHAT REAL PEOPLE ARE SAYING (from Reddit) ═══
${formatRedditPosts(redditPosts)}

═══ CURRENT MARKET CONTEXT ═══
${webSearchData || "No additional context available."}

═══ NUTRITION COMPARISONS ═══
${formatNutritionData(nutritionData)}

═══ YOUR INSTRUCTIONS ═══
Respond to the following question AS ${persona.name}.
- Write 2-4 sentences maximum.
- Use your language style described above.
- Reference at least ONE specific data point naturally (not as a citation).
- Reveal your DECISION — would you or wouldn't you, and WHY.
- Be specific: mention prices, places, occasions, comparisons by name.
- Stay in character completely. Never break character.
- Never say "as a [demographic]" or "speaking as a [type]" — real people don't label themselves.`;
}

// ─── Analysis Prompt ─────────────────────────────────────────────────────────

interface PersonaResponseSummary {
  name: string;
  response: string;
  demographics: string;
}

export function buildAnalysisPrompt(
  question: string,
  personaResponses: PersonaResponseSummary[],
  dataContext: string
): string {
  const responsesBlock = personaResponses
    .map(
      (p) =>
        `──── ${p.name} (${p.demographics}) ────\n${p.response}`
    )
    .join("\n\n");

  return `You are a senior consumer research analyst reviewing simulated persona responses about Clearly Canadian sparkling water.

═══ RESEARCH QUESTION ═══
"${question}"

═══ PERSONA RESPONSES ═══
${responsesBlock}

═══ SUPPORTING MARKET DATA ═══
${dataContext || "No additional data context."}

═══ YOUR TASK ═══
Analyze all persona responses and return a JSON object (wrapped in a \`\`\`json code block) with EXACTLY this structure:

\`\`\`json
{
  "net_resonance": <number 0-100, overall positive reaction score>,
  "sentiment_distribution": {
    "positive": <count of personas with clearly positive reactions>,
    "friction": <count with interest but significant barriers>,
    "neutral": <count with no strong reaction either way>,
    "negative": <count with clearly negative reactions>
  },
  "dominant_themes": [
    {
      "theme": "<theme name>",
      "evidence": "<specific quotes or data points supporting this theme>",
      "persona_count": <how many personas touched on this>
    }
  ],
  "key_insight": "<one sentence — the single most important takeaway from these responses>",
  "strategic_recommendations": [
    {
      "action": "<specific, actionable recommendation>",
      "rationale": "<why this matters, grounded in persona responses>",
      "priority": "high" | "medium" | "low"
    }
  ],
  "risk_factors": [
    "<specific risk identified from persona responses>"
  ],
  "follow_up_questions": [
    "<suggested follow-up question 1>",
    "<suggested follow-up question 2>",
    "<suggested follow-up question 3>"
  ],
  "per_persona_scores": [
    {
      "persona_name": "<name>",
      "resonance": <0-100>,
      "key_driver": "<primary positive factor>",
      "key_blocker": "<primary barrier or concern>",
      "decision": "would_buy" | "would_try" | "interested_but_barriers" | "indifferent" | "unlikely" | "would_not_buy"
    }
  ]
}
\`\`\`

Rules:
- Base scores ONLY on what personas actually said — do not infer beyond their words.
- Be specific in themes and recommendations — avoid generic advice.
- The key_insight should be surprising or non-obvious, not a restatement of the question.
- Follow-up questions should probe the tensions or surprises revealed in the responses.
- Every strategic recommendation must tie to at least one persona's specific response.`;
}
