"use client";

import { useState, useEffect, useRef } from "react";
import PersonaAvatar from "@/components/PersonaAvatar";
import type { Persona, PersonaChatResponse } from "@/lib/types";

interface PersonaChatModalProps {
  personaId: string;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "persona";
  text: string;
}

export default function PersonaChatModal({ personaId, onClose }: PersonaChatModalProps) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/personas")
      .then(r => r.json())
      .then(data => {
        const found = (data.personas ?? []).find((p: Persona) => p.id === personaId);
        setPersona(found ?? null);
      })
      .catch(() => {});
  }, [personaId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_id: personaId, message: text, session_id: sessionId }),
      });
      const data: { data?: PersonaChatResponse; error?: string } = await res.json();
      if (data.data) {
        setSessionId(data.data.session_id);
        setMessages(prev => [...prev, { role: "persona", text: data.data!.persona_response }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "persona", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[480px] h-full bg-[#e8eff5] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <PersonaAvatar name={persona?.name ?? "?"} avatarUrl={persona?.avatar_url} size="w-16 h-16" textSize="text-base" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {persona?.name ?? "Loading…"}
            </div>
            {persona && (
              <div className="text-gray-500 text-xs truncate">{persona.behavioral_segment}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto light-scroll px-6 py-4 flex flex-col gap-4"
        >
          {messages.length === 0 && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm text-center">
                Start a conversation with {persona?.name ?? "this persona"}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "user" ? (
                <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div className="flex items-end gap-2 justify-start">
                  <PersonaAvatar name={persona?.name ?? "?"} avatarUrl={persona?.avatar_url} size="w-8 h-8" textSize="text-xs" />
                  <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-[80%] flex flex-col gap-1">
                    <div className="text-xs text-gray-400 font-semibold">{persona?.name}</div>
                    <p className="text-gray-700 text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-200 p-4 flex gap-3 bg-white/50">
          <input
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 text-sm text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            placeholder={`Message ${persona?.name ?? "persona"}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
