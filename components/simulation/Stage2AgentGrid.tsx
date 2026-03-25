"use client";

import { useEffect, useState } from "react";
import { simulationAgents } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";
import dynamic from "next/dynamic";
import type { Persona } from "@/lib/types";

const SwarmCluster = dynamic(() => import("./SwarmCluster"), { ssr: false });

interface Props {
  onComplete: () => void;
  onAgentClick?: (personaId: string) => void;
}

const STAGGER_MS = 120;

export default function Stage2AgentGrid({ onComplete, onAgentClick }: Props) {
  const [swarmVisible, setSwarmVisible] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => setPersonas(Array.isArray(data) ? data : (data.personas ?? [])));
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setSwarmVisible(true), simulationAgents.length * STAGGER_MS + 800);
    return () => clearTimeout(t1);
  }, []);

  const personaMap = new Map(personas.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-xl">Agent Generation</h3>
          <p className="text-white/50 text-base mt-0.5">Initializing {simulationAgents.length} featured archetypes from 1,247-agent swarm</p>
        </div>
      </div>

      <SwarmCluster visible={swarmVisible} />

      <div className="overflow-y-auto light-scroll" style={{ maxHeight: 500 }}>
        <div className="grid grid-cols-2 gap-3 items-stretch">
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
                persona={personaMap.get(agent.persona_id)}
                onClick={() => onAgentClick?.(agent.persona_id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
