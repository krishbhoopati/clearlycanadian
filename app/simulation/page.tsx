"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Stage2AgentGrid from "@/components/simulation/Stage2AgentGrid";
import Stage3SimConfig from "@/components/simulation/Stage3SimConfig";
import Stage6DeepInteraction from "@/components/simulation/Stage6DeepInteraction";
import type { SimStage, GraphNode, GraphLink } from "@/lib/types";

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
  2: "Environment",
  3: "Social Simulation",
  4: "Report Generation",
  5: "Deep Interaction",
};

export default function SimulationPage() {
  const [stage, setStage] = useState<SimStage>(1);
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);
  const [graphVisible, setGraphVisible] = useState(true);
  const [agentsDone, setAgentsDone] = useState(false);
  const [graphBuildStarted, setGraphBuildStarted] = useState(false);
  const [discoveredNodes, setDiscoveredNodes] = useState<GraphNode[]>([]);
  const [discoveredLinks, setDiscoveredLinks] = useState<GraphLink[]>([]);

  const advanceStage = useCallback(() => {
    setStage((s) => {
      const next = Math.min(s + 1, 5) as SimStage;
      if (s === 2) setAgentsDone(false);
      return next;
    });
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

  const handleGraphEvent = useCallback((nodes: GraphNode[], links: GraphLink[]) => {
    setDiscoveredNodes((prev) => [...prev, ...nodes]);
    setDiscoveredLinks((prev) => [...prev, ...links]);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#2a3441]">
      {/* Main split-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Persistent Graph Panel */}
        {graphVisible && (
          <div
            className="flex-shrink-0 border-r border-white/5 flex flex-col h-full transition-all duration-300"
            style={{ width: stage === 1 ? "60%" : stage <= 3 ? "50%" : "65%" }}
          >
            <PersistentGraphPanel
              visible={graphVisible}
              onToggle={() => setGraphVisible(false)}
              buildStarted={graphBuildStarted}
              pendingNodes={discoveredNodes}
              pendingLinks={discoveredLinks}
            />
          </div>
        )}

        {/* Right: Stage Content */}
        <div className="flex-1 overflow-y-auto dark-scroll relative">
          {/* Mountain background — same as homepage */}
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=90&w=3840&auto=format&fit=crop"
            alt=""
            fill
            quality={90}
            style={{ objectFit: "cover", objectPosition: "center" }}
            className="pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[#2a3441]/85 pointer-events-none" />
          <div className="relative z-10 px-4 py-4">
            {/* Stage label + skip */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-white/70 text-xs font-mono uppercase tracking-widest">
                  Stage {stage} of 5
                </div>
                <h2 className="text-white font-bold text-2xl leading-tight">{STAGE_LABELS[stage]}</h2>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                {!graphVisible && (
                  <button
                    onClick={() => setGraphVisible(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/10"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Graph
                  </button>
                )}
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
              <Stage1KnowledgeGraph
                onComplete={handleStage1Complete}
                onBeginAnalysis={handleBeginAnalysis}
              />
            )}
            {stage === 2 && (
              <div className="flex flex-col gap-8">
                <Stage2AgentGrid
                  onComplete={() => setAgentsDone(true)}
                  onAgentClick={setChatPersonaId}
                />
                <Stage3SimConfig visible={agentsDone} onComplete={advanceStage} />
              </div>
            )}
            {stage === 3 && (
              <Stage4SocialFeed onComplete={advanceStage} onGraphEvent={handleGraphEvent} />
            )}
            {stage === 4 && (
              <Stage5ReportPanel onComplete={advanceStage} />
            )}
            {stage === 5 && (
              <Stage6DeepInteraction onPersonaChat={setChatPersonaId} />
            )}
          </div>{/* end relative z-10 */}
        </div>{/* end right panel */}
      </div>{/* end split body */}

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
