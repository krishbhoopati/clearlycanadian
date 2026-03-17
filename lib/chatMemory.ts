import type { ChatSession, Message } from "./types";

// In-memory store — resets on server restart (sufficient for local dev)
const sessions = new Map<string, ChatSession>();

export function getSession(sessionId: string): ChatSession | null {
  return sessions.get(sessionId) ?? null;
}

export function upsertSession(session: ChatSession): void {
  sessions.set(session.sessionId, { ...session, updatedAt: Date.now() });
}

export function appendMessage(sessionId: string, message: Message): void {
  const existing = sessions.get(sessionId);
  if (!existing) return;
  existing.messages.push(message);
  existing.updatedAt = Date.now();
  sessions.set(sessionId, existing);
}

export function createSession(personaId: string, scenarioId?: string): ChatSession {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const session: ChatSession = {
    sessionId,
    personaId,
    scenarioId,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}
