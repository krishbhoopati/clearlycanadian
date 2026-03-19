import type {
  Persona,
  Scenario,
  BehaviorFact,
  BrandFact,
  Evidence,
  ChatTurn,
  Message,
  PersonaSimulationResult,
} from "./types";
import { composePersonaResponse } from "./responseComposer";

let msgCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++msgCounter}`;
}

// ─── Keyword extraction helper ────────────────────────────────────────────────

const BEHAVIOR_STOP_WORDS = new Set([
  "will", "wont", "does", "this", "that", "with", "from", "they",
  "their", "have", "than", "would", "when", "what", "more", "some", "such",
  "into", "before", "which", "there", "been", "could", "also", "each", "then",
  "she", "her", "his", "him", "the", "and", "for", "but", "not", "gets",
  "read", "reads", "buy", "buys", "pays", "pay", "find", "look", "take",
  "just", "even", "very", "make", "like", "know", "want", "come", "over",
  "after", "same", "only", "both", "here", "well", "need", "time", "long",
  "down", "used", "says", "once", "most", "else", "another", "least", "less",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,\-—.!?'"()+]+/)
    .filter((w) => w.length >= 5 && !BEHAVIOR_STOP_WORDS.has(w));
}

// ─── Step 1: Score Drivers ────────────────────────────────────────────────────

function scoreDrivers(
  persona: Persona,
  scenario: Scenario | null,
  behaviorFacts: BehaviorFact[],
  brandFacts: BrandFact[]
): string[] {
  const drivers: string[] = [];

  const scenarioId = (scenario?.id ?? "").toLowerCase();
  const scenarioName = (scenario?.name ?? "").toLowerCase();
  const scenarioTags = (scenario?.contextTags ?? []).map((t) => t.toLowerCase());
  const scenarioContext = (scenario?.context ?? "").toLowerCase();
  const scenarioAllText = [scenarioId, scenarioName, ...scenarioTags, scenarioContext].join(" ");

  // 1. Scenario-channel match
  for (const channel of persona.channel_preferences) {
    const channelWords = channel.toLowerCase().split(/\s+/);
    const matched = channelWords.some(
      (word) =>
        word.length >= 4 &&
        (scenarioTags.some((t) => t.includes(word) || word.includes(t)) ||
          scenarioContext.includes(word) ||
          scenarioId.includes(word))
    );
    if (matched) {
      drivers.push(
        `${persona.name}'s preferred discovery channel ("${channel}") directly matches this scenario's context.`
      );
      break;
    }
  }

  // 2. CC awareness/perception (positive)
  const ccAwareness = (persona.cc_awareness ?? "").toLowerCase();
  const positiveAwarenessCues = [
    "seen it", "knows", "excited", "aware", "know", "seen", "familiar",
    "deeply aware", "aware of",
  ];
  const negativeAwarenessCues = [
    "doesn't know", "never heard", "no strong", "vague", "hasn't bought",
    "unclear", "not sure",
  ];
  const hasPositiveAwareness = positiveAwarenessCues.some((cue) => ccAwareness.includes(cue));
  const hasNegativeAwareness = negativeAwarenessCues.some((cue) => ccAwareness.includes(cue));

  if (hasPositiveAwareness && !hasNegativeAwareness && persona.cc_awareness) {
    drivers.push(
      `${persona.name}'s existing awareness ("${persona.cc_awareness}") provides a low-friction entry point.`
    );
  }

  // 3. Maple/bar/festival specifics
  const isMapleScenario =
    scenarioId.includes("maple") || scenarioTags.includes("maple");
  const isBarOrFestivalScenario =
    scenarioId.includes("bar") ||
    scenarioId.includes("festival") ||
    scenarioTags.some(
      (t) =>
        t.includes("bar") ||
        t.includes("cocktail") ||
        t.includes("festival") ||
        t.includes("on_premise")
    );

  if (isMapleScenario && persona.response_to_maple_product) {
    const mapleResp = persona.response_to_maple_product.toLowerCase();
    const isPositive = !["skeptic", "wouldn't", "won't", "avoid"].some((neg) =>
      mapleResp.includes(neg)
    );
    if (isPositive) {
      drivers.push(
        `${persona.name}'s response to maple products: "${persona.response_to_maple_product}" — a natural alignment with this scenario.`
      );
    }
  } else if (isBarOrFestivalScenario && persona.bar_and_festival_relevance) {
    const barResp = persona.bar_and_festival_relevance.toLowerCase();
    const isPositive =
      barResp.includes("high") ||
      barResp.includes("primary") ||
      barResp.includes("professional");
    if (isPositive) {
      drivers.push(
        `${persona.name}'s bar/festival relevance: "${persona.bar_and_festival_relevance}" — a direct match for this scenario.`
      );
    }
  }

  // 4. Buying trigger × scenario match
  for (const trigger of persona.buying_triggers) {
    const triggerWords = extractKeywords(trigger);
    const hasOverlap = triggerWords.some((word) => scenarioAllText.includes(word));
    if (hasOverlap) {
      drivers.push(
        `${persona.name}'s buying trigger "${trigger}" is directly activated by this scenario.`
      );
      break;
    }
  }

  // 5. Beverage psychology alignment
  const discoveryContextual =
    scenarioTags.some((t) =>
      ["social_media", "tiktok", "instagram", "sampling", "visual_discovery"].includes(t)
    ) ||
    scenarioContext.includes("discovery") ||
    scenarioContext.includes("packaging") ||
    scenarioContext.includes("social") ||
    scenarioContext.includes("tiktok") ||
    scenarioContext.includes("instagram");

  if (persona.beverage_psychology && discoveryContextual) {
    drivers.push(
      `${persona.name}'s beverage psychology ("${persona.beverage_psychology}") aligns with the scenario's stimulus.`
    );
  }

  return drivers.slice(0, 5);
}

// ─── Step 2: Evaluate Behavior Rules ─────────────────────────────────────────

function evaluateBehaviorRules(
  persona: Persona,
  scenario: Scenario | null,
  _behaviorFacts: BehaviorFact[]
): { blocking: boolean; ruleBarriers: string[] } {
  const ruleBarriers: string[] = [];
  let blocking = false;

  const scenarioContext = (scenario?.context ?? "").toLowerCase();
  const scenarioTags = (scenario?.contextTags ?? []).map((t) => t.toLowerCase());
  const scenarioId = (scenario?.id ?? "").toLowerCase();
  const scenarioName = (scenario?.name ?? "").toLowerCase();
  const scenarioAllText = [
    scenarioId,
    scenarioName,
    ...scenarioTags,
    scenarioContext,
  ].join(" ");

  const negativeStarters = [
    "will not",
    "won't",
    "refuses",
    "skips",
    "gets annoyed",
    "reads",
  ];
  const hardGateStarters = ["will not", "won't"];

  for (const rule of persona.behavior_rules) {
    const ruleLower = rule.toLowerCase();
    const isNegative = negativeStarters.some((s) => ruleLower.startsWith(s));
    if (!isNegative) continue;

    // Extract condition after connector
    let conditionText = ruleLower;
    const ifIdx = ruleLower.indexOf(" if ");
    const withoutIdx = ruleLower.indexOf(" without ");
    const unlessIdx = ruleLower.indexOf(" unless ");

    if (ifIdx !== -1) {
      conditionText = ruleLower.slice(ifIdx + 4);
    } else if (withoutIdx !== -1) {
      conditionText = ruleLower.slice(withoutIdx + 9);
    } else if (unlessIdx !== -1) {
      conditionText = ruleLower.slice(unlessIdx + 8);
    }

    const conditionKeywords = extractKeywords(conditionText);
    const activated = conditionKeywords.some((word) => scenarioAllText.includes(word));

    if (activated) {
      let consequence = "would be deterred by this scenario";
      if (ruleLower.startsWith("will not") || ruleLower.startsWith("won't")) {
        consequence = "would likely decline or avoid this";
      } else if (ruleLower.startsWith("skips")) {
        consequence = "would skip this product";
      } else if (ruleLower.startsWith("gets annoyed")) {
        consequence = "would react negatively";
      } else if (ruleLower.startsWith("refuses")) {
        consequence = "refuses to engage";
      }

      const cleanRule = rule.endsWith(".") ? rule.slice(0, -1) : rule;
      ruleBarriers.push(
        `${cleanRule} — in this scenario, ${persona.name} ${consequence}.`
      );

      const isHardGate = hardGateStarters.some((s) => ruleLower.startsWith(s));
      if (isHardGate) {
        blocking = true;
      }
    }
  }

  return { blocking, ruleBarriers };
}

// ─── Step 3: Score Barriers ───────────────────────────────────────────────────

function scoreBarriers(
  persona: Persona,
  ruleBarriers: string[],
  scenario: Scenario | null,
  _behaviorFacts: BehaviorFact[]
): string[] {
  const barriers: string[] = [...ruleBarriers];

  const scenarioContext = (scenario?.context ?? "").toLowerCase();
  const scenarioTags = (scenario?.contextTags ?? []).map((t) => t.toLowerCase());
  const scenarioId = (scenario?.id ?? "").toLowerCase();

  // Price sensitivity check
  if (
    persona.price_sensitivity &&
    (scenarioContext.includes("price") ||
      scenarioContext.includes("cost") ||
      scenarioContext.includes("$") ||
      scenarioId.includes("price"))
  ) {
    barriers.push(
      `${persona.name}'s price threshold ("${persona.price_sensitivity}") may make this feel steep without established trust.`
    );
  }

  // CC awareness gap for retail/shelf scenarios
  const ccAwareness = (persona.cc_awareness ?? "").toLowerCase();
  const hasLowAwareness = [
    "doesn't know",
    "never heard",
    "vague",
    "no strong",
    "hasn't bought",
    "unclear",
  ].some((cue) => ccAwareness.includes(cue));

  const isRetailOrShelf =
    scenarioId.includes("shelf") ||
    scenarioId.includes("store") ||
    scenarioId.includes("grocery") ||
    scenarioId.includes("costco") ||
    scenarioContext.includes("shelf") ||
    scenarioContext.includes("grocery");

  if (hasLowAwareness && isRetailOrShelf && persona.cc_awareness) {
    barriers.push(
      `${persona.name}'s limited Clearly Canadian awareness ("${persona.cc_awareness}") means brand recognition won't drive the pick-up.`
    );
  }

  // Discovery channel mismatch
  const scenarioDiscoveryChannels: string[] = [];
  if (scenarioTags.includes("tiktok") || scenarioContext.includes("tiktok"))
    scenarioDiscoveryChannels.push("tiktok");
  if (scenarioTags.includes("instagram") || scenarioContext.includes("instagram"))
    scenarioDiscoveryChannels.push("instagram");
  if (scenarioTags.some((t) => t.includes("bar") || t.includes("on_premise")))
    scenarioDiscoveryChannels.push("bar");
  if (
    scenarioId.includes("shelf") ||
    scenarioId.includes("grocery") ||
    scenarioId.includes("store")
  )
    scenarioDiscoveryChannels.push("shelf");
  if (scenarioId.includes("festival")) scenarioDiscoveryChannels.push("festival");

  if (scenarioDiscoveryChannels.length > 0) {
    const personaChannels = persona.channel_preferences.map((c) => c.toLowerCase());
    const hasChannelMismatch = !scenarioDiscoveryChannels.some((sc) =>
      personaChannels.some(
        (pc) => pc.includes(sc) || sc.includes(pc.split(" ")[0] ?? "")
      )
    );
    if (hasChannelMismatch) {
      const missingChannel = scenarioDiscoveryChannels[0];
      barriers.push(
        `${persona.name}'s channel preferences don't align with "${missingChannel}" — discovery in this context may not reach them.`
      );
    }
  }

  return barriers.slice(0, 4);
}

// ─── Step 4: Infer Beliefs ────────────────────────────────────────────────────

function inferBeliefs(
  persona: Persona,
  scenario: Scenario | null,
  _behaviorFacts: BehaviorFact[]
): string[] {
  const beliefs: string[] = [];

  const scenarioId = (scenario?.id ?? "").toLowerCase();
  const scenarioTags = (scenario?.contextTags ?? []).map((t) => t.toLowerCase());

  const isSustainabilityScenario =
    scenarioId.includes("sustainability") ||
    scenarioTags.includes("sustainability") ||
    scenarioTags.includes("eco_values");
  const isNostalgiaScenario =
    scenarioId.includes("nostalgia") ||
    scenarioTags.includes("nostalgia") ||
    scenarioTags.includes("lapsed_consumer");
  const isMapleScenario =
    scenarioId.includes("maple") || scenarioTags.includes("maple");
  const isSocialScenario = scenarioTags.some((t) =>
    ["tiktok", "instagram", "social_media"].includes(t)
  );

  // Belief 1: cc_perception shapes unconscious brand filter
  if (persona.cc_perception) {
    beliefs.push(
      `${persona.name}'s unconscious perception of Clearly Canadian — "${persona.cc_perception}" — shapes how they process any marketing or placement signal, even if they don't articulate it.`
    );
  }

  // Belief 2: beverage psychology + scenario stimulus
  if (persona.beverage_psychology) {
    if (isSocialScenario && persona.social_media_behavior) {
      beliefs.push(
        `${persona.name}'s beverage psychology ("${persona.beverage_psychology}") interacts with their social behavior — they process this as a content opportunity, not just a drink decision.`
      );
    } else if (isMapleScenario) {
      beliefs.push(
        `${persona.name}'s internal beverage logic ("${persona.beverage_psychology}") meets a novel stimulus — the maple variant may excite or trigger skepticism depending on their baseline.`
      );
    } else {
      beliefs.push(
        `${persona.name}'s beverage psychology ("${persona.beverage_psychology}") is operating in the background, even if they don't consciously reference it.`
      );
    }
  }

  // Belief 3: scenario-persona combination insight
  const nostalgiaLevel = (persona.nostalgia_relevance ?? "").toLowerCase();
  if (
    isNostalgiaScenario &&
    nostalgiaLevel &&
    !nostalgiaLevel.includes("none") &&
    !nostalgiaLevel.includes("low")
  ) {
    beliefs.push(
      `${persona.name}'s nostalgia relevance is "${persona.nostalgia_relevance}" — the emotional recall in this scenario triggers something deeper than rational evaluation; they're not just buying a drink, they're reclaiming a memory.`
    );
  } else if (isSustainabilityScenario && persona.sustainability_attitude) {
    beliefs.push(
      `${persona.name}'s sustainability attitude ("${persona.sustainability_attitude}") creates internal tension — they likely feel mild guilt about current packaging choices even if they won't admit it publicly.`
    );
  } else if (isMapleScenario && persona.canadian_identity_relevance) {
    beliefs.push(
      `${persona.name}'s Canadian identity relevance is "${persona.canadian_identity_relevance}" — a maple-branded Canadian product triggers a latent identity signal they may not consciously acknowledge.`
    );
  }

  return beliefs.slice(0, 3);
}

// ─── Step 5: Choose Decision ──────────────────────────────────────────────────

function chooseDecision(
  drivers: string[],
  barriers: string[],
  blocking: boolean,
  persona: Persona
): PersonaSimulationResult["decision"] {
  if (blocking) return "hard_no";
  if (persona.customer_type === "existing" && drivers.length >= 2)
    return "already_buying";
  if (drivers.length >= 3 && barriers.length === 0) return "immediate_yes";
  if (drivers.length >= 2 && barriers.length <= 1) return "likely_try";
  if (drivers.length >= 1 && barriers.length >= 3) return "unlikely_without_push";
  if (drivers.length >= 1 && barriers.length >= 2) return "interested_but_barriers";
  if (drivers.length === 0 && barriers.length === 0) return "indifferent";
  if (drivers.length === 0 && barriers.length >= 1) return "unlikely_without_push";
  return "interested_but_barriers";
}

// ─── Step 6: Compute Confidence ───────────────────────────────────────────────

function computeConfidence(
  behaviorFacts: BehaviorFact[],
  drivers: string[],
  barriers: string[]
): number {
  const base = 0.4;
  const driverBonus = Math.min(drivers.length * 0.08, 0.32);
  const barrierPenalty = barriers.length * 0.06;
  const avgFactConf =
    behaviorFacts.length > 0
      ? behaviorFacts.reduce((sum, f) => sum + f.confidence, 0) /
        behaviorFacts.length
      : 0;
  const factBonus = avgFactConf * 0.2;

  const raw = base + driverBonus - barrierPenalty + factBonus;
  return Math.min(0.95, Math.max(0.1, raw));
}

// ─── Step 7: Compose Response Text ───────────────────────────────────────────

function composeResponseText(
  persona: Persona,
  scenario: Scenario | null,
  decision: PersonaSimulationResult["decision"],
  drivers: string[],
  barriers: string[],
  _userQuestion?: string
): string {
  const style = (persona.language_style ?? "").toLowerCase();
  const scenarioId = (scenario?.id ?? "").toLowerCase();
  const scenarioTags = (scenario?.contextTags ?? []).map((t) => t.toLowerCase());

  const isMapleScenario =
    scenarioId.includes("maple") || scenarioTags.includes("maple");
  const isBarOrFestivalScenario =
    scenarioId.includes("bar") ||
    scenarioId.includes("festival") ||
    scenarioTags.some(
      (t) =>
        t.includes("bar") ||
        t.includes("cocktail") ||
        t.includes("festival") ||
        t.includes("on_premise")
    );

  // Style detection
  const isGenZ =
    style.includes("casual") ||
    style.includes("gen z") ||
    style.includes("lowkey") ||
    style.includes("emoji") ||
    style.includes("slay") ||
    style.includes("that's giving");
  const isCraftCocktail =
    style.includes("craft-cocktail") || style.includes("mouthfeel");
  const isNostalgicDirect =
    style.includes("nostalgic") ||
    style.includes("remember when") ||
    style.includes("back in the day");
  const isPracticalBlunt =
    style.includes("blunt") ||
    style.includes("no-nonsense") ||
    style.includes("midwestern") ||
    (style.includes("practical") && style.includes("parent"));
  const isAnalytical =
    style.includes("educational") ||
    style.includes("analytical") ||
    style.includes("evidence-based") ||
    style.includes("nutrition terminology");
  const isWarm =
    style.includes("warm") ||
    style.includes("maternal") ||
    style.includes("you have to try");

  // Building block 1: Opening based on cc_awareness + cc_perception
  let opening = "";
  const ccAwareness = persona.cc_awareness ?? "";
  const ccPerception = persona.cc_perception ?? "";
  const hasGoodAwareness =
    ccAwareness.length > 0 &&
    !["doesn't know", "never heard", "vague", "not sure"].some((cue) =>
      ccAwareness.toLowerCase().includes(cue)
    );

  if (hasGoodAwareness && ccPerception) {
    if (isGenZ) {
      opening = `Okay so I've ${ccAwareness.toLowerCase()}, and my vibe is "${ccPerception.toLowerCase()}". `;
    } else if (isCraftCocktail) {
      opening = `I know the brand — ${ccAwareness.toLowerCase()}. My professional read: "${ccPerception}". `;
    } else if (isNostalgicDirect) {
      opening = `Look, I know this brand — ${ccAwareness.toLowerCase()}. To me, it's "${ccPerception.toLowerCase()}". `;
    } else if (isPracticalBlunt) {
      opening = `Yeah, I know it. ${ccAwareness}. `;
    } else if (isAnalytical) {
      opening = `Context: ${ccAwareness}. Current assessment: "${ccPerception}". `;
    } else if (isWarm) {
      opening = `Oh, I know exactly what this is! ${ccAwareness}. To me, it's "${ccPerception.toLowerCase()}" — and I mean that. `;
    } else {
      opening = `I'm familiar with this — ${ccAwareness.toLowerCase()}. My sense of it: "${ccPerception.toLowerCase()}". `;
    }
  } else if (!hasGoodAwareness) {
    if (isGenZ) {
      opening = `Okay so this is kinda new to me, but `;
    } else if (isCraftCocktail) {
      opening = `Coming at this relatively fresh — `;
    } else if (isWarm) {
      opening = `I haven't had much exposure to this brand, but let me tell you — `;
    }
    // isPracticalBlunt: no opening, just cut to it
  }

  // Building block 2: Core reaction (priority: maple > bar/festival > beverage_psychology + driver > driver)
  let core = "";
  const topDriver = drivers[0] ?? null;

  if (isMapleScenario && persona.response_to_maple_product) {
    if (isGenZ) {
      core = `the maple thing? ${persona.response_to_maple_product.toLowerCase()}`;
    } else if (isCraftCocktail) {
      core = `On the maple variant: ${persona.response_to_maple_product} I can see real cocktail applications here — maple bridges sweet and complex in a way most mixers don't.`;
    } else if (isNostalgicDirect) {
      core = `as for the maple — ${persona.response_to_maple_product.toLowerCase()}`;
    } else if (isAnalytical) {
      core = `On the maple formulation: ${persona.response_to_maple_product} That's the key variable I'd need answered.`;
    } else if (isWarm) {
      core = `The maple aspect? ${persona.response_to_maple_product} I think that's really exciting.`;
    } else {
      core = `Regarding the maple aspect: ${persona.response_to_maple_product}`;
    }
  } else if (isBarOrFestivalScenario && persona.bar_and_festival_relevance) {
    if (isGenZ) {
      core = `at bars and festivals? ${persona.bar_and_festival_relevance.toLowerCase()} so this context makes total sense for me.`;
    } else if (isCraftCocktail) {
      core = `In my professional context: ${persona.bar_and_festival_relevance} The on-premise positioning is exactly where this product belongs.`;
    } else if (isNostalgicDirect) {
      core = `bars and festivals? ${persona.bar_and_festival_relevance.toLowerCase()}.`;
    } else {
      core = `In this bar/festival context: ${persona.bar_and_festival_relevance}`;
    }
  } else if (persona.beverage_psychology && topDriver) {
    if (isGenZ) {
      core = `like, ${persona.beverage_psychology.toLowerCase()} and this is lowkey hitting that for me.`;
    } else if (isCraftCocktail) {
      core = `${persona.beverage_psychology} And specifically: ${topDriver.split(" — ")[0]}.`;
    } else if (isNostalgicDirect) {
      core = `${persona.beverage_psychology.toLowerCase()} ${topDriver.split(" — ")[0]}.`;
    } else if (isPracticalBlunt) {
      core = `${topDriver.split(" — ")[0]}. That's what matters here.`;
    } else if (isAnalytical) {
      core = `My evaluation framework: ${persona.beverage_psychology} Primary driver: ${topDriver.split(" — ")[0]}.`;
    } else {
      core = `${persona.beverage_psychology} ${topDriver.split(" — ")[0]}.`;
    }
  } else if (topDriver) {
    if (isGenZ) {
      core = `no cap, ${topDriver.toLowerCase().split(" — ")[0]}`;
    } else if (isNostalgicDirect) {
      core = `here's the thing — ${topDriver.split(" — ")[0]}`;
    } else if (isPracticalBlunt) {
      core = `${topDriver.split(" — ")[0]}. Simple.`;
    } else if (isAnalytical) {
      core = `Primary factor: ${topDriver.split(" — ")[0]}`;
    } else {
      core = topDriver.split(" — ")[0];
    }
  } else {
    if (isGenZ) {
      core = `honestly not sure where I stand on this ngl`;
    } else if (isPracticalBlunt) {
      core = `not really feeling it.`;
    } else {
      core = `I don't have a strong pull toward this scenario.`;
    }
  }

  // Building block 3: Closing with top barrier in persona's voice
  let closing = "";
  const rawBarrier = barriers[0] ?? null;
  if (rawBarrier) {
    // Trim to the core rule/fact, drop the "— in this scenario, X would..." suffix
    const barrierCore =
      rawBarrier.split(" — in this scenario")[0].slice(0, 120);
    if (isGenZ) {
      closing = ` But lowkey, ${barrierCore.toLowerCase()} is still a factor.`;
    } else if (isCraftCocktail) {
      closing = ` That said, ${barrierCore.toLowerCase()} — I'd need that answered before committing.`;
    } else if (isNostalgicDirect) {
      closing = ` My concern: ${barrierCore.toLowerCase()}.`;
    } else if (isPracticalBlunt) {
      closing = ` Issue: ${barrierCore.toLowerCase()}.`;
    } else if (isAnalytical) {
      closing = ` Constraint: ${barrierCore.toLowerCase()}.`;
    } else if (isWarm) {
      closing = ` Though I do worry about ${barrierCore.toLowerCase()}.`;
    } else {
      closing = ` Though ${barrierCore.toLowerCase()} gives me some pause.`;
    }
  }

  return (opening + core + closing).trim();
}

// ─── Main: runSimulation ──────────────────────────────────────────────────────

export function runSimulation(
  persona: Persona,
  scenario: Scenario | null,
  behaviorFacts: BehaviorFact[],
  brandFacts: BrandFact[],
  productContext?: string,
  userQuestion?: string
): PersonaSimulationResult {
  const drivers = scoreDrivers(persona, scenario, behaviorFacts, brandFacts);
  const { blocking, ruleBarriers } = evaluateBehaviorRules(
    persona,
    scenario,
    behaviorFacts
  );
  const barriers = scoreBarriers(persona, ruleBarriers, scenario, behaviorFacts);
  const inferred_beliefs = inferBeliefs(persona, scenario, behaviorFacts);
  const decision = chooseDecision(drivers, barriers, blocking, persona);
  const confidence = computeConfidence(behaviorFacts, drivers, barriers);
  const response_text = composeResponseText(
    persona,
    scenario,
    decision,
    drivers,
    barriers,
    userQuestion
  );

  const validator_flags: string[] = [];
  if (behaviorFacts.length < 2) validator_flags.push("low_evidence");
  if (drivers.length === 0) validator_flags.push("no_driver_match");
  if (blocking) validator_flags.push("blocking_rule_fired");
  if (confidence < 0.45) validator_flags.push("low_confidence");
  if (inferred_beliefs.length > 0 && drivers.length === 0)
    validator_flags.push("inferred_only");

  return {
    persona_id: persona.id,
    persona_name: persona.name,
    decision,
    drivers,
    barriers,
    inferred_beliefs,
    confidence,
    used_evidence_ids: behaviorFacts.map((f) => f.id),
    response_text,
    validator_flags,
  };
}

// ─── simulate() — existing persona-chat path ─────────────────────────────────

export function simulate(
  persona: Persona,
  scenario: Scenario | null,
  userMessage: Message,
  evidence: Evidence[],
  sessionId: string
): ChatTurn {
  // Convert Evidence[] → pseudo-BehaviorFact[]
  const behaviorFacts: BehaviorFact[] = evidence.map((e) => ({
    id: e.id,
    statement: e.text,
    category: e.category,
    applies_to: [],
    market: "CA",
    source: e.source ?? "unknown",
    source_type: "other" as const,
    confidence: e.relevanceScore,
    tags: e.tags,
  }));

  const result = runSimulation(
    persona,
    scenario,
    behaviorFacts,
    [],
    undefined,
    userMessage.content
  );

  const replyText = composePersonaResponse(persona, result, userMessage.content);

  const personaReply: Message = {
    id: nextId(),
    role: "assistant",
    content: replyText,
    timestamp: Date.now(),
    metadata: {
      personaId: persona.id,
      scenarioId: scenario?.id,
      evidenceIds: result.used_evidence_ids,
      confidence: result.confidence,
    },
  };

  return {
    userMessage,
    personaReply,
    persona,
    scenario: scenario ?? undefined,
    sessionId,
  };
}
