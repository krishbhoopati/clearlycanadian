"use client";

import { useEffect, useState } from "react";
import { simulationAgents } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";
import dynamic from "next/dynamic";

const SwarmCluster = dynamic(() => import("./SwarmCluster"), { ssr: false });

interface Props {
  onComplete: () => void;
  onAgentClick?: (personaId: string) => void;
}

const STAGGER_MS = 120;

export default function Stage2AgentGrid({ onComplete, onAgentClick }: Props) {
  const [swarmVisible, setSwarmVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSwarmVisible(true), simulationAgents.length * STAGGER_MS + 800);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">Agent Generation</h3>
          <p className="text-white/40 text-sm mt-0.5">Initializing {simulationAgents.length} featured archetypes from 1,247-agent swarm</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {simulationAgents.map((agent, i) => (
          <div
            key={agent.id}
            className="opacity-0 animate-agent-pop-in"
            style={{
              animationDelay: `${i * STAGGER_MS}ms`,
              animationFillMode: "forwards",
            }}
          >
            <SimulationAgentCard
              agent={agent}
              onClick={() => onAgentClick?.(agent.persona_id)}
            />
          </div>
        ))}
      </div>

      <SwarmCluster visible={swarmVisible} />

      {swarmVisible && (
        <div className="flex justify-end mt-2">
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200"
          >
            Configure Simulation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
