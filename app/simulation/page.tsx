"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SimulationStepper from "@/components/simulation/SimulationStepper";
import Stage2AgentGrid from "@/components/simulation/Stage2AgentGrid";
import Stage3SimConfig from "@/components/simulation/Stage3SimConfig";
import Stage6DeepInteraction from "@/components/simulation/Stage6DeepInteraction";
import type { SimStage } from "@/lib/types";

// D3 / heavy components loaded client-only
const PersistentGraphPanel = dynamic(
  () => import("@/components/simulation/PersistentGraphPanel"),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse" /> }
);
const Stage1KnowledgeGraph = dynamic(
  () => import("@/components/simulation/Stage1KnowledgeGraph"),
  { ssr: false, loading: () => <div className="h-96 glass-dark rounded-xl animate-pulse" /> }
);
const Stage4SocialFeed = dynamic(
  () => import("@/components/simulation/Stage4SocialFeed"),
  { ssr: false, loading: () => <div className="h-96 glass-dark rounded-xl animate-pulse" /> }
);
const Stage5ReportPanel = dynamic(
  () => import("@/components/simulation/Stage5ReportPanel"),
  { ssr: false, loading: () => <div className="h-96 glass-dark rounded-xl animate-pulse" /> }
);

// PersonaChatModal loaded lazily
const PersonaChatModal = dynamic(
  () => import("@/components/PersonaChatModal"),
  { ssr: false }
);

const STAGE_LABELS: Record<SimStage, string> = {
  1: "Seed Document & Knowledge Graph",
  2: "Agent Generation",
  3: "Simulation Configuration",
  4: "Social Simulation",
  5: "Report Generation",
  6: "Deep Interaction",
};

export default function SimulationPage() {
  const [stage, setStage] = useState<SimStage>(1);
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);
  const [graphVisible, setGraphVisible] = useState(true);
  const [graphBuildStarted, setGraphBuildStarted] = useState(false);

  const advanceStage = useCallback(() => {
    setStage((s) => (Math.min(s + 1, 6) as SimStage));
  }, []);

  // When Stage 1 begins analysis, signal PersistentGraphPanel to start building
  const handleStage1Complete = useCallback(() => {
    setGraphBuildStarted(true);
    advanceStage();
  }, [advanceStage]);

  // Stage 1 wraps the graph start in a callback so we know when "Begin Analysis" is clicked
  // We pass a proxy onComplete that marks graphBuildStarted first
  const handleBeginAnalysis = useCallback(() => {
    setGraphBuildStarted(true);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#2a3441]">
      {/* Fixed header */}
      <div className="flex-shrink-0 z-20 bg-[#2a3441]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 sm:px-5 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors duration-200 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Clearly Voices</span>
          </Link>

          <div className="flex-1 max-w-2xl">
            <SimulationStepper
              currentStage={stage}
              onStageClick={(s) => {
                if (s < stage) setStage(s as SimStage);
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {!graphVisible && (
              <button
                onClick={() => setGraphVisible(true)}
                className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1 border border-white/10 hover:border-white/25 px-2.5 py-1.5 rounded-lg transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Show Graph
              </button>
            )}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/40 text-xs hidden sm:inline">Swarm Simulation</span>
          </div>
        </div>
      </div>

      {/* Main split-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Persistent Graph Panel */}
        {graphVisible && (
          <div
            className="flex-shrink-0 border-r border-white/5 flex flex-col h-full transition-all duration-300"
            style={{ width: stage === 1 ? "60%" : "65%" }}
          >
            <PersistentGraphPanel
              visible={graphVisible}
              onToggle={() => setGraphVisible(false)}
              buildStarted={graphBuildStarted}
            />
          </div>
        )}

        {/* Right: Stage Content */}
        <div className="flex-1 overflow-y-auto dark-scroll">
          <div className="px-4 py-4">
            {/* Stage label + skip */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-white/30 text-[10px] font-mono uppercase tracking-widest">
                  Stage {stage} of 6
                </div>
                <h2 className="text-white font-bold text-base leading-tight">{STAGE_LABELS[stage]}</h2>
              </div>
              {stage < 6 && (
                <button
                  onClick={advanceStage}
                  className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors duration-200 flex-shrink-0 ml-2"
                >
                  Skip
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Stage content */}
            {stage === 1 && (
              <Stage1KnowledgeGraph
                onComplete={handleStage1Complete}
                onBeginAnalysis={handleBeginAnalysis}
              />
            )}
            {stage === 2 && (
              <Stage2AgentGrid
                onComplete={advanceStage}
                onAgentClick={setChatPersonaId}
              />
            )}
            {stage === 3 && (
              <Stage3SimConfig onComplete={advanceStage} />
            )}
            {stage === 4 && (
              <Stage4SocialFeed onComplete={advanceStage} />
            )}
            {stage === 5 && (
              <Stage5ReportPanel onComplete={advanceStage} />
            )}
            {stage === 6 && (
              <Stage6DeepInteraction onPersonaChat={setChatPersonaId} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="fixed bottom-4 left-6 pointer-events-none select-none z-10">
        <span className="font-bold uppercase text-white/30 tracking-wide text-xs">
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
