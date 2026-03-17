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

// ─── Step 1: Score Drivers ────────────────────────────────────────────────────

function scoreDrivers(
  persona: Persona,
  behaviorFacts: BehaviorFact[],
  brandFacts: BrandFact[]
): string[] {
  const allFacts: { statement: string; tags: string[] }[] = [
    ...behaviorFacts.map((f) => ({ statement: f.statement, tags: f.tags })),
    ...brandFacts.map((f) => ({ statement: f.statement, tags: [] as string[] })),
  ];

  const drivers: string[] = [];

  const triggers = [...persona.motivations, ...persona.buying_triggers];

  for (const trigger of triggers) {
    const keyword = trigger.toLowerCase();
    for (const fact of allFacts) {
      const inTags = fact.tags.some((t) => t.toLowerCase().includes(keyword));
      const inStatement = fact.statement.toLowerCase().includes(keyword);
      if (inTags || inStatement) {
        const driver = `"${trigger}" supported by: ${fact.statement.slice(0, 80)}`;
        if (!drivers.includes(driver)) {
          drivers.push(driver);
        }
      }
    }
  }

  return drivers.slice(0, 5);
}

// ─── Step 2: Score Barriers ───────────────────────────────────────────────────

function scoreBarriers(
  persona: Persona,
  behaviorFacts: BehaviorFact[],
  scenario: Scenario | null
): string[] {
  const barriers: string[] = [];
  const scenarioContext = (scenario?.context ?? "").toLowerCase();
  const scenarioTags = (scenario?.contextTags ?? []).map((t) => t.toLowerCase());

  for (const objection of persona.objections) {
    const kw = objection.toLowerCase();
    const inScenario = scenarioContext.includes(kw);
    const inFact = behaviorFacts.some((f) => f.statement.toLowerCase().includes(kw));
    if (inScenario || inFact) {
      barriers.push(`Objection: "${objection}"`);
    }
  }

  for (const painPoint of persona.pain_points) {
    const kw = painPoint.toLowerCase();
    const inTags = scenarioTags.some((t) => t.includes(kw));
    const inFactTags = behaviorFacts.some((f) =>
      f.tags.some((t) => t.toLowerCase().includes(kw))
    );
    if (inTags || inFactTags) {
      barriers.push(`Pain point: "${painPoint}"`);
    }
  }

  return barriers.slice(0, 4);
}

// ─── Step 3: Check Blocking Rules ────────────────────────────────────────────

function checkBlockingRules(
  persona: Persona,
  behaviorFacts: BehaviorFact[],
  scenario: Scenario | null
): boolean {
  const scenarioContext = (scenario?.context ?? "").toLowerCase();
  const allText = [
    scenarioContext,
    ...behaviorFacts.map((f) => f.statement.toLowerCase()),
  ].join(" ");

  for (const rule of persona.behavior_rules) {
    if (rule.startsWith("Will not") || rule.startsWith("Won't")) {
      const ifIdx = rule.toLowerCase().indexOf(" if ");
      if (ifIdx !== -1) {
        const condition = rule.slice(ifIdx + 4).toLowerCase();
        if (allText.includes(condition)) {
          return true;
        }
      }
    }
  }

  return false;
}

// ─── Step 4: Infer Beliefs ────────────────────────────────────────────────────

function inferBeliefs(
  persona: Persona,
  scenario: Scenario | null,
  behaviorFacts: BehaviorFact[]
): string[] {
  const beliefs: string[] = [];

  if (persona.customer_type === "existing") {
    beliefs.push("Likely already familiar with the brand");
  }

  const motivationsStr = persona.motivations.join(" ").toLowerCase();
  const hasNostalgia = motivationsStr.includes("nostalgia");
  const hasRetroFact = behaviorFacts.some(
    (f) =>
      f.statement.toLowerCase().includes("90s") ||
      f.statement.toLowerCase().includes("retro")
  );
  if (hasNostalgia && hasRetroFact) {
    beliefs.push("Likely: Brand recall likely high for this cohort");
  }

  const hasSocialRule = persona.behavior_rules.some(
    (r) => r.toLowerCase().includes("social") || r.toLowerCase().includes("post")
  );
  if (hasSocialRule) {
    beliefs.push("Possibly: May share product unprompted if packaging is distinctive");
  }

  const isEco =
    motivationsStr.includes("eco") || motivationsStr.includes("environment");
  const isSustainabilityScenario =
    (scenario?.required_fact_categories ?? []).some((c) =>
      c.toLowerCase().includes("sustainability")
    ) ||
    (scenario?.id ?? "").toLowerCase().includes("sustainability") ||
    (scenario?.name ?? "").toLowerCase().includes("sustainability");

  if (isSustainabilityScenario && isEco) {
    beliefs.push("Likely: Sustainability messaging will reinforce purchase intent");
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
  if (blocking) return "likely_reject";
  if (persona.customer_type === "existing" && drivers.length >= 2) return "likely_repeat";
  if (drivers.length >= 2 && barriers.length === 0) return "likely_try";
  if (drivers.length >= 1 && barriers.length >= 2) return "mixed_interest";
  if (
    drivers.length === 0 &&
    persona.objections.some(
      (o) => o.toLowerCase().includes("never heard") || o.toLowerCase().includes("who is")
    )
  ) {
    return "low_awareness_high_potential";
  }
  if (drivers.length >= 1 && barriers.length <= 1) return "likely_try";
  return "mixed_interest";
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
      ? behaviorFacts.reduce((sum, f) => sum + f.confidence, 0) / behaviorFacts.length
      : 0;
  const factBonus = avgFactConf * 0.2;

  const raw = base + driverBonus - barrierPenalty + factBonus;
  return Math.min(0.95, Math.max(0.1, raw));
}

// ─── Step 7: Compose Response Text ───────────────────────────────────────────

function composeResponseText(
  persona: Persona,
  decision: PersonaSimulationResult["decision"],
  drivers: string[],
  barriers: string[],
  userQuestion?: string
): string {
  const style = persona.language_style?.toLowerCase() ?? "";

  const topDriver = drivers[0]
    ? drivers[0].split("supported by:")[0].replace(/"/g, "").trim()
    : null;
  const topBarrier = barriers[0]
    ? barriers[0].replace(/^(Objection|Pain point): /, "").replace(/"/g, "").trim()
    : null;

  let opener = "";
  if (userQuestion) {
    if (style === "casual") {
      opener = `Honestly, ${userQuestion.replace(/\?$/, "").toLowerCase()}? `;
    } else if (style === "conversational") {
      opener = `That's a good question — thinking about ${userQuestion.replace(/\?$/, "").toLowerCase()}, `;
    } else {
      opener = `Regarding: "${userQuestion}" — `;
    }
  }

  let core = "";
  if (style === "casual") {
    core = topDriver
      ? `I'd probably ${decision === "likely_reject" ? "pass" : "go for it"} — ${topDriver.toLowerCase()} is a big deal for me.`
      : `I'm honestly not sure where I land on this one.`;
  } else if (style === "conversational") {
    core = topDriver
      ? `I find myself drawn to it because ${topDriver.toLowerCase()} aligns with what I care about.`
      : `I'm weighing this carefully; there isn't enough here to fully commit.`;
  } else {
    core = topDriver
      ? `${persona.name} is inclined toward a "${decision}" outcome, driven by ${topDriver}.`
      : `${persona.name} shows mixed signals without a strong driver.`;
  }

  let concession = "";
  if (topBarrier) {
    if (style === "casual") {
      concession = ` Though ${topBarrier.toLowerCase()} is still bugging me.`;
    } else if (style === "conversational") {
      concession = ` That said, ${topBarrier.toLowerCase()} gives me pause.`;
    } else {
      concession = ` However, ${topBarrier} remains a concern.`;
    }
  }

  return (opener + core + concession).trim();
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
  const drivers = scoreDrivers(persona, behaviorFacts, brandFacts);
  const barriers = scoreBarriers(persona, behaviorFacts, scenario);
  const blocking = checkBlockingRules(persona, behaviorFacts, scenario);
  const inferred_beliefs = inferBeliefs(persona, scenario, behaviorFacts);
  const decision = chooseDecision(drivers, barriers, blocking, persona);
  const confidence = computeConfidence(behaviorFacts, drivers, barriers);
  const response_text = composeResponseText(persona, decision, drivers, barriers, userQuestion);

  const validator_flags: string[] = [];
  if (behaviorFacts.length < 2) validator_flags.push("low_evidence");
  if (drivers.length === 0) validator_flags.push("no_driver_match");
  if (blocking) validator_flags.push("blocking_rule_fired");
  if (confidence < 0.45) validator_flags.push("low_confidence");
  if (inferred_beliefs.length > 0 && drivers.length === 0) validator_flags.push("inferred_only");

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
