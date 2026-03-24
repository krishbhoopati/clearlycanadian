"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import PersonaChatModal from "@/components/PersonaChatModal";
import type {
  AskLabResponse,
  ConversationTurn,
  Persona,
  PersonaSimulationResult,
  AnalysisResult,
  AIStreamState,
} from "@/lib/types";

function mapAiDecision(
  decision: string
): PersonaSimulationResult["decision"] {
  const map: Record<string, PersonaSimulationResult["decision"]> = {
    would_buy: "immediate_yes",
    would_try: "likely_try",
    interested_but_barriers: "interested_but_barriers",
    indifferent: "indifferent",
    unlikely: "unlikely_without_push",
    would_not_buy: "hard_no",
  };
  return map[decision] ?? "indifferent";
}

function aiToTurn(
  stream: AIStreamState,
  analysis: AnalysisResult,
  personas: Persona[]
): ConversationTurn {
  const consulted: PersonaSimulationResult[] =
    stream.selectedPersonaIds.map((id) => {
      const persona = personas.find((p) => p.id === id);
      const score = analysis.per_persona_scores.find(
        (s) => s.persona_name === persona?.name
      );
      return {
        persona_id: id,
        persona_name: persona?.name ?? id,
        decision: mapAiDecision(score?.decision ?? "indifferent"),
        drivers: [score?.key_driver ?? ""],
        barriers: [score?.key_blocker ?? ""],
        inferred_beliefs: [],
        confidence: (score?.resonance ?? 50) / 100,
        used_evidence_ids: [],
        response_text: stream.personaTexts[id] ?? "",
        validator_flags: [],
      };
    });

  return {
    question: stream.question,
    result: {
      overall_summary: analysis.key_insight,
      consulted_personas: consulted,
      top_drivers: analysis.dominant_themes.map((t) => t.theme),
      top_barriers: analysis.risk_factors,
      key_disagreements: [],
      strategic_takeaway:
        analysis.strategic_recommendations[0]?.action ?? "",
      confidence: analysis.net_resonance / 100,
      used_evidence_ids: [],
      evidence_items: [],
      scenario_matched: false,
      segments_to_watch: analysis.risk_factors.slice(0, 2),
      suggested_follow_ups: analysis.follow_up_questions,
    },
    timestamp: stream.timestamp,
  };
}

export default function HomePage() {
  const [view, setView] = useState<"home" | "results">("home");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);
  const [panelIds, setPanelIds] = useState<string[] | null>(null);
  const [aiStream, setAiStream] = useState<AIStreamState | null>(null);
  const [lastAiAnalysis, setLastAiAnalysis] = useState<AnalysisResult | null>(
    null
  );
  const personasRef = useRef<Persona[]>([]);
  // Always holds the latest aiStream value so callbacks can read it without
  // stale-closure issues and without nesting setState calls inside updaters.
  const aiStreamRef = useRef<AIStreamState | null>(null);

  const handlePersonasLoaded = useCallback((p: Persona[]) => {
    personasRef.current = p;
  }, []);

  async function handleQuery(q: string) {
    setLoading(true);
    setLastAiAnalysis(null);
    if (view !== "results") setView("results");

    let usePuter = false;
    try {
      const { isPuterAvailable } = await import("@/lib/puterAI");
      usePuter = isPuterAvailable();
    } catch {
      usePuter = false;
    }

    if (usePuter) {
      const streamState: AIStreamState = {
        question: q,
        personaTexts: {},
        completedPersonaIds: [],
        selectedPersonaIds: [],
        timestamp: Date.now(),
      };
      aiStreamRef.current = streamState;
      setAiStream(streamState);

      try {
        const { runSimulation } = await import("@/lib/aiSimulationEngine");
        await runSimulation(
          q,
          // onPersonaChunk — streaming text arrives
          (personaId, chunk) => {
            setAiStream((prev) => {
              if (!prev) return prev;
              const ids = prev.selectedPersonaIds.includes(personaId)
                ? prev.selectedPersonaIds
                : [...prev.selectedPersonaIds, personaId];
              const next = {
                ...prev,
                selectedPersonaIds: ids,
                personaTexts: {
                  ...prev.personaTexts,
                  [personaId]: (prev.personaTexts[personaId] ?? "") + chunk,
                },
              };
              aiStreamRef.current = next;
              return next;
            });
          },
          // onPersonaComplete — full response ready
          (personaId, fullResponse) => {
            setAiStream((prev) => {
              if (!prev) return prev;
              // Also add to selectedPersonaIds in case onPersonaChunk was never
              // called (fallback path skips streaming and calls this directly).
              const selectedIds = prev.selectedPersonaIds.includes(personaId)
                ? prev.selectedPersonaIds
                : [...prev.selectedPersonaIds, personaId];
              const completedIds = prev.completedPersonaIds.includes(personaId)
                ? prev.completedPersonaIds
                : [...prev.completedPersonaIds, personaId];
              const next = {
                ...prev,
                selectedPersonaIds: selectedIds,
                completedPersonaIds: completedIds,
                personaTexts: {
                  ...prev.personaTexts,
                  [personaId]: fullResponse,
                },
              };
              aiStreamRef.current = next;
              return next;
            });
          },
          // onAnalysisComplete — build the turn using the ref (never inside an updater)
          (analysis) => {
            const currentStream = aiStreamRef.current;
            setLastAiAnalysis(analysis);
            if (currentStream) {
              const turn = aiToTurn(currentStream, analysis, personasRef.current);
              setTurns((t) => [...t, turn]);
              setPanelIds((prev) => prev ?? currentStream.selectedPersonaIds);
            }
            aiStreamRef.current = null;
            setAiStream(null);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("[page] AI simulation failed, falling back to API:", err);
        setAiStream(null);
        await handleApiQuery(q);
      }
    } else {
      await handleApiQuery(q);
    }
  }

  async function handleApiQuery(q: string) {
    try {
      const body: Record<string, unknown> = { user_question: q };
      if (panelIds) body.persona_ids = panelIds;
      const [res] = await Promise.all([
        fetch("/api/ask-lab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        new Promise((resolve) => setTimeout(resolve, panelIds ? 0 : 5000)),
      ]);
      const data = await (res as Response).json();
      const result: AskLabResponse = data.data ?? data;
      if (!panelIds && result.consulted_personas?.length) {
        setPanelIds(result.consulted_personas.map((p) => p.persona_id));
      }
      setTurns((prev) => [
        ...prev,
        { question: q, result, timestamp: Date.now() },
      ]);
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
    setAiStream(null);
    setLastAiAnalysis(null);
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
        aiStream={aiStream}
        lastAiAnalysis={lastAiAnalysis}
        onPersonasLoaded={handlePersonasLoaded}
      />
      {chatPersonaId && (
        <PersonaChatModal
          personaId={chatPersonaId}
          onClose={() => setChatPersonaId(null)}
        />
      )}
      {/* Fixed bottom-left branding */}
      <div className="fixed bottom-4 left-6 pointer-events-none select-none">
        <span className="font-bold uppercase text-white tracking-wide text-xl">
          Clearly Voices.
        </span>
      </div>

      {/* Swarm Simulation entry point */}
      <div className="fixed top-4 right-6 z-40">
        <Link
          href="/simulation"
          className="flex items-center gap-2 glass-dark px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Swarm Simulation
        </Link>
      </div>
    </>
  );
}
