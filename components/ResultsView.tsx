"use client";

import { useState, useEffect, useRef } from "react";

function formatTurnTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return isToday
    ? `Today, ${time}`
    : `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}
import PersonaCard from "@/components/PersonaCard";
import AnalysisSidebar from "@/components/AnalysisSidebar";
import PersonaAvatar from "@/components/PersonaAvatar";
import type { Persona, ConversationTurn, AIStreamState, AnalysisResult } from "@/lib/types";

interface ResultsPanelProps {
  turns: ConversationTurn[];
  loading: boolean;
  onFollowUp: (q: string) => void;
  onPersonaClick?: (personaId: string) => void;
  onBack: () => void;
  personas: Persona[];
  aiStream?: AIStreamState | null;
  lastAiAnalysis?: AnalysisResult | null;
}

function ConversationTurnBlock({
  turn,
  personas,
  onPersonaClick,
  followUps,
  onFollowUp,
  loading,
}: {
  turn: ConversationTurn;
  personas: Persona[];
  onPersonaClick: (id: string) => void;
  followUps?: string[];
  onFollowUp?: (q: string) => void;
  loading?: boolean;
}) {
  const personaMap = Object.fromEntries(personas.map(p => [p.id, p]));

  return (
    <div className="flex flex-col gap-6">
      {/* Timestamp separator */}
      <div className="flex justify-center">
        <span className="font-mono text-white/30 text-xs uppercase tracking-widest">
          {formatTurnTime(turn.timestamp)}
        </span>
      </div>

      {/* User bubble */}
      <div className="flex justify-end items-end gap-3">
        <div className="glass-dark text-white p-6 rounded-[24px] rounded-tr-[8px] max-w-[70%]">
          <p className="text-white/90">{turn.question}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-xs font-bold text-white">
          ME
        </div>
      </div>

      {/* Engine response */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#2a3441]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">Clearly Voices Insight Engine</span>
            <span className="font-mono text-white/40 text-xs">
              {Math.round(turn.result.confidence * 100)}% confidence
            </span>
          </div>
        </div>

        <p className="text-white/90 text-[1.1rem] leading-relaxed pl-[56px]">
          {turn.result.overall_summary}
        </p>

        <div className="flex items-center gap-3 pl-[56px]">
          <span className="font-mono text-white/40 text-xs uppercase tracking-widest">Overall Confidence</span>
          <span className="font-mono text-white font-bold text-sm">{Math.round(turn.result.confidence * 100)}/100</span>
        </div>

        {turn.result.consulted_personas.length > 0 && (
          <div className="grid grid-cols-3 gap-6 pl-[56px]">
            {turn.result.consulted_personas.map(p => (
              <PersonaCard
                key={p.persona_id}
                result={p}
                persona={personaMap[p.persona_id]}
                onChatClick={() => onPersonaClick(p.persona_id)}
              />
            ))}
          </div>
        )}

        {followUps && followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-[56px]">
            {followUps.map((fu, i) => (
              <button
                key={i}
                onClick={() => onFollowUp?.(fu)}
                disabled={loading}
                className="glass-input rounded-full px-5 py-2 text-sm text-white cursor-pointer hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {fu}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StreamingTurnBlock({
  stream,
  personas,
  onPersonaClick,
}: {
  stream: AIStreamState;
  personas: Persona[];
  onPersonaClick: (id: string) => void;
}) {
  const personaMap = Object.fromEntries(personas.map(p => [p.id, p]));

  return (
    <div className="flex flex-col gap-6">
      {/* Timestamp */}
      <div className="flex justify-center">
        <span className="font-mono text-white/30 text-xs uppercase tracking-widest">
          {formatTurnTime(stream.timestamp)}
        </span>
      </div>

      {/* User bubble */}
      <div className="flex justify-end items-end gap-3">
        <div className="glass-dark text-white p-6 rounded-[24px] rounded-tr-[8px] max-w-[70%]">
          <p className="text-white/90">{stream.question}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-xs font-bold text-white">
          ME
        </div>
      </div>

      {/* AI response header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#2a3441]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">Clearly Voices Insight Engine</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-400/30">
              AI Live
            </span>
            <span className="font-mono text-white/40 text-xs flex items-center gap-2">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {stream.completedPersonaIds.length}/{stream.selectedPersonaIds.length} personas complete
            </span>
          </div>
        </div>

        {/* Streaming persona cards */}
        {stream.selectedPersonaIds.length > 0 && (
          <div className="grid grid-cols-3 gap-6 pl-[56px]">
            {stream.selectedPersonaIds.map(id => {
              const persona = personaMap[id];
              const text = stream.personaTexts[id] ?? "";
              const isComplete = stream.completedPersonaIds.includes(id);

              return (
                <PersonaCard
                  key={id}
                  persona={persona}
                  onChatClick={() => onPersonaClick(id)}
                  streamingText={text}
                  isStreaming={!isComplete}
                />
              );
            })}
          </div>
        )}

        {/* Waiting for personas indicator */}
        {stream.selectedPersonaIds.length === 0 && (
          <div className="flex items-center gap-4 pl-[56px]">
            <svg className="w-5 h-5 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-white/50 font-mono text-sm">Selecting personas and fetching data…</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsView({
  turns,
  loading,
  onFollowUp,
  onPersonaClick,
  onBack,
  personas,
  aiStream,
  lastAiAnalysis,
}: ResultsPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevTurnsLen = useRef(0);
  const prevStreamLen = useRef(0);

  useEffect(() => {
    if (!scrollRef.current) return;
    const isFirstResult = turns.length === 1 && prevTurnsLen.current === 0;
    const streamPersonaCount = aiStream?.selectedPersonaIds.length ?? 0;
    const streamGrew = streamPersonaCount > prevStreamLen.current;

    if (isFirstResult) {
      scrollRef.current.scrollTop = 0;
    } else if (turns.length > 1 || loading || streamGrew) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevTurnsLen.current = turns.length;
    prevStreamLen.current = streamPersonaCount;
  }, [turns, loading, aiStream]);

  function handleSubmit() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    onFollowUp(q);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  const lastResult = turns[turns.length - 1]?.result;
  const consultedPersonas = lastResult?.consulted_personas ?? [];
  const followUps = lastResult?.suggested_follow_ups?.slice(0, 3) ?? [];
  const personaMap = Object.fromEntries(personas.map(p => [p.id, p]));

  const showAiStreamHeader = !!aiStream && aiStream.selectedPersonaIds.length > 0;
  const streamingPersonaAvatars = showAiStreamHeader
    ? aiStream!.selectedPersonaIds.map(id => ({
        id,
        name: personaMap[id]?.name ?? id,
        avatarUrl: personaMap[id]?.avatar_url,
      }))
    : [];

  return (
    <div className="h-full flex flex-col">
      {/* Top strip */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Question
        </button>
        <div className="flex items-center gap-4">
          {/* Show streaming persona avatars during AI, else completed persona avatars */}
          {showAiStreamHeader ? (
            <div className="flex -space-x-2">
              {streamingPersonaAvatars.map(p => (
                <PersonaAvatar
                  key={p.id}
                  name={p.name}
                  avatarUrl={p.avatarUrl}
                  size="w-8 h-8"
                  textSize="text-xs"
                  className="border-2 border-white/10"
                />
              ))}
            </div>
          ) : consultedPersonas.length > 0 ? (
            <div className="flex -space-x-2">
              {consultedPersonas.map(p => (
                <PersonaAvatar
                  key={p.persona_id}
                  name={p.persona_name}
                  avatarUrl={personaMap[p.persona_id]?.avatar_url}
                  size="w-8 h-8"
                  textSize="text-xs"
                  className="border-2 border-white/10"
                />
              ))}
            </div>
          ) : null}

          {loading && (
            <span className="font-mono text-white/50 text-xs uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {aiStream ? "AI Analysing" : "Analysing"}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main scroll area */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          {turns.length === 0 && loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="w-10 h-10 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-white/50 font-mono text-sm">Consulting your consumer panel…</span>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-10 py-10 dark-scroll pb-28 flex flex-col gap-12"
            >
              {/* Completed turns */}
              {turns.map((turn, i) => (
                <ConversationTurnBlock
                  key={i}
                  turn={turn}
                  personas={personas}
                  onPersonaClick={onPersonaClick ?? (() => {})}
                  followUps={i === turns.length - 1 && !aiStream ? followUps : undefined}
                  onFollowUp={onFollowUp}
                  loading={loading}
                />
              ))}

              {/* Loading indicator */}
              {loading && turns.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white/50 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <span className="text-white/50 font-mono text-sm">Analysing…</span>
                </div>
              )}
            </div>
          )}

          {/* Fixed bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-10 pb-8 pt-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
            <div className="glass-input rounded-full p-2 pl-6 flex items-center gap-3 transition-all">
              <input
                className="bg-transparent text-white placeholder:text-white/40 flex-1 outline-none text-sm"
                placeholder="Ask a follow-up question…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-white/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="#2a3441" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        {(lastResult || lastAiAnalysis) && !aiStream && (
          <AnalysisSidebar
            result={lastAiAnalysis ? undefined : lastResult}
            aiAnalysis={lastAiAnalysis}
            onFollowUpClick={onFollowUp}
          />
        )}
      </div>
    </div>
  );
}
