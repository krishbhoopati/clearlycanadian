"use client";

import type { SimAgent } from "@/lib/types";

const AWARENESS_LABELS: Record<SimAgent["awareness_level"], { label: string; color: string }> = {
  loyal: { label: "Loyal Fan", color: "bg-emerald-100 text-emerald-700 border-0" },
  aware: { label: "Brand Aware", color: "bg-blue-100 text-blue-700 border-0" },
  vaguely_aware: { label: "Vaguely Aware", color: "bg-amber-100 text-amber-700 border-0" },
  never_heard: { label: "Net New", color: "bg-red-100 text-red-700 border-0" },
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
      className={["bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow duration-200", className ?? ""].join(" ")}
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
          <div className="font-semibold text-slate-800 text-sm truncate">{agent.name}</div>
          <div className="text-slate-500 text-xs truncate">{agent.age} · {agent.location}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {agent.archetype}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-md ${aw.color}`}>
          {aw.label}
        </span>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed italic">"{agent.maple_stance}"</p>

      {showChatButton && (
        <button
          onClick={onClick}
          className="mt-auto w-full py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200"
        >
          Chat with {agent.name.split(" ")[0]} →
        </button>
      )}
    </div>
  );
}
