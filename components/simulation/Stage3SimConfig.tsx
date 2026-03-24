"use client";

import { simConfigData } from "@/data/simulation/mapleSimulationData";

interface Props {
  onComplete: () => void;
}

export default function Stage3SimConfig({ onComplete }: Props) {
  const { stats, timeOfDayMultipliers, agentCards, recommendationWeights, llmConfigText, narrativeDirection, hotTopics, activationPosts } = simConfigData;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-dark rounded-xl p-4">
            <div className="text-white font-bold text-2xl">{s.value}</div>
            <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
            {s.sub && <div className="text-white/30 text-xs mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time-of-Day Multipliers */}
        <div className="glass-dark rounded-xl p-5">
          <div className="text-white/70 text-sm font-semibold mb-4">Time-of-Day Activity Multipliers</div>
          <div className="flex flex-col gap-3">
            {timeOfDayMultipliers.map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white/80 text-xs font-medium">{row.label}</span>
                    <span className="text-white/30 text-xs ml-2">{row.times}</span>
                  </div>
                  <span className="text-blue-400 text-xs font-mono font-bold">×{row.multiplier}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500/70 rounded-full transition-all duration-700"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Config */}
        <div className="glass-dark rounded-xl p-5">
          <div className="text-white/70 text-sm font-semibold mb-3">LLM Simulation Config</div>
          <p className="text-white/50 text-xs leading-relaxed mb-4">{llmConfigText}</p>
          <div className="flex flex-col gap-2">
            {recommendationWeights.map((rw) => (
              <div key={rw.platform} className="glass-dark rounded-lg p-3">
                <div className="text-white/60 text-xs font-medium mb-2">{rw.platform}</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(rw.weights).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-xs">
                      <span className="text-white/40">{k}</span>
                      <span className="text-blue-400 font-mono">{(v * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Config Cards */}
      <div className="glass-dark rounded-xl p-5">
        <div className="text-white/70 text-sm font-semibold mb-4">Agent Configuration</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agentCards.map((agent) => (
            <div key={agent.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: agent.avatar_color }}
                >
                  {agent.name[0]}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{agent.name}</div>
                  <div className="text-white/40 text-xs">{agent.role}</div>
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
                        ? "rgba(59,130,246,0.8)"
                        : level > 0.4
                        ? "rgba(59,130,246,0.4)"
                        : level > 0.1
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(255,255,255,0.04)",
                    }}
                    title={`${h}:00`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-white/25 text-xs mb-3">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-white/60 font-medium">{agent.stats.when_posting}</div>
                  <div className="text-white/25">posts/day</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 font-medium">{agent.stats.comments_per_time}</div>
                  <div className="text-white/25">comments</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 font-medium">{Math.round(agent.activity_pct * 100)}%</div>
                  <div className="text-white/25">activity</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-white/30">Emotion</span>
                  <span className={agent.emotional_tendency >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {agent.emotional_tendency > 0 ? "+" : ""}{agent.emotional_tendency.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/30">Influence</span>
                  <span className="text-amber-400">{agent.influence}x</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/30">Delay</span>
                  <span className="text-white/50">{agent.stats.response_delay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initial Activation Orchestration */}
      <div className="glass-dark rounded-xl p-5 border border-orange-500/20">
        <div className="text-white/70 text-sm font-semibold mb-1">Initial Activation Orchestration</div>
        <div className="text-white/30 text-xs mb-4">Narrative direction and seed posts that kick off the simulation</div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
          <div className="text-orange-400 text-xs font-semibold mb-1">Narrative Direction</div>
          <p className="text-white/60 text-sm leading-relaxed">{narrativeDirection}</p>
        </div>

        <div className="mb-4">
          <div className="text-white/40 text-xs mb-2">Initial Hot Topics</div>
          <div className="flex flex-wrap gap-2">
            {hotTopics.map((topic) => (
              <span key={topic} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-white/40 text-xs mb-3">Initial Activation Sequence</div>
          <div className="flex flex-col gap-2">
            {activationPosts.map((post, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: post.color }}
                >
                  {post.agentName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white/70 text-xs font-medium">{post.agentName}</span>
                    <span className="text-white/25 text-xs">{post.agentType}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{post.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200"
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
