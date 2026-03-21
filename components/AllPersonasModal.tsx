"use client";

import PersonaAvatar from "@/components/PersonaAvatar";
import type { Persona } from "@/lib/types";

interface AllPersonasModalProps {
  personas: Persona[];
  onClose: () => void;
}

const GEN_BADGE: Record<string, { bg: string; text: string }> = {
  "Gen Z":    { bg: "bg-violet-100", text: "text-violet-700" },
  Millennial: { bg: "bg-blue-100",   text: "text-blue-700"   },
  "Gen X":    { bg: "bg-amber-100",  text: "text-amber-700"  },
  Boomer:     { bg: "bg-rose-100",   text: "text-rose-700"   },
};

function getAwarenessColor(cc_awareness: string): string {
  const l = (cc_awareness ?? "").toLowerCase();
  if (l.includes("existing") || l.includes("loyal") || l.includes("buying") || l.includes("customer")) return "#10b981";
  if (l.includes("never") || l.includes("unaware") || l.includes("no awareness")) return "#ef4444";
  return "#f59e0b";
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
}

const AtIcon = (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const TagIcon = (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const StarIcon = (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function AllPersonasModal({ personas, onClose }: AllPersonasModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex-1 flex flex-col bg-[#f0f3f7] overflow-hidden">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-gray-900 font-bold text-xl">Consumer Panel</span>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
              {personas.length} personas
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map(p => {
              const badge = GEN_BADGE[p.generation] ?? { bg: "bg-gray-100", text: "text-gray-600" };
              const segLabel = p.segment_label ?? (p.behavioral_segment ?? "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              const location = p.location ?? p.region ?? (p.market === "CA" ? "Canada" : p.market);
              const ageStr = p.age ? String(p.age) : p.age_range;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
                >
                  {/* Top: avatar + name + meta + badges */}
                  <div className="flex items-start gap-4">
                    <PersonaAvatar
                      name={p.name}
                      avatarUrl={p.avatar_url}
                      size="w-[60px] h-[60px]"
                      textSize="text-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-[1.1rem] leading-tight">{p.name}</div>
                      <div className="text-gray-500 text-sm mt-0.5">
                        {ageStr}{location ? ` · ${location}` : ""}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${badge.bg} ${badge.text}`}>
                          {p.generation}
                        </span>
                        {segLabel && (
                          <span className="text-gray-400 text-[12px]">{segLabel}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {p.description && (
                    <p className="text-gray-700 text-[13.5px] leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  <div className="border-t border-gray-100" />

                  {/* Motivations */}
                  {(p.motivations?.length ?? 0) > 0 && (
                    <div>
                      <SectionLabel icon={AtIcon} label="Motivations" />
                      <ul className="flex flex-col gap-1">
                        {p.motivations.slice(0, 3).map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-600">
                            <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-gray-400 shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pain Points */}
                  {(p.pain_points?.length ?? 0) > 0 && (
                    <div>
                      <SectionLabel icon={AtIcon} label="Pain Points" />
                      <ul className="flex flex-col gap-1">
                        {p.pain_points.slice(0, 2).map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-600">
                            <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-gray-400 shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Buying Triggers */}
                  {(p.buying_triggers?.length ?? 0) > 0 && (
                    <div>
                      <SectionLabel icon={AtIcon} label="Buying Triggers" />
                      <ul className="flex flex-col gap-1">
                        {p.buying_triggers.slice(0, 2).map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-600">
                            <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-gray-400 shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Core Traits */}
                  {(p.core_traits?.length ?? 0) > 0 && (
                    <div>
                      <SectionLabel icon={TagIcon} label="Core Traits" />
                      <div className="flex flex-wrap gap-1.5">
                        {p.core_traits.map((t, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-gray-600 bg-white border border-gray-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Drinks */}
                  {(p.current_beverages?.length ?? 0) > 0 && (
                    <div>
                      <SectionLabel icon={TagIcon} label="Current Drinks" />
                      <div className="flex flex-wrap gap-1.5">
                        {p.current_beverages!.map((b, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price / Decision / Social / Beverage psychology */}
                  {(p.price_sensitivity || p.decision_style || p.social_media_behavior || p.beverage_psychology) && (
                    <div className="flex flex-col gap-1.5">
                      {p.beverage_psychology && (
                        <p className="text-gray-500 text-[12px] italic leading-relaxed">"{p.beverage_psychology}"</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {p.price_sensitivity && (
                          <span className="text-[12px] text-gray-600">
                            <span className="text-gray-400">Price: </span>{p.price_sensitivity}
                          </span>
                        )}
                        {p.decision_style && (
                          <span className="text-[12px] text-gray-600">
                            <span className="text-gray-400">Decides: </span>{p.decision_style}
                          </span>
                        )}
                      </div>
                      {p.social_media_behavior && (
                        <p className="text-gray-500 text-[12px]">{p.social_media_behavior}</p>
                      )}
                    </div>
                  )}

                  {/* Brand Awareness */}
                  {(p.cc_awareness_label ?? p.cc_awareness) && (
                    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mt-auto">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ color: getAwarenessColor(p.cc_awareness ?? "") }}>
                          {StarIcon}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Brand Awareness
                        </span>
                      </div>
                      <p className="text-gray-900 font-bold text-[13px] leading-snug">
                        {p.cc_awareness_label ?? p.cc_awareness}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
