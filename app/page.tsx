"use client";

import { useState } from "react";
import HomeSearch from "@/components/HomeSearch";
import PersonaChatModal from "@/components/PersonaChatModal";
import type { AskLabResponse, ConversationTurn } from "@/lib/types";

export default function HomePage() {
  const [view, setView] = useState<"home" | "results">("home");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);
  const [panelIds, setPanelIds] = useState<string[] | null>(null);

  async function handleQuery(q: string) {
    setLoading(true);
    if (view !== "results") setView("results");
    try {
      const body: Record<string, unknown> = { user_question: q };
      if (panelIds) body.persona_ids = panelIds;
      const [res] = await Promise.all([
        fetch("/api/ask-lab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        new Promise(resolve => setTimeout(resolve, panelIds ? 0 : 5000)),
      ]);
      const data = await (res as Response).json();
      const result: AskLabResponse = data.data ?? data;
      if (!panelIds && result.consulted_personas?.length) {
        setPanelIds(result.consulted_personas.map(p => p.persona_id));
      }
      setTurns(prev => [...prev, { question: q, result, timestamp: Date.now() }]);
    } catch {
      // silently fail — keep existing turns
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setView("home");
    setTurns([]);
    setPanelIds(null);
  }

  return (
    <>
      <HomeSearch
        onQuery={handleQuery}
        loading={loading}
        onPersonaClick={setChatPersonaId}
        view={view}
        turns={turns}
        onFollowUp={handleQuery}
        onBack={handleBack}
      />
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
