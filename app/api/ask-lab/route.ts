import { NextRequest, NextResponse } from "next/server";
import type { SimulationResponse, QueryResult } from "@/lib/types";
import { parseQuery } from "@/lib/queryParser";
import { retrieveEvidence } from "@/lib/retrieval";
import { aggregate } from "@/lib/aggregator";
import { score } from "@/lib/scorer";
import { composeSummary } from "@/lib/responseComposer";
import { validateQuery } from "@/lib/validator";

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body = await req.json() as { query?: string; personaId?: string; scenarioId?: string };
    const { query: rawQuery, personaId, scenarioId } = body;

    const validationError = validateQuery(rawQuery ?? "");
    if (validationError) {
      return NextResponse.json<SimulationResponse<QueryResult>>({
        success: false,
        data: null,
        error: validationError,
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 400 });
    }

    const parsed = parseQuery(rawQuery!);
    const evidence = retrieveEvidence(parsed, { topN: 5 });
    const aggregated = aggregate(evidence, parsed);
    const scoringResult = score(aggregated.topEvidence, parsed);
    const summary = composeSummary(parsed, aggregated.topEvidence);

    const result: QueryResult = {
      query: rawQuery!,
      parsedIntent: parsed.intent,
      evidence: aggregated.topEvidence,
      summary,
      score: scoringResult.overallScore,
      scenarioId,
      personaId,
    };

    return NextResponse.json<SimulationResponse<QueryResult>>({
      success: true,
      data: result,
      meta: {
        processingMs: Date.now() - start,
        evidenceCount: aggregated.totalCount,
        version: "1.0",
      },
    });
  } catch (err) {
    return NextResponse.json<SimulationResponse<QueryResult>>({
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
    }, { status: 500 });
  }
}
