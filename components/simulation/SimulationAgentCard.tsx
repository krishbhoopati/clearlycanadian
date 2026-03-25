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
  style?: React.CSSProperties;
  className?: string;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</div>
  );
}

export default function SimulationAgentCard({ agent, persona, onClick, showChatButton, style, className }: Props) {
  const aw = AWARENESS_LABELS[agent.awareness_level];
  const generation = persona?.generation ?? agent.segment;
  const badge = GEN_BADGE[generation] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const name = persona?.name ?? agent.name;
  const age = persona?.age ?? agent.age;
  const location = persona?.location ?? agent.location;
  const avatarUrl = persona?.avatar_url;
  const description = persona?.description;
  const motivations = persona?.motivations?.slice(0, 2) ?? [];
  const coreTraits = persona?.core_traits?.slice(0, 4) ?? [];
  const currentDrinks = persona?.current_beverages?.slice(0, 3) ?? [];

  return (
    <div
      className={["bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 h-full hover:shadow-md transition-shadow duration-200 cursor-pointer", className ?? ""].join(" ")}
      style={style}
      onClick={onClick}
    >
      {/* Avatar + name + badges */}
      <div className="flex items-start gap-3">
        <PersonaAvatar
          name={name}
          avatarUrl={avatarUrl}
          size="w-14 h-14"
          textSize="text-lg"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-base leading-tight">{name}</div>
          <div className="text-gray-500 text-sm mt-0.5">{age} · {location}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${badge.bg} ${badge.text}`}>
              {generation}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${aw.color}`}>
              {aw.label}
            </span>
          </div>
        </div>
      </div>

      {/* Archetype tag */}
      <div className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg self-start">
        {agent.archetype}
      </div>

      {/* Description from persona */}
      {description && (
        <p className="text-gray-700 text-[13px] leading-relaxed">{description}</p>
      )}

      {description && <div className="border-t border-gray-100" />}

      {/* Motivations */}
      {motivations.length > 0 && (
        <div>
          <SectionLabel label="Motivations" />
          <ul className="flex flex-col gap-1">
            {motivations.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-600">
                <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-gray-400 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CC Maple Stance */}
      <div>
        <SectionLabel label="CC Maple Stance" />
        <p className="text-gray-600 text-[12.5px] leading-relaxed italic">"{agent.maple_stance}"</p>
      </div>

      {/* Core traits */}
      {coreTraits.length > 0 && (
        <div>
          <SectionLabel label="Core Traits" />
          <div className="flex flex-wrap gap-1.5">
            {coreTraits.map((t, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-gray-600 bg-white border border-gray-200">
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
          <div className="flex flex-wrap gap-1.5">
            {currentDrinks.map((b, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100">
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
