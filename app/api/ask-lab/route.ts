import { NextRequest, NextResponse } from "next/server";
import type { AskLabRequest, AskLabResponse, SimulationResponse, PersonaSimulationResult } from "@/lib/types";
import { validateQuery } from "@/lib/validator";
import { parseQuery } from "@/lib/queryParser";
import { isOutOfScope } from "@/lib/scopeGuard";
import { resolvePanel } from "@/lib/personaResolver";
import { resolveScenarioForQuery } from "@/lib/scenarioResolver";
import { retrieveForPersona, retrieveEvidence } from "@/lib/retrieval";
import { runSimulation } from "@/lib/simulationEngine";
import { validateSimulationResult } from "@/lib/validator";
import { scoreSimulation } from "@/lib/scorer";
import { aggregateSimulations } from "@/lib/aggregator";

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body = await req.json() as AskLabRequest;
    const { user_question, product_context } = body;

    const validationError = validateQuery(user_question ?? "");
    if (validationError) {
      return NextResponse.json<SimulationResponse<AskLabResponse>>({
        success: false,
        data: null,
        error: validationError,
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 400 });
    }

    const parsed = parseQuery(user_question);
    console.log("[ask-lab] parsed:", {
      market: parsed.market,
      generation: parsed.generation,
      customerType: parsed.customerType,
      topic: parsed.topic,
      confidence: parsed.confidence,
      keywords: parsed.keywords,
    });

    if (isOutOfScope(parsed)) {
      console.log("[ask-lab] OUT OF SCOPE — confidence=0, returning fallback");
      const fallback: AskLabResponse = {
        overall_summary: "This question doesn't map to any known consumer dimension (market, generation, or topic) in our dataset.",
        consulted_personas: [],
        top_drivers: [],
        top_barriers: [],
        key_disagreements: [],
        strategic_takeaway: "Try rephrasing with a market (Canada, U.S.), a generation (Gen Z, Millennials), or a topic (zero sugar, nostalgia, sustainability).",
        confidence: 0,
        used_evidence_ids: [],
        evidence_items: [],
        scenario_matched: false,
        segments_to_watch: [],
        suggested_follow_ups: [],
      };
      return NextResponse.json<SimulationResponse<AskLabResponse>>({
        success: true,
        data: fallback,
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      });
    }

    const panel = resolvePanel(parsed);
    const match = resolveScenarioForQuery(parsed);
    const scenario = match?.scenario ?? null;
    console.log("[ask-lab] panel:", panel.length, "personas; scenario:", match?.scenario.id ?? "none");

    const simulationResults: PersonaSimulationResult[] = panel.map((persona) => {
      const { relevant_behavior_facts: behaviorFacts, relevant_brand_facts: brandFacts } =
        retrieveForPersona(persona.id, scenario?.id);

      const result = {
        ...runSimulation(persona, scenario, behaviorFacts, brandFacts, product_context, user_question),
      };

      const extraFlags = validateSimulationResult(result, behaviorFacts, brandFacts);
      result.validator_flags = [...new Set([...result.validator_flags, ...extraFlags])];

      const { confidence } = scoreSimulation(result, persona, behaviorFacts, brandFacts);
      result.confidence = confidence;

      console.log("[ask-lab] persona:", persona.id, "decision:", result.decision, "confidence:", result.confidence, "flags:", result.validator_flags);

      return result;
    });

    const response = aggregateSimulations(simulationResults, scenario);

    const evidence_items = retrieveEvidence(parsed, { topN: 5 });
    console.log("[ask-lab] evidence_items:", evidence_items.length);

    return NextResponse.json<SimulationResponse<AskLabResponse>>({
      success: true,
      data: { ...response, evidence_items, scenario_matched: match !== null },
      meta: {
        processingMs: Date.now() - start,
        evidenceCount: evidence_items.length,
        version: "1.0",
      },
    });
  } catch (err) {
    return NextResponse.json<SimulationResponse<AskLabResponse>>({
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
    }, { status: 500 });
  }
}
