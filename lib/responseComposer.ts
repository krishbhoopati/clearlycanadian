import type { Evidence, Persona, ParsedQuery, PersonaSimulationResult } from "./types";

const INTENT_OPENERS: Record<string, string> = {
  explore:  "Based on available research,",
  compare:  "Comparing the evidence,",
  validate: "The data suggests that",
  explain:  "The underlying reasons appear to be",
};

export function composeSummary(query: ParsedQuery, evidence: Evidence[]): string {
  const opener = INTENT_OPENERS[query.intent] ?? "Based on available research,";

  if (evidence.length === 0) {
    return `${opener} no matching evidence was found for "${query.rawText}". ` +
      `Try broadening your query or selecting a different scenario.`;
  }

  if (query.topic) {
    const topicItems = evidence.filter((e) => e.category === query.topic);
    if (topicItems.length < 2) {
      const covered = [...new Set(evidence.map((e) => e.category))].join(", ");
      const topicLabel = query.topic.replace(/_/g, " ");
      return `${opener} direct evidence on "${topicLabel}" is limited in the current dataset. ` +
        `Available facts cover: ${covered}. Consider broadening your query or adding more ` +
        `${topicLabel}-tagged evidence to the data pipeline.`;
    }
    const topTexts   = topicItems.slice(0, 3).map((e) => e.text).join(" Additionally, ");
    const categoryList = [...new Set(evidence.map((e) => e.category))].join(", ");
    return `${opener} ${topTexts} This evidence spans: ${categoryList}.`;
  }

  const topTexts     = evidence.slice(0, 3).map((e) => e.text).join(" Additionally, ");
  const categoryList = [...new Set(evidence.map((e) => e.category))].join(", ");
  return `${opener} ${topTexts} This evidence spans the following categories: ${categoryList}.`;
}

const DECISION_OPENERS: Record<string, string> = {
  likely_try: "I'd give this a shot",
  likely_repeat: "Yeah, I'd pick this up again",
  likely_reject: "Honestly, this isn't really for me",
  mixed_interest: "I'm a bit on the fence here",
  low_awareness_high_potential: "I haven't really heard of this, but it sounds like something I'd check out",
};

const TOPIC_OPENERS: Record<string, string> = {
  price:        "On the price side,",
  health:       "Health-wise,",
  availability: "As for finding it,",
  flavor:       "Taste-wise,",
  packaging:    "The packaging —",
  social:       "On the social side,",
  nostalgia:    "The nostalgia factor —",
  brand:        "Brand-wise,",
};

const DECISION_PHRASES: Record<string, string> = {
  likely_try: "shows strong purchase intent",
  likely_repeat: "is a high-retention candidate",
  likely_reject: "is likely to pass on this product",
  mixed_interest: "shows mixed signals",
  low_awareness_high_potential: "has low awareness but latent interest",
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  price:        ["price", "cost", "expensive", "pay", "cheap", "afford", "worth", "dollar"],
  health:       ["sugar", "zero", "sweetener", "calorie", "healthy", "clean", "ingredient", "natural", "diet"],
  availability: ["find", "available", "store", "where", "stock", "near", "location", "get it"],
  flavor:       ["flavor", "taste", "drink", "sip", "raspberry", "cherry", "peach", "orange"],
  packaging:    ["bottle", "glass", "can", "packaging", "aesthetic", "look", "design"],
  social:       ["tiktok", "instagram", "social", "viral", "post", "share", "friend", "influencer"],
  nostalgia:    ["nostalgia", "remember", "90s", "childhood", "back", "used to", "retro"],
  brand:        ["brand", "company", "heard", "know", "familiar", "still around", "who"],
};

function detectTopic(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return topic;
  }
  return "general";
}

function pickPersonaContent(
  persona: Persona,
  topic: string,
): { driver: string | null; barrier: string | null } {
  const keywords = TOPIC_KEYWORDS[topic] ?? [];

  const trigger =
    persona.buying_triggers.find((t) =>
      keywords.some((k) => t.toLowerCase().includes(k)),
    ) ?? persona.buying_triggers[0] ?? null;

  const barrier = [...persona.objections, ...persona.pain_points].find((o) =>
    keywords.some((k) => o.toLowerCase().includes(k)),
  ) ?? null;

  return {
    driver: trigger ? trigger.replace(/^['"]|['"]$/g, "").toLowerCase() : null,
    barrier: barrier ? barrier.replace(/^['"]|['"]$/g, "").toLowerCase() : null,
  };
}

export function composePersonaResponse(
  persona: Persona,
  result: PersonaSimulationResult,
  userMessage?: string,
  turnIndex = 0,
): string {
  const style = (persona.language_style ?? "").toLowerCase();
  const topic = userMessage ? detectTopic(userMessage) : "general";
  const { driver, barrier } = pickPersonaContent(persona, topic);

  let body = "";

  // Follow-up turn with a specific topic: lead with topic transition, skip decision opener
  if (turnIndex > 0 && topic !== "general") {
    const opener = TOPIC_OPENERS[topic]!;
    if (style.includes("gen z slang") || style.includes("hype")) {
      body = driver
        ? `${opener} ngl, ${driver} hits different for me.`
        : `${opener} tbh I don't have strong feelings there.`;
      if (barrier) body += ` But ${barrier} is lowkey a red flag.`;
    } else if (style.includes("analytical")) {
      body = driver
        ? `${opener} ${driver} is the key factor I'd evaluate.`
        : `${opener} I'd need more data to form a clear view.`;
      if (barrier) body += ` Worth noting: ${barrier}.`;
    } else if (style.includes("nostalgic") || style.includes("warm")) {
      body = driver
        ? `${opener} ${driver} really resonates with me.`
        : `${opener} it's hard to put into words exactly.`;
      if (barrier) body += ` Though ${barrier} still gives me pause.`;
    } else if (style.includes("casual") || style.includes("short sentences") || style.includes("practical")) {
      body = driver
        ? `${opener} ${driver} is what matters to me.`
        : `${opener} not sure yet.`;
      if (barrier) body += ` ${barrier} is the main issue.`;
    } else {
      body = driver
        ? `${opener} ${driver} is what I'd focus on.`
        : `${opener} I haven't formed a strong view there.`;
      if (barrier) body += ` I do have concerns about ${barrier}.`;
    }
    return body;
  }

  // First turn (or general follow-up): use decision-based opener
  const opener = DECISION_OPENERS[result.decision] ?? "I'm on the fence";

  if (style.includes("gen z slang") || style.includes("hype")) {
    body = driver
      ? `${opener} — ngl, ${driver} is lowkey everything to me.`
      : `${opener}, I'm here for it tbh.`;
    if (barrier) body += ` Though ${barrier} is still a vibe-kill.`;
  } else if (style.includes("analytical")) {
    body = driver
      ? `${opener}, because ${driver} aligns with what I look for.`
      : `${opener}, though I'd need more data before fully committing.`;
    if (barrier) body += ` That said, ${barrier} is a factor I'd weigh.`;
  } else if (style.includes("nostalgic") || style.includes("warm")) {
    body = driver
      ? `${opener} — there's something about ${driver} that feels familiar and right.`
      : `${opener}. It just has that feeling I can't quite put my finger on.`;
    if (barrier) body += ` Still, ${barrier} lingers in the back of my mind.`;
  } else if (style.includes("casual") || style.includes("short sentences") || style.includes("practical")) {
    body = driver
      ? `${opener}. ${driver} is a big deal for me.`
      : `${opener}. Hard to say why exactly.`;
    if (barrier) body += ` But ${barrier} bothers me.`;
  } else {
    body = driver
      ? `${opener} — ${driver} is something I genuinely care about.`
      : `${opener}, though I'm not fully convinced yet.`;
    if (barrier) body += ` I do have some hesitation around ${barrier}.`;
  }

  return body;
}

export function composeInsightSummary(
  persona: Persona,
  result: PersonaSimulationResult,
): string {
  const phrase = DECISION_PHRASES[result.decision] ?? "shows mixed signals";

  const topDriverRaw = result.drivers[0] ?? "";
  const topDriver = topDriverRaw
    ? topDriverRaw.split("supported by:")[0].replace(/"/g, "").trim().toLowerCase()
    : null;

  const topBarrierRaw = result.barriers[0] ?? "";
  const topBarrier = topBarrierRaw
    ? topBarrierRaw.replace(/^(Objection|Pain point): /, "").replace(/"/g, "").trim().toLowerCase()
    : null;

  const lowEvidence =
    result.validator_flags.includes("low_confidence") ||
    result.validator_flags.includes("low_evidence");

  let sentence = `${persona.name} (${persona.generation}, ${persona.market}) ${phrase}`;
  if (topDriver) sentence += `, driven by ${topDriver}`;
  if (topBarrier) sentence += `; however, ${topBarrier} may reduce conversion`;
  sentence += ".";

  if (lowEvidence) {
    sentence += ` (low evidence — interpret with caution)`;
  } else {
    sentence += ` No strong barriers identified at this confidence level (${result.confidence.toFixed(2)}).`;
  }

  return sentence;
}

export function composePersonaReply(
  persona: Persona,
  userMessage: string,
  evidence: Evidence[]
): string {
  const valueStr = persona.motivations.slice(0, 2).join(" and ");
  const evidenceHint =
    evidence.length > 0
      ? ` The research backs this up — ${evidence[0].text.slice(0, 100)}...`
      : "";

  return (
    `As a ${persona.generation} consumer (${persona.market}) who values ${valueStr}, here's my take on "${userMessage}": ` +
    `${persona.decision_style}.${evidenceHint}`
  );
}
