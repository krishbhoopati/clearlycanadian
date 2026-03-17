import { NextRequest, NextResponse } from "next/server";
import type { SimulationResponse, ChatTurn, Message } from "@/lib/types";
import { resolvePersona } from "@/lib/personaResolver";
import { resolveScenario } from "@/lib/scenarioResolver";
import { parseQuery } from "@/lib/queryParser";
import { retrieveEvidence } from "@/lib/retrieval";
import { simulate } from "@/lib/simulationEngine";
import { getSession, createSession, appendMessage } from "@/lib/chatMemory";

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
      return NextResponse.json<SimulationResponse<ChatTurn>>({
        success: false,
        data: null,
        error: "Message cannot be empty.",
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 400 });
    }

    if (!personaId) {
      return NextResponse.json<SimulationResponse<ChatTurn>>({
        success: false,
        data: null,
        error: "personaId is required.",
        meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
      }, { status: 400 });
    }

    const persona = resolvePersona(personaId);
    if (!persona) {
      return NextResponse.json<SimulationResponse<ChatTurn>>({
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
    appendMessage(session.sessionId, userMessage);

    // Retrieve evidence scoped to scenario tags if available
    const parsed = parseQuery(content);
    const tagFilter = scenario?.contextTags ?? [];
    const evidence = retrieveEvidence(parsed, { topN: 3, tagFilter });

    const turn = simulate(persona, scenario, userMessage, evidence, session.sessionId);
    appendMessage(session.sessionId, turn.personaReply);

    return NextResponse.json<SimulationResponse<ChatTurn>>({
      success: true,
      data: turn,
      meta: {
        processingMs: Date.now() - start,
        evidenceCount: evidence.length,
        version: "1.0",
      },
    });
  } catch (err) {
    return NextResponse.json<SimulationResponse<ChatTurn>>({
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      meta: { processingMs: Date.now() - start, evidenceCount: 0, version: "1.0" },
    }, { status: 500 });
  }
}
