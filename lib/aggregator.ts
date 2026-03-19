import type { Evidence, ParsedQuery, AggregatedResult, PersonaSimulationResult, AskLabResponse } from "./types";

export function aggregate(evidence: Evidence[], _query: ParsedQuery): AggregatedResult {
  const byCategory: Record<string, Evidence[]> = {};
  const seen = new Set<string>();
  const topEvidence: Evidence[] = [];

  for (const item of evidence) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);

    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
    topEvidence.push(item);
  }

  return {
    byCategory,
    topEvidence,
    totalCount: topEvidence.length,
  };
}

const DECISION_TIER: Record<string, number> = {
  already_buying: 6,
  immediate_yes: 5,
  likely_try: 4,
  interested_but_barriers: 3,
  indifferent: 2,
  unlikely_without_push: 1,
  hard_no: 0,
};

function getPersonaRoleLabel(r: PersonaSimulationResult): string {
  const raw = [...r.drivers, ...r.inferred_beliefs].join(" ").toLowerCase();
  if (raw.includes("bartend") || raw.includes("bar/festival")) return "bartender";
  if (raw.includes("tiktok") || raw.includes("instagram") || raw.includes("social media")) return "social discovery buyer";
  if (raw.includes("sober") || raw.includes("non-alcoholic")) return "sober-curious buyer";
  if (r.decision === "already_buying") return "loyal buyer";
  if (r.decision === "indifferent") return "convenience buyer";
  if (r.decision === "interested_but_barriers") return "fence-sitter";
  if (r.decision === "hard_no") return "resistant buyer";
  return "potential buyer";
}

function extractDriverConcept(driver: string): string | null {
  if (driver.includes("preferred discovery channel")) {
    const m = driver.match(/"([^"]+)"/);
    return m ? `${m[1]} discovery match` : "Discovery channel match";
  }
  if (driver.includes("existing awareness")) return "Clearly Canadian brand recognition";
  if (driver.includes("response to maple")) return "Maple product resonance";
  if (driver.includes("bar/festival relevance") || driver.includes("bar and festival")) return "Bar/festival context fit";
  if (driver.includes("buying trigger")) {
    const m = driver.match(/"([^"]+)"/);
    return m ? m[1].slice(0, 40) : "Buying trigger alignment";
  }
  if (driver.includes("beverage psychology")) return "Beverage psychology alignment";
  return null;
}

function extractBarrierConcept(barrier: string): string | null {
  if (barrier.includes("price threshold")) {
    const m = barrier.match(/price threshold[^—]*/i);
    return m ? m[0].trim().slice(0, 60) : "Price threshold concern";
  }
  if (barrier.includes("limited CC awareness") || barrier.includes("low CC awareness")) return "Low brand recognition";
  if (barrier.includes("channel preferences don't align") || barrier.includes("channel preferences do not align")) return "Discovery channel mismatch";
  if (barrier.includes(" — in this scenario")) return barrier.split(" — in this scenario")[0].trim().slice(0, 60);
  return null;
}

function extractDriverKeywords(driver: string): string[] {
  const stopWords = new Set(["their", "which", "would", "could", "about", "with", "from", "have", "this", "that", "they", "them", "when", "what", "where"]);
  return driver.toLowerCase().split(/\s+/).filter(w => w.length > 4 && !stopWords.has(w));
}

export function aggregateSimulations(
  results: PersonaSimulationResult[],
  scenario?: { id: string; name: string; contextTags?: string[] } | null
): AskLabResponse {
  if (results.length === 0) {
    return {
      overall_summary: "No personas consulted.",
      consulted_personas: [],
      top_drivers: [],
      top_barriers: [],
      key_disagreements: [],
      strategic_takeaway: "Insufficient consensus — broaden evidence base or refine targeting.",
      confidence: 0.1,
      used_evidence_ids: [],
      evidence_items: [],
      scenario_matched: false,
      segments_to_watch: [],
      suggested_follow_ups: [],
    };
  }

  const total = results.length;
  const scenarioName = scenario?.name ?? "This scenario";

  // ── top_drivers ────────────────────────────────────────────────────────────
  const positiveDecisions = new Set(["immediate_yes", "likely_try", "already_buying"]);
  const positiveResults = results.filter(r => positiveDecisions.has(r.decision));
  const driverConcepts: string[] = [];
  for (const r of positiveResults) {
    for (const d of r.drivers) {
      const concept = extractDriverConcept(d);
      if (concept && !driverConcepts.includes(concept)) driverConcepts.push(concept);
    }
  }
  const top_drivers = driverConcepts.slice(0, 5);

  // ── top_barriers ───────────────────────────────────────────────────────────
  const barrierConcepts: string[] = [];
  for (const r of results) {
    for (const b of r.barriers) {
      const concept = extractBarrierConcept(b);
      if (concept && !barrierConcepts.includes(concept)) barrierConcepts.push(concept);
    }
  }
  const top_barriers = barrierConcepts.slice(0, 5);

  // ── Group personas by intent ───────────────────────────────────────────────
  const enthusiasts = results.filter(r => r.decision === "immediate_yes" || r.decision === "already_buying");
  const likelyConverts = results.filter(r => r.decision === "likely_try");
  const lowIntent = results.filter(r => ["unlikely_without_push", "hard_no", "indifferent"].includes(r.decision));

  const allPositive = results.every(r => positiveDecisions.has(r.decision));
  const allNegative = results.every(r => !positiveDecisions.has(r.decision));

  const nameList = (arr: PersonaSimulationResult[]) => arr.map(r => r.persona_name).join(", ");

  // ── overall_summary — Sentence 1 ──────────────────────────────────────────
  let sentence1: string;
  if (allPositive) {
    const labeledList = results.map(r => `${r.persona_name} (${getPersonaRoleLabel(r)})`).join(", ");
    sentence1 = `${scenarioName} generates strong purchase intent across all consulted personas — ${labeledList}.`;
  } else if (allNegative) {
    const labeledList = results.map(r => `${r.persona_name} (${getPersonaRoleLabel(r)})`).join(", ");
    sentence1 = `${scenarioName} shows low relevance across all personas — ${labeledList} — none of the panel shows clear purchase intent.`;
  } else {
    const positiveGroup = [...enthusiasts, ...likelyConverts];
    const intentLabel = enthusiasts.length > 0 ? "strong" : likelyConverts.length > total / 2 ? "moderate" : "mixed";
    const lowLabel = lowIntent.some(r => r.decision === "hard_no") ? "resistance" : "indifference";
    const labeledPosList = positiveGroup.map(r => `${r.persona_name} (${getPersonaRoleLabel(r)})`).join(", ");
    const labeledLowList = lowIntent.map(r => `${r.persona_name} (${getPersonaRoleLabel(r)})`).join(", ");

    // Detect the split dimension from low-intent barriers
    const lowIntentBarrierText = lowIntent.flatMap(r => r.barriers).join(" ").toLowerCase();
    let splitDimension: string;
    if (lowIntentBarrierText.includes("channel") || lowIntentBarrierText.includes("discovery")) {
      splitDimension = "the split follows discovery-channel lines rather than product preference";
    } else if (lowIntentBarrierText.includes("awareness") || lowIntentBarrierText.includes("recognition")) {
      splitDimension = "the split follows brand familiarity lines";
    } else if (lowIntentBarrierText.includes("price") || lowIntentBarrierText.includes("threshold")) {
      splitDimension = "the split follows value-sensitivity lines";
    } else {
      splitDimension = "the split follows lifestyle and occasion fit";
    }

    if (labeledPosList && labeledLowList) {
      sentence1 = `${scenarioName} generates ${intentLabel} interest from ${labeledPosList} but faces ${lowLabel} from ${labeledLowList} — ${splitDimension}.`;
    } else if (labeledPosList) {
      const fenceSitters = results.filter(r => r.decision === "interested_but_barriers");
      const labeledFenceList = fenceSitters.map(r => `${r.persona_name} (${getPersonaRoleLabel(r)})`).join(", ");
      sentence1 = fenceSitters.length > 0
        ? `${scenarioName} generates ${intentLabel} interest from ${labeledPosList} with ${labeledFenceList} showing conditional interest — ${splitDimension}.`
        : `${scenarioName} generates ${intentLabel} interest from ${labeledPosList}.`;
    } else {
      sentence1 = `${scenarioName} generates mixed signals across the panel.`;
    }
  }

  // ── overall_summary — Sentence 2 ──────────────────────────────────────────
  let sentence2: string;
  const scenarioTags = scenario?.contextTags ?? [];
  const topDriverLower = (top_drivers[0] ?? "").toLowerCase();
  const hasBarFestival = scenarioTags.some(t => ["bar", "festival", "on_premise", "bartender"].includes(t.toLowerCase()))
    || topDriverLower.includes("bar") || topDriverLower.includes("festival");
  const hasSocial = topDriverLower.includes("tiktok") || topDriverLower.includes("instagram") || topDriverLower.includes("social");

  if (hasBarFestival) {
    sentence2 = `The bar/festival launch strategy is validated — on-premise trial creates the discovery moment that retail alone cannot.`;
  } else if (hasSocial) {
    sentence2 = `A single piece of native content collapses the awareness-to-trial gap — personas who already follow beverage content on social convert on first exposure.`;
  } else if (top_drivers[0]) {
    sentence2 = `The strongest mechanism driving positive intent is ${top_drivers[0].toLowerCase()} — this is the activation lever to build the launch plan around.`;
  } else {
    sentence2 = `No single dominant motivator emerged — the scenario resonates for different reasons across personas, suggesting a multi-channel activation strategy.`;
  }

  // ── overall_summary — Sentence 3 ──────────────────────────────────────────
  let sentence3: string;
  const topBarrierLower = (top_barriers[0] ?? "").toLowerCase();
  const lowIntentNames = nameList(lowIntent);

  if (topBarrierLower.includes("availability") || topBarrierLower.includes("distribution")) {
    sentence3 = `The key risk is the gap between trial and retail availability — personas who try it at a bar but can't find it at their regular store within 2 weeks will forget about it.`;
  } else if (topBarrierLower.includes("price")) {
    sentence3 = `The key risk is price perception — ${lowIntentNames || "low-intent personas"} hesitate at the shelf before brand trust is established, making the first 3 seconds of shelf decision the highest-risk moment.`;
  } else if (topBarrierLower.includes("recognition") || topBarrierLower.includes("awareness")) {
    const awarenessNames = nameList(results.filter(r => r.barriers.some(b => b.toLowerCase().includes("awareness"))));
    sentence3 = `The key risk is cold-start brand recognition — ${awarenessNames || lowIntentNames || "some personas"} lack the Clearly Canadian familiarity that makes pick-up automatic, so trial must precede retail push.`;
  } else if (top_barriers.length === 0) {
    sentence3 = `No significant shared barriers identified — conditions favor conversion if distribution is in place.`;
  } else {
    sentence3 = `The primary barrier to resolve before scaling is ${top_barriers[0].toLowerCase()}.`;
  }

  const overall_summary = `${sentence1} ${sentence2} ${sentence3}`;

  // ── key_disagreements ─────────────────────────────────────────────────────
  const key_disagreements: string[] = [];
  const posPersonas = results.filter(r => positiveDecisions.has(r.decision));
  const negPersonas = results.filter(r => !positiveDecisions.has(r.decision));

  outer: for (const p of posPersonas) {
    for (const n of negPersonas) {
      if (key_disagreements.length >= 3) break outer;
      const tierGap = (DECISION_TIER[p.decision] ?? 0) - (DECISION_TIER[n.decision] ?? 0);
      if (tierGap < 2) continue;

      const pRoleLabel = getPersonaRoleLabel(p);
      const nRoleLabel = getPersonaRoleLabel(n);
      const pRoleLower = pRoleLabel.toLowerCase();
      const nBarrierLower = n.barriers.join(" ").toLowerCase();

      const pTopDriverRaw = extractDriverConcept(p.drivers[0] ?? "") ?? (p.drivers[0] ?? "product relevance").slice(0, 40);
      const nTopBarrierRaw = extractBarrierConcept(n.barriers[0] ?? "") ?? (n.barriers[0] ?? "").split(" — ")[0].slice(0, 50);
      const pTopDriver = pTopDriverRaw.toLowerCase();
      const nTopBarrier = nTopBarrierRaw.toLowerCase();

      let disagreementSentence: string;
      let implication: string;

      if (pRoleLower === "loyal buyer" && (nBarrierLower.includes("dilut") || nBarrierLower.includes("brand"))) {
        disagreementSentence = `${p.persona_name} (${pRoleLabel}) values Clearly Canadian's existing lineup — ${pTopDriver}. ${n.persona_name} (${nRoleLabel}) worries the addition dilutes brand focus.`;
        implication = `This tension suggests Clearly Canadian should launch maple as a separate line extension, not a replacement, to avoid cannibalizing the core loyalist base.`;
      } else if (pRoleLower === "bartender" && (nBarrierLower.includes("channel") || nBarrierLower.includes("discovery"))) {
        disagreementSentence = `${p.persona_name} (${pRoleLabel}) sees immediate on-premise utility — ${pTopDriver}. ${n.persona_name} (${nRoleLabel}) has no equivalent discovery pathway through current channels.`;
        implication = `This signals Clearly Canadian should launch on-premise before retail — bartender adoption creates the discovery trail that retail buyers need.`;
      } else if (n.decision === "interested_but_barriers") {
        const barrierLabel = nTopBarrier || "the key barrier";
        disagreementSentence = `${p.persona_name} (${pRoleLabel}) converts on ${pTopDriver}. ${n.persona_name} (${nRoleLabel}) is held back by ${barrierLabel}.`;
        implication = `A targeted fix on ${barrierLabel} unlocks ${n.persona_name} — this is a conversion opportunity, not a repositioning problem.`;
      } else if (["hard_no", "unlikely_without_push"].includes(n.decision)) {
        disagreementSentence = `${p.persona_name} (${pRoleLabel}) is driven by ${pTopDriver}. ${n.persona_name} (${nRoleLabel}) shows ${n.decision.replace(/_/g, " ")} — top barrier is ${nTopBarrier || "a fundamental channel mismatch"}.`;
        implication = `This segment requires a different message, not more budget on current channels — the current positioning does not reach ${n.persona_name}'s motivation set.`;
      } else {
        const pKeywords = p.drivers.flatMap(d => extractDriverKeywords(d));
        const nBarrierText = n.barriers.join(" ").toLowerCase();
        const sharedTopic = pKeywords.find(kw => nBarrierText.includes(kw));

        if (sharedTopic) {
          disagreementSentence = `${p.persona_name} (${pRoleLabel}) is driven by ${pTopDriver}. ${n.persona_name} (${nRoleLabel}) is blocked by ${nTopBarrier || sharedTopic}.`;
          implication = `This divergence signals a segmentation gap — ${p.persona_name}'s activation levers do not transfer to ${n.persona_name}'s context.`;
        } else {
          disagreementSentence = `${p.persona_name} (${pRoleLabel}) shows ${p.decision.replace(/_/g, " ")} while ${n.persona_name} (${nRoleLabel}) shows ${n.decision.replace(/_/g, " ")}.`;
          implication = `What activates ${p.persona_name}'s segment does not reach ${n.persona_name} — investigate the channel and message separately before broadening spend.`;
        }
      }

      key_disagreements.push(`${disagreementSentence} ${implication}`);
    }
  }

  // ── strategic_takeaway ────────────────────────────────────────────────────
  let strategic_takeaway: string;
  const topPositives = [...results]
    .filter(r => positiveDecisions.has(r.decision))
    .sort((a, b) => b.confidence - a.confidence);

  if (topPositives.length === 0) {
    const topBarrier = top_barriers[0] ?? "current barriers";
    strategic_takeaway = `Resolve ${topBarrier} before launch — no persona segment shows frictionless conversion under current conditions.`;
  } else {
    const lead = topPositives[0];
    const leadRoleLabel = getPersonaRoleLabel(lead);
    const leadRoleLower = leadRoleLabel.toLowerCase();
    const otherPositiveNames = topPositives.slice(1).map(r => r.persona_name).join(", ");

    let actionNoun: string;
    let discoveryMechanism: string;

    if (leadRoleLower === "bartender") {
      actionNoun = "menu placements";
      discoveryMechanism = "on-premise discovery moment that retail alone cannot replicate";
    } else if (leadRoleLower === "social discovery buyer") {
      actionNoun = "native content creation";
      discoveryMechanism = "viral awareness that collapses the awareness-to-trial gap";
    } else if (leadRoleLower === "loyal buyer") {
      actionNoun = "repeat purchase momentum";
      discoveryMechanism = "word-of-mouth credibility that reaches adjacent segments authentically";
    } else if (leadRoleLower === "sober-curious buyer") {
      actionNoun = "lifestyle-led positioning";
      discoveryMechanism = "category bridge that makes Clearly Canadian relevant beyond the drinking occasion";
    } else {
      actionNoun = "shelf facings and in-store trial";
      discoveryMechanism = "retail discovery that converts consideration into purchase";
    }

    strategic_takeaway = `Lead ${scenarioName} through ${leadRoleLabel} adoption — ${lead.persona_name}-type personas are the highest-conviction, fastest-converting segment. Their ${actionNoun} create the ${discoveryMechanism} that ${otherPositiveNames || "other personas in the panel"} need to find the product naturally.`;
  }

  // ── segments_to_watch ─────────────────────────────────────────────────────
  const segments_to_watch: string[] = [];

  for (const r of results) {
    if (segments_to_watch.length >= 4) break;

    // 1. Fence-sitter with a single barrier
    if (r.decision === "interested_but_barriers" && r.barriers.length === 1) {
      const barrierLabel = extractBarrierConcept(r.barriers[0]) ?? r.barriers[0].split(" — ")[0].slice(0, 50);
      segments_to_watch.push(`${r.persona_name} (fence-sitter) is one barrier away from converting — their only block is ${barrierLabel.toLowerCase()}. A targeted price/availability/trial change would likely flip them.`);
      continue;
    }

    // 2. High-confidence hard_no with multiple relevant drivers
    if (r.decision === "hard_no" && r.confidence > 0.6 && r.drivers.length >= 2) {
      segments_to_watch.push(`${r.persona_name} rejected despite strong driver match — investigate whether brand trust or a specific scenario element is the blocker, not the product itself.`);
      continue;
    }

    // 3. Unexpected high intent from a low-familiarity persona
    const hasAwarenessBarrierButHighIntent =
      positiveDecisions.has(r.decision) &&
      r.barriers.some(b => b.toLowerCase().includes("awareness") || b.toLowerCase().includes("recognition"));
    if (hasAwarenessBarrierButHighIntent) {
      const awarenessBarrier = r.barriers.find(b => b.toLowerCase().includes("awareness") || b.toLowerCase().includes("recognition")) ?? "";
      const barrierLabel = extractBarrierConcept(awarenessBarrier) ?? "low brand familiarity";
      segments_to_watch.push(`${r.persona_name} shows ${r.decision.replace(/_/g, " ")} despite ${barrierLabel.toLowerCase()} — this persona converts faster than assumed when product fit is demonstrated.`);
      continue;
    }

    // 4. Inferred beliefs contradict decision
    const hasPositiveBeliefs = r.inferred_beliefs.some(b => {
      const bl = b.toLowerCase();
      return bl.includes("would try") || bl.includes("interested") || bl.includes("open to") || bl.includes("enjoys");
    });
    const isNegativeDecision = ["hard_no", "unlikely_without_push", "indifferent"].includes(r.decision);
    if (isNegativeDecision && hasPositiveBeliefs) {
      segments_to_watch.push(`${r.persona_name}'s stated decision conflicts with their inferred beliefs — worth probing in a follow-up chat to separate scenario-specific resistance from product resistance.`);
      continue;
    }

    // 5. Fallbacks — existing flag-based detection
    if (r.validator_flags.includes("blocking_rule_fired")) {
      segments_to_watch.push(`${r.persona_name} has a hard-blocking behavior rule that fired in this scenario — investigate the specific trigger before targeting this channel.`);
      continue;
    }
    if (r.decision !== "already_buying" && r.inferred_beliefs?.some(b => b.toLowerCase().includes("existing") || b.toLowerCase().includes("loyal"))) {
      segments_to_watch.push(`${r.persona_name} is an existing customer but did not show repeat-purchase intent — something in this scenario conflicts with their loyalty context.`);
      continue;
    }
    if (r.drivers.length >= 3 && r.barriers.length >= 2) {
      segments_to_watch.push(`${r.persona_name} shows high tension — strong drivers AND significant barriers. A small barrier-reduction change could unlock them.`);
      continue;
    }
    if (r.validator_flags.includes("no_driver_match")) {
      segments_to_watch.push(`${r.persona_name} returned no driver matches — the scenario may not be reaching them through any known activation channel.`);
    }
  }

  // ── suggested_follow_ups ──────────────────────────────────────────────────
  const suggested_follow_ups: string[] = [];

  // 1. Top positive persona — product-specific follow-up
  if (topPositives.length > 0) {
    const lead = topPositives[0];
    const leadRoleLabel = getPersonaRoleLabel(lead);
    const leadRoleLower = leadRoleLabel.toLowerCase();
    const tdLower = (lead.drivers[0] ?? "").toLowerCase();

    if (leadRoleLower === "bartender" || tdLower.includes("bartend") || tdLower.includes("bar/festival")) {
      const productCtx = tdLower.includes("maple") ? "Clearly Canadian Maple" : "Clearly Canadian";
      suggested_follow_ups.push(`Ask ${lead.persona_name}: What specific cocktail would you build with ${productCtx}, and where would it sit on the menu?`);
    } else if (leadRoleLower === "social discovery buyer" || tdLower.includes("tiktok") || tdLower.includes("instagram")) {
      suggested_follow_ups.push(`Ask ${lead.persona_name}: What post format or occasion would make you share Clearly Canadian to your feed — walk us through the exact moment.`);
    } else if (tdLower.includes("maple")) {
      suggested_follow_ups.push(`Ask ${lead.persona_name}: What specific cocktail or occasion would you pair with Clearly Canadian Maple first?`);
    } else {
      suggested_follow_ups.push(`Ask ${lead.persona_name}: What single change would make you recommend this product to someone like you?`);
    }
  }

  // 2. Fence-sitter — targeted barrier probe
  const fenceSitters = results.filter(r => r.decision === "interested_but_barriers");
  if (fenceSitters.length > 0) {
    const fs = fenceSitters[0];
    const barrierLabel = extractBarrierConcept(fs.barriers[0] ?? "") ?? (fs.barriers[0] ?? "the key barrier").split(" — ")[0].slice(0, 50);
    suggested_follow_ups.push(`Ask ${fs.persona_name}: "${barrierLabel}" — walk us through exactly what would need to change for this to be an easy yes.`);
  }

  // 3. Price comparison — always include when price is a barrier OR when multiple personas in panel
  const hasPriceBarrier = top_barriers.some(b => b.toLowerCase().includes("price"));
  if (hasPriceBarrier || results.length > 1) {
    const allNames = results.map(r => r.persona_name).join(", ");
    suggested_follow_ups.push(`Compare price reactions: Run the $8.99 vs $9.99 scenario across all personas (${allNames}) to identify the break-even threshold.`);
  }

  // 4. Scenario extension or cross-persona comparison
  if (scenario) {
    const scenarioLower = scenario.name.toLowerCase();
    let adjacentScenario: string;
    if (scenarioLower.includes("bar") || scenarioLower.includes("on-premise")) {
      adjacentScenario = "grocery shelf discovery";
    } else if (scenarioLower.includes("shelf") || scenarioLower.includes("retail")) {
      adjacentScenario = "on-premise bar trial";
    } else if (scenarioLower.includes("social") || scenarioLower.includes("tiktok")) {
      adjacentScenario = "in-store discovery";
    } else {
      adjacentScenario = "a contrasting discovery context";
    }
    const lowNeg = negPersonas[0];
    if (lowNeg) {
      suggested_follow_ups.push(`Run ${lowNeg.persona_name} through a '${adjacentScenario}' scenario to test whether their ${lowNeg.decision.replace(/_/g, " ")} holds without the current scenario's context.`);
    } else {
      suggested_follow_ups.push(`Run all personas through a '${adjacentScenario}' scenario to test whether intent holds without the current scenario's narrative.`);
    }
  } else if (posPersonas.length > 0 && negPersonas.length > 0) {
    const pa = posPersonas[0];
    const nb = negPersonas[0];
    suggested_follow_ups.push(`Compare ${pa.persona_name} and ${nb.persona_name} directly — their divergent responses will clarify whether this is a channel problem or a product problem.`);
  }

  // ── confidence ────────────────────────────────────────────────────────────
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;
  const flaggedCount = results.filter(r =>
    r.validator_flags.includes("low_evidence") || r.validator_flags.includes("low_confidence")
  ).length;
  const confidence = Math.max(0.1, avgConfidence - flaggedCount * 0.05);

  // ── evidence IDs ──────────────────────────────────────────────────────────
  const usedSet = new Set<string>();
  for (const r of results) r.used_evidence_ids.forEach(id => usedSet.add(id));
  const used_evidence_ids = [...usedSet];

  return {
    overall_summary,
    consulted_personas: results,
    top_drivers,
    top_barriers,
    key_disagreements,
    strategic_takeaway,
    confidence,
    used_evidence_ids,
    evidence_items: [],
    scenario_matched: false,
    segments_to_watch,
    suggested_follow_ups,
  };
}
