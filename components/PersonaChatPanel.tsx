"use client";

import { useState, useRef, useEffect } from "react";
import type { SimulationResponse, PersonaChatResponse } from "@/lib/types";
import PersonaSelector from "./PersonaSelector";
import ScenarioSelector from "./ScenarioSelector";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  personaName?: string;
}

export default function PersonaChatPanel() {
  const [personaId, setPersonaId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset session when persona or scenario changes
  function handlePersonaChange(id: string) {
    setPersonaId(id);
    setSessionId(null);
    setMessages([]);
    setError(null);
  }

  function handleScenarioChange(id: string) {
    setScenarioId(id);
    setSessionId(null);
    setMessages([]);
    setError(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !personaId) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    try {
      const res = await fetch("/api/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          personaId,
          scenarioId: scenarioId || undefined,
          sessionId: sessionId ?? undefined,
        }),
      });
      const data = await res.json() as SimulationResponse<PersonaChatResponse>;

      if (data.success && data.data) {
        const result = data.data;
        if (!sessionId) setSessionId(result.session_id);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.persona_response,
            personaName: personaId,
          },
        ]);
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">
        Chat with a simulated Canadian consumer persona. Select a persona and an optional scenario to focus the conversation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <PersonaSelector value={personaId} onChange={handlePersonaChange} />
        <ScenarioSelector value={scenarioId} onChange={handleScenarioChange} />
      </div>

      {!personaId && (
        <p className="text-sm text-gray-400 italic">Select a persona to start chatting.</p>
      )}

      {personaId && (
        <>
          <div className="border border-gray-200 rounded-lg bg-white min-h-48 max-h-96 overflow-y-auto p-4 space-y-3 mb-4">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                Conversation will appear here. Say hello!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm text-sm rounded-xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" && msg.personaName && (
                    <p className="text-xs font-semibold text-gray-500 mb-1">{msg.personaName}</p>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 text-sm rounded-xl px-4 py-2 rounded-bl-none">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
