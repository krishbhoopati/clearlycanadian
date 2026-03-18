"use client";

import { useState } from "react";
import HomeSearch from "@/components/HomeSearch";
import ResultsView from "@/components/ResultsView";
import PersonaChatModal from "@/components/PersonaChatModal";
import type { AskLabResponse } from "@/lib/types";

interface ConversationTurn {
  question: string;
  result: AskLabResponse;
}

export default function HomePage() {
  const [view, setView] = useState<"home" | "results">("home");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);

  async function handleQuery(q: string) {
    setLoading(true);
    if (view !== "results") setView("results");
    try {
      const res = await fetch("/api/ask-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_question: q }),
      });
      const data = await res.json();
      const result: AskLabResponse = data.data ?? data;
      setTurns(prev => [...prev, { question: q, result }]);
    } catch {
      // silently fail — keep existing turns
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {view === "home" && (
        <HomeSearch onQuery={handleQuery} loading={loading} onPersonaClick={setChatPersonaId} />
      )}
      {view === "results" && (
        <ResultsView
          turns={turns}
          loading={loading}
          onFollowUp={handleQuery}
          onPersonaClick={setChatPersonaId}
        />
      )}
      {chatPersonaId && (
        <PersonaChatModal
          personaId={chatPersonaId}
          onClose={() => setChatPersonaId(null)}
        />
      )}
      {/* Fixed bottom-left branding */}
      <div className="fixed bottom-4 left-6 pointer-events-none select-none">
        <span className="font-bold uppercase text-white tracking-wide text-xl">Clearly Voices.</span>
      </div>
    </>
  );
}
