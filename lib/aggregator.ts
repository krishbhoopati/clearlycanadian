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

function extractKeyword(raw: string): string {
  // Strip "Objection: " / "Pain point: " prefixes
  let s = raw.replace(/^(Objection|Pain point):\s*/i, "");
  // Take text before " supported by:"
  const idx = s.indexOf(" supported by:");
  if (idx !== -1) s = s.slice(0, idx);
  // Strip surrounding quotes
  return s.replace(/^["']|["']$/g, "").trim();
}

function topByFrequency(keywords: string[], minCount: number, cap: number, fallbackCount: number): string[] {
  const freq = new Map<string, number>();
  for (const kw of keywords) {
    freq.set(kw, (freq.get(kw) ?? 0) + 1);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const shared = sorted.filter(([, count]) => count >= minCount).map(([kw]) => kw).slice(0, cap);
  if (shared.length > 0) return shared;
  return sorted.slice(0, fallbackCount).map(([kw]) => kw);
}

export function aggregateSimulations(results: PersonaSimulationResult[]): AskLabResponse {
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
    };
  }

  // Step 1 — top_drivers
  const allDriverKeywords = results.flatMap(r => r.drivers.map(extractKeyword));
  const top_drivers = topByFrequency(allDriverKeywords, 2, 5, 3);

  // Step 2 — top_barriers
  const allBarrierKeywords = results.flatMap(r => r.barriers.map(extractKeyword));
  const top_barriers = topByFrequency(allBarrierKeywords, 2, 5, 3);

  // Step 3 — disagreements
  const decisionGroups = new Map<string, PersonaSimulationResult[]>();
  for (const r of results) {
    if (!decisionGroups.has(r.decision)) decisionGroups.set(r.decision, []);
    decisionGroups.get(r.decision)!.push(r);
  }

  const key_disagreements: string[] = [];
  if (decisionGroups.size >= 2) {
    const entries = [...decisionGroups.entries()];
    outer: for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        for (const a of entries[i][1]) {
          for (const b of entries[j][1]) {
            if (key_disagreements.length >= 3) break outer;
            key_disagreements.push(`${a.persona_name} (${a.decision}) vs. ${b.persona_name} (${b.decision})`);
          }
        }
      }
    }
  }

  // Step 4 — overall reaction
  const positiveDecisions = new Set(["likely_try", "likely_repeat"]);
  const negativeDecisions = new Set(["likely_reject"]);
  let positiveCount = 0;
  let negativeCount = 0;
  for (const r of results) {
    if (positiveDecisions.has(r.decision)) positiveCount++;
    else if (negativeDecisions.has(r.decision)) negativeCount++;
  }
  const total = results.length;
  let reactionLabel: string;
  if (positiveCount > total / 2) reactionLabel = "Overall positive purchase intent";
  else if (negativeCount > total / 2) reactionLabel = "Overall low purchase intent";
  else reactionLabel = "Mixed signals across the panel";

  const decisionText: Record<string, string> = {
    likely_try: "is likely to try the product",
    likely_repeat: "is likely to purchase again",
    likely_reject: "is unlikely to purchase",
    mixed_interest: "shows mixed interest",
    low_awareness_high_potential: "has low awareness but high latent potential",
  };

  const personaLines = results.map(r => {
    const verb = decisionText[r.decision] ?? r.decision.replace(/_/g, " ");
    const topDriver = r.drivers[0] ? extractKeyword(r.drivers[0]) : null;
    const topBarrier = r.barriers[0] ? extractKeyword(r.barriers[0]) : null;
    let line = `${r.persona_name} ${verb}`;
    if (topDriver) line += `, motivated by ${topDriver.toLowerCase()}`;
    if (topBarrier) line += `; however, ${topBarrier.toLowerCase()} is a concern`;
    return line + ".";
  });

  let overall_summary = `${reactionLabel} across ${total} persona${total !== 1 ? "s" : ""} consulted. ${personaLines.join(" ")}`;
  if (top_drivers.length >= 2) {
    overall_summary += ` Across the panel, ${top_drivers[0].toLowerCase()} and ${top_drivers[1].toLowerCase()} emerged as the strongest shared motivators.`;
  } else if (top_drivers[0]) {
    overall_summary += ` The primary shared motivator is ${top_drivers[0].toLowerCase()}.`;
  }
  if (top_barriers.length >= 2) {
    overall_summary += ` Key barriers include ${top_barriers[0].toLowerCase()} and ${top_barriers[1].toLowerCase()}.`;
  } else if (top_barriers[0]) {
    overall_summary += ` The main barrier noted is ${top_barriers[0].toLowerCase()}.`;
  }
  if (key_disagreements.length > 0) {
    overall_summary += ` Notable split: ${key_disagreements[0]}.`;
  }

  // Step 5 — strategic takeaway
  let strategic_takeaway: string;
  if (top_drivers.length >= 2 && top_barriers.length === 0) {
    strategic_takeaway = `Strong shared interest — lean into ${top_drivers[0]} and ${top_drivers[1]} in messaging.`;
  } else if (top_drivers.length >= 1 && top_barriers.length >= 2) {
    strategic_takeaway = `Address ${top_barriers[0]} and ${top_barriers[1]} concerns before launch.`;
  } else if (key_disagreements.length >= 2) {
    strategic_takeaway = "Segment messaging — personas diverge on purchase intent.";
  } else if (top_drivers.length >= 1 && top_barriers.length === 1) {
    strategic_takeaway = `Lean into ${top_drivers[0]}; monitor ${top_barriers[0]} as a friction point.`;
  } else {
    strategic_takeaway = "Insufficient consensus — broaden evidence base or refine targeting.";
  }

  // Step 6 — confidence
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;
  const flaggedCount = results.filter(r =>
    r.validator_flags.includes("low_evidence") || r.validator_flags.includes("low_confidence")
  ).length;
  const confidence = Math.max(0.1, avgConfidence - flaggedCount * 0.05);

  // Step 7 — evidence IDs
  const usedSet = new Set<string>();
  for (const r of results) r.used_evidence_ids.forEach(id => usedSet.add(id));
  const used_evidence_ids = [...usedSet];

  // Step 8 — return
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
  };
}
