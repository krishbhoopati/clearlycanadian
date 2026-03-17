import type { Persona, Scenario, Evidence, ChatTurn, Message } from "./types";
import { composePersonaReply } from "./responseComposer";

let msgCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++msgCounter}`;
}

export function simulate(
  persona: Persona,
  scenario: Scenario | null,
  userMessage: Message,
  evidence: Evidence[],
  sessionId: string
): ChatTurn {
  const replyText = composePersonaReply(persona, userMessage.content, evidence);

  const personaReply: Message = {
    id: nextId(),
    role: "assistant",
    content: replyText,
    timestamp: Date.now(),
    metadata: {
      personaId: persona.id,
      scenarioId: scenario?.id,
      evidenceIds: evidence.map((e) => e.id),
      confidence: evidence.length > 0 ? Math.min(0.5 + evidence.length * 0.1, 1) : 0.2,
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
