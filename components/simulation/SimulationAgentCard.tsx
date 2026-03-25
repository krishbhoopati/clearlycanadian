"use client";

import PersonaAvatar from "@/components/PersonaAvatar";
import type { SimAgent, Persona } from "@/lib/types";

const AWARENESS_LABELS: Record<SimAgent["awareness_level"], { label: string; color: string }> = {
  loyal:         { label: "Loyal Fan",     color: "bg-emerald-100 text-emerald-700" },
  aware:         { label: "Brand Aware",   color: "bg-blue-100 text-blue-700" },
  vaguely_aware: { label: "Vaguely Aware", color: "bg-amber-100 text-amber-700" },
  never_heard:   { label: "Net New",       color: "bg-red-100 text-red-700" },
};

const GEN_BADGE: Record<string, { bg: string; text: string }> = {
  "Gen Z":    { bg: "bg-violet-100", text: "text-violet-700" },
  Millennial: { bg: "bg-blue-100",   text: "text-blue-700"   },
  "Gen X":    { bg: "bg-amber-100",  text: "text-amber-700"  },
  Boomer:     { bg: "bg-rose-100",   text: "text-rose-700"   },
};

interface Props {
  agent: SimAgent;
  persona?: Persona;
  onClick?: () => void;
  showChatButton?: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</div>
  );
}

export default function SimulationAgentCard({ agent, persona, onClick, showChatButton, compact, style, className }: Props) {
  const aw = AWARENESS_LABELS[agent.awareness_level];
  const generation = persona?.generation ?? agent.segment;
  const badge = GEN_BADGE[generation] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const name = persona?.name ?? agent.name;
  const age = persona?.age ?? agent.age;
  const location = persona?.location ?? agent.location;
  const avatarUrl = persona?.avatar_url;
  const description = persona?.description;
  const motivations = persona?.motivations?.slice(0, 2) ?? [];
  const coreTraits = persona?.core_traits?.slice(0, compact ? 3 : 4) ?? [];
  const currentDrinks = persona?.current_beverages?.slice(0, compact ? 2 : 3) ?? [];

  return (
    <div
      className={["bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow duration-200 cursor-pointer", compact ? "p-3 gap-2" : "p-5 gap-3", className ?? ""].join(" ")}
      style={style}
      onClick={onClick}
    >
      {/* Avatar + name + badges */}
      <div className={["flex items-start", compact ? "gap-2" : "gap-3"].join(" ")}>
        <PersonaAvatar
          name={name}
          avatarUrl={avatarUrl}
          size={compact ? "w-10 h-10" : "w-14 h-14"}
          textSize={compact ? "text-sm" : "text-lg"}
        />
        <div className="flex-1 min-w-0">
          <div className={["font-bold text-gray-900 leading-tight", compact ? "text-sm" : "text-base"].join(" ")}>{name}</div>
          <div className={["text-gray-500 mt-0.5", compact ? "text-xs" : "text-sm"].join(" ")}>{age} · {location}</div>
          <div className={["flex flex-wrap items-center", compact ? "gap-1 mt-1" : "gap-1.5 mt-2"].join(" ")}>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${compact ? "text-[9px]" : "text-[10px]"} ${badge.bg} ${badge.text}`}>
              {generation}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-semibold ${compact ? "text-[9px]" : "text-[10px]"} ${aw.color}`}>
              {aw.label}
            </span>
          </div>
        </div>
      </div>

      {/* Archetype tag */}
      <div className={["font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg self-start", compact ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5"].join(" ")}>
        {agent.archetype}
      </div>

      {/* Description from persona */}
      {description && (
        <p className={["text-gray-700 leading-relaxed", compact ? "text-[11px]" : "text-[13px]"].join(" ")}>{description}</p>
      )}

      {description && <div className="border-t border-gray-100" />}

      {/* Motivations */}
      {motivations.length > 0 && (
        <div>
          <SectionLabel label="Motivations" />
          <ul className="flex flex-col gap-1">
            {motivations.map((m, i) => (
              <li key={i} className={["flex items-start gap-1.5 text-gray-600", compact ? "text-[11px]" : "text-[12.5px]"].join(" ")}>
                <span className="mt-[6px] w-[3px] h-[3px] rounded-full bg-gray-400 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CC Maple Stance */}
      <div>
        <SectionLabel label="CC Maple Stance" />
        <p className={["text-gray-600 leading-relaxed italic", compact ? "text-[11px]" : "text-[12.5px]"].join(" ")}>"{agent.maple_stance}"</p>
      </div>

      {/* Core traits */}
      {coreTraits.length > 0 && (
        <div>
          <SectionLabel label="Core Traits" />
          <div className="flex flex-wrap gap-1">
            {coreTraits.map((t, i) => (
              <span key={i} className={["font-medium text-gray-600 bg-white border border-gray-200 rounded-full", compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"].join(" ")}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current drinks */}
      {currentDrinks.length > 0 && (
        <div>
          <SectionLabel label="Currently Drinks" />
          <div className="flex flex-wrap gap-1">
            {currentDrinks.map((b, i) => (
              <span key={i} className={["font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full", compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"].join(" ")}>
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {showChatButton && (
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          className="mt-auto w-full py-2 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200"
        >
          Chat with {name.split(" ")[0]} →
        </button>
      )}
    </div>
  );
}
