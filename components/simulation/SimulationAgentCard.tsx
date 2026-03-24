"use client";

import type { SimAgent } from "@/lib/types";

const AWARENESS_LABELS: Record<SimAgent["awareness_level"], { label: string; color: string }> = {
  loyal: { label: "Loyal Fan", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  aware: { label: "Brand Aware", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  vaguely_aware: { label: "Vaguely Aware", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  never_heard: { label: "Net New", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

interface Props {
  agent: SimAgent;
  onClick?: () => void;
  showChatButton?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function SimulationAgentCard({ agent, onClick, showChatButton, style, className }: Props) {
  const aw = AWARENESS_LABELS[agent.awareness_level];
  const initials = agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className={["glass-dark rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-all duration-200", className ?? ""].join(" ")}
      style={style}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: agent.avatar_color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-sm truncate">{agent.name}</div>
          <div className="text-white/50 text-xs truncate">{agent.age} · {agent.location}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          {agent.archetype}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${aw.color}`}>
          {aw.label}
        </span>
      </div>

      <p className="text-white/70 text-xs leading-relaxed italic">"{agent.maple_stance}"</p>

      {showChatButton && (
        <button
          onClick={onClick}
          className="mt-auto w-full py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-all duration-200"
        >
          Chat with {agent.name.split(" ")[0]} →
        </button>
      )}
    </div>
  );
}
