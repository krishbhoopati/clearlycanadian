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
    // After all cards are visible + 1.5s, show swarm cluster
    const t1 = setTimeout(() => setSwarmVisible(true), simulationAgents.length * STAGGER_MS + 800);
    // Then advance
    const t2 = setTimeout(() => onComplete(), simulationAgents.length * STAGGER_MS + 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

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
    </div>
  );
}
