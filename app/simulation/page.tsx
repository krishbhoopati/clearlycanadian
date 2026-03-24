"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SimulationStepper from "@/components/simulation/SimulationStepper";
import Stage2AgentGrid from "@/components/simulation/Stage2AgentGrid";
import Stage4ReportPanel from "@/components/simulation/Stage4ReportPanel";
import Stage5DeepInteraction from "@/components/simulation/Stage5DeepInteraction";
import type { SimStage } from "@/lib/types";

// D3 stages loaded client-only
const Stage1KnowledgeGraph = dynamic(
  () => import("@/components/simulation/Stage1KnowledgeGraph"),
  { ssr: false, loading: () => <div className="h-96 glass-dark rounded-xl animate-pulse" /> }
);
const Stage3SocialFeed = dynamic(
  () => import("@/components/simulation/Stage3SocialFeed"),
  { ssr: false, loading: () => <div className="h-96 glass-dark rounded-xl animate-pulse" /> }
);

// PersonaChatModal loaded lazily
const PersonaChatModal = dynamic(
  () => import("@/components/PersonaChatModal"),
  { ssr: false }
);

export default function SimulationPage() {
  const [stage, setStage] = useState<SimStage>(1);
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);

  const advanceStage = useCallback(() => {
    setStage((s) => (Math.min(s + 1, 5) as SimStage));
  }, []);

  return (
    <div className="min-h-screen bg-[#2a3441]">
      {/* Fixed header */}
      <div className="sticky top-0 z-20 bg-[#2a3441]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors duration-200 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Clearly Voices</span>
          </Link>

          <div className="flex-1 max-w-xl">
            <SimulationStepper
              currentStage={stage}
              onStageClick={(s) => {
                if (s < stage) setStage(s as SimStage);
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/40 text-xs hidden sm:inline">Swarm Simulation</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stage label */}
        <div className="mb-6">
          <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1">
            Stage {stage} of 5
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-xl">
              {stage === 1 && "Seed Document & Knowledge Graph"}
              {stage === 2 && "Agent Generation"}
              {stage === 3 && "Social Simulation"}
              {stage === 4 && "Report Generation"}
              {stage === 5 && "Deep Interaction"}
            </h2>
            {stage < 5 && (
              <button
                onClick={advanceStage}
                className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors duration-200"
              >
                Skip
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stage content */}
        {stage === 1 && (
          <Stage1KnowledgeGraph onComplete={advanceStage} />
        )}
        {stage === 2 && (
          <Stage2AgentGrid
            onComplete={advanceStage}
            onAgentClick={setChatPersonaId}
          />
        )}
        {stage === 3 && (
          <Stage3SocialFeed onComplete={advanceStage} />
        )}
        {stage === 4 && (
          <Stage4ReportPanel onComplete={advanceStage} />
        )}
        {stage === 5 && (
          <Stage5DeepInteraction onPersonaChat={setChatPersonaId} />
        )}
      </div>

      {/* Bottom branding */}
      <div className="fixed bottom-4 left-6 pointer-events-none select-none">
        <span className="font-bold uppercase text-white/40 tracking-wide text-sm">
          Swarm Simulation
        </span>
      </div>

      {/* Persona chat modal */}
      {chatPersonaId && (
        <PersonaChatModal
          personaId={chatPersonaId}
          onClose={() => setChatPersonaId(null)}
        />
      )}
    </div>
  );
}
