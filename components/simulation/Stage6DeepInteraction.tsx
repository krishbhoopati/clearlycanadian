"use client";

import { useState } from "react";
import { simulationAgents, followUpResponses } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";

interface Props {
  onPersonaChat: (personaId: string) => void;
}

const FOLLOW_UP_PILLS = Object.keys(followUpResponses);

export default function Stage6DeepInteraction({ onPersonaChat }: Props) {
  const [activeResponse, setActiveResponse] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function handlePillClick(key: string) {
    setActiveKey(key);
    setActiveResponse(followUpResponses[key]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-white font-bold text-lg">Deep Interaction</h3>
        <p className="text-white/50 text-sm mt-0.5">Chat with individual agents or explore follow-up scenarios</p>
      </div>

      {/* Persona grid */}
      <div>
        <div className="text-white/50 text-xs font-medium mb-3">Click any agent to open a 1-on-1 chat</div>
        <div className="grid grid-cols-2 gap-3">
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="text-slate-600 text-sm font-medium mb-3">Suggested Follow-Ups</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {FOLLOW_UP_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => handlePillClick(pill)}
              className={[
                "text-xs px-3 py-1.5 rounded-full transition-all duration-200",
                activeKey === pill
                  ? "bg-orange-100 text-orange-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {pill}
            </button>
          ))}
        </div>

        {activeResponse && (
          <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm mt-2">
            <div className="text-orange-600 text-xs font-medium mb-2">{activeKey}</div>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {activeResponse.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <strong key={i} className="text-slate-800 block mb-2">{line.slice(2, -2)}</strong>;
                }
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="mb-1">{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-slate-400 text-xs">
          AI-powered chat available when Puter.js is connected. Pre-written responses shown above. Click any agent card above to open a full conversation.
        </div>
      </div>
    </div>
  );
}
