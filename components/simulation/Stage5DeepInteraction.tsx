"use client";

import { useState } from "react";
import { simulationAgents, followUpResponses } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";

interface Props {
  onPersonaChat: (personaId: string) => void;
}

const FOLLOW_UP_PILLS = Object.keys(followUpResponses);

export default function Stage5DeepInteraction({ onPersonaChat }: Props) {
  const [activeResponse, setActiveResponse] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function handlePillClick(key: string) {
    setActiveKey(key);
    setActiveResponse(followUpResponses[key]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-white font-semibold text-lg">Deep Interaction</h3>
        <p className="text-white/40 text-sm mt-0.5">Chat with individual agents or explore follow-up scenarios</p>
      </div>

      {/* Persona grid */}
      <div>
        <div className="text-white/50 text-xs font-medium mb-3">Click any agent to open a 1-on-1 chat</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {simulationAgents.map((agent) => (
            <SimulationAgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onPersonaChat(agent.persona_id)}
              showChatButton
            />
          ))}
        </div>
      </div>

      {/* Follow-up pills */}
      <div className="glass-dark rounded-xl p-5">
        <div className="text-white/60 text-sm font-medium mb-3">Suggested Follow-Ups</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {FOLLOW_UP_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => handlePillClick(pill)}
              className={[
                "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                activeKey === pill
                  ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/25 hover:text-white/80",
              ].join(" ")}
            >
              {pill}
            </button>
          ))}
        </div>

        {activeResponse && (
          <div className="glass-dark rounded-xl p-4 border border-blue-500/20 mt-2">
            <div className="text-blue-400 text-xs font-medium mb-2">{activeKey}</div>
            <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {activeResponse.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <strong key={i} className="text-white block mb-2">{line.slice(2, -2)}</strong>;
                }
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="mb-1">{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="glass-dark rounded-xl p-4 border border-white/5">
        <div className="text-white/30 text-xs">
          AI-powered chat available when Puter.js is connected. Pre-written responses shown above. Click any agent card above to open a full conversation.
        </div>
      </div>
    </div>
  );
}
