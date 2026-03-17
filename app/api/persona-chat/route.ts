import { NextRequest, NextResponse } from "next/server";
import type { SimulationResponse, PersonaChatResponse, Message, BehaviorFact } from "@/lib/types";
import { resolvePersona } from "@/lib/personaResolver";
import { resolveScenario } from "@/lib/scenarioResolver";
import { parseQuery } from "@/lib/queryParser";
import { retrieveEvidence } from "@/lib/retrieval";
import { runSimulation } from "@/lib/simulationEngine";
import { composePersonaResponse } from "@/lib/responseComposer";
import { getSession, createSession, appendMessage, getRecentMessages } from "@/lib/chatMemory";

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body = await req.json() as {
      message?: string;
      personaId?: string;
      scenarioId?: string;
      sessionId?: string;
    };
    const { message: content, personaId, scenarioId, sessionId: incomingSessionId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json<SimulationResponse<PersonaChatResponse>>({
        success: false,
        data: null,
        error: "Message cannot be empty.",
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 400 });
    }

    if (!personaId) {
      return NextResponse.json<SimulationResponse<PersonaChatResponse>>({
        success: false,
        data: null,
        error: "personaId is required.",
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 400 });
    }

    const persona = resolvePersona(personaId);
    if (!persona) {
      return NextResponse.json<SimulationResponse<PersonaChatResponse>>({
        success: false,
        data: null,
        error: `Persona "${personaId}" not found.`,
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 404 });
    }

    const scenario = scenarioId ? resolveScenario(scenarioId) : null;

    // Get or create session
    let session = incomingSessionId ? getSession(incomingSessionId) : null;
    if (!session) {
      session = createSession(personaId, scenarioId);
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Read history before appending to get accurate turnIndex
    const recentMessages = getRecentMessages(session.sessionId, 6);
    const turnIndex = recentMessages.filter(m => m.role === "assistant").length;

    // Retrieve evidence scoped to scenario tags if available
    const parsed = parseQuery(content);
    const tagFilter = scenario?.contextTags ?? [];
    const evidence = retrieveEvidence(parsed, { topN: 3, tagFilter });

    const behaviorFacts: BehaviorFact[] = evidence.map(e => ({
      id: e.id,
      statement: e.text,
      category: e.category,
      applies_to: [],
      market: "CA" as const,
      source: e.source ?? "unknown",
      source_type: "other" as const,
      confidence: e.relevanceScore,
      tags: e.tags,
    }));

    const result = runSimulation(persona, scenario, behaviorFacts, [], undefined, content);
    const replyText = composePersonaResponse(persona, result, content, turnIndex);

    const personaReply: Message = {
      id: `msg-${Date.now()}-persona`,
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

    appendMessage(session.sessionId, userMessage);
    appendMessage(session.sessionId, personaReply);

    return NextResponse.json<SimulationResponse<PersonaChatResponse>>({
      success: true,
      data: {
        persona_response: replyText,
        session_id: session.sessionId,
        confidence: result.confidence,
        used_evidence_ids: result.used_evidence_ids,
        validator_flags: result.validator_flags,
      },
      meta: {
        processingMs: Date.now() - start,
        evidenceCount: evidence.length,
        version: "1.0",
      },
    });
  } catch (err) {
    return NextResponse.json<SimulationResponse<PersonaChatResponse>>({
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
    }, { status: 500 });
  }
}
