"use client";

import { useEffect, useState } from "react";
import { simConfigData, simulationAgents } from "@/data/simulation/mapleSimulationData";
import PersonaAvatar from "@/components/PersonaAvatar";
import type { Persona } from "@/lib/types";

interface Props {
  onComplete: () => void;
}

export default function Stage3SimConfig({ onComplete }: Props) {
  const { stats, timeOfDayMultipliers, agentCards, recommendationWeights, llmConfigText, narrativeDirection, hotTopics, activationPosts } = simConfigData;
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => setPersonas(Array.isArray(data) ? data : (data.personas ?? [])));
  }, []);

  const personaMap = new Map(personas.map((p) => [p.id, p]));
  // Map agentCard id → persona via simulationAgents lookup
  const agentPersonaMap = new Map(
    simulationAgents.map((a) => [a.id, personaMap.get(a.persona_id)])
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-slate-800 font-bold text-3xl">{s.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
            {s.sub && <div className="text-slate-300 text-sm mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {/* Time-of-Day Multipliers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-slate-700 text-base font-semibold mb-4">Time-of-Day Activity Multipliers</div>
          <div className="flex flex-col gap-3">
            {timeOfDayMultipliers.map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-700 text-sm font-medium">{row.label}</span>
                    <span className="text-slate-400 text-sm ml-2">{row.times}</span>
                  </div>
                  <span className="text-orange-500 text-sm font-mono font-bold">×{row.multiplier}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400/80 rounded-full transition-all duration-700"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-slate-700 text-base font-semibold mb-3">LLM Simulation Config</div>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">{llmConfigText}</p>
          <div className="flex flex-col gap-2">
            {recommendationWeights.map((rw) => (
              <div key={rw.platform} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div className="text-slate-600 text-sm font-medium mb-2">{rw.platform}</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(rw.weights).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm">
                      <span>{k}</span>
                      <span className="text-orange-600 font-mono">{(v * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Config Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="text-slate-700 text-base font-semibold mb-4">Agent Configuration</div>
        <div className="overflow-y-auto light-scroll" style={{ maxHeight: 420 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1">
          {agentCards.map((agent) => {
            const persona = agentPersonaMap.get(agent.id);
            const displayName = persona?.name ?? agent.name;
            const displayRole = persona ? `${persona.occupation ?? persona.generation} · ${persona.location ?? ""}`.trim().replace(/·\s*$/, "") : agent.role;
            const avatarUrl = persona?.avatar_url;
            return (
            <div key={agent.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <PersonaAvatar
                  name={displayName}
                  avatarUrl={avatarUrl}
                  size="w-10 h-10"
                  textSize="text-sm"
                />
                <div>
                  <div className="text-slate-800 text-base font-semibold">{displayName}</div>
                  <div className="text-slate-600 text-sm">{displayRole}</div>
                </div>
              </div>

              {/* 24-hour activity bar */}
              <div className="flex gap-0.5 mb-3">
                {agent.hourlyActivity.map((level, h) => (
                  <div
                    key={h}
                    className="flex-1 rounded-sm"
                    style={{
                      height: 20,
                      backgroundColor: level > 0.7
                        ? "#f97316"
                        : level > 0.4
                        ? "#fdba74"
                        : level > 0.1
                        ? "#fed7aa"
                        : "#f1f5f9",
                    }}
                    title={`${h}:00`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-slate-500 text-sm mb-3">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-slate-800 font-semibold">{agent.stats.when_posting}</div>
                  <div className="text-slate-500">posts/day</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-800 font-semibold">{agent.stats.comments_per_time}</div>
                  <div className="text-slate-500">comments</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-800 font-semibold">{Math.round(agent.activity_pct * 100)}%</div>
                  <div className="text-slate-500">activity</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Emotion</span>
                  <span className={agent.emotional_tendency >= 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                    {agent.emotional_tendency > 0 ? "+" : ""}{agent.emotional_tendency.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Influence</span>
                  <span className="text-orange-500 font-semibold">{agent.influence}x</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Delay</span>
                  <span className="text-slate-700 font-medium">{agent.stats.response_delay}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Initial Activation Orchestration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="text-slate-700 text-base font-semibold mb-1">Initial Activation Orchestration</div>
        <div className="text-slate-400 text-sm mb-4">Narrative direction and seed posts that kick off the simulation</div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <div className="text-orange-700 text-sm font-semibold mb-1">Narrative Direction</div>
          <p className="text-slate-600 text-base leading-relaxed">{narrativeDirection}</p>
        </div>

        <div className="mb-4">
          <div className="text-slate-400 text-sm mb-2">Initial Hot Topics</div>
          <div className="flex flex-wrap gap-2">
            {hotTopics.map((topic) => (
              <span key={topic} className="text-sm px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-sm mb-3">Initial Activation Sequence</div>
          <div className="flex flex-col gap-2">
            {activationPosts.map((post, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-slate-100 rounded-lg p-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: post.color }}
                >
                  {post.agentName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-slate-700 text-sm font-medium">{post.agentName}</span>
                    <span className="text-slate-400 text-sm">{post.agentType}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{post.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-sm transition-all duration-200"
        >
          Begin Simulation
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
