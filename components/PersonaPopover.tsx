"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PersonaAvatar from "@/components/PersonaAvatar";
import type { Persona } from "@/lib/types";

interface PersonaPopoverProps {
  persona: Persona;
  rect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function getAwarenessColor(cc_awareness: string): string {
  const l = (cc_awareness ?? "").toLowerCase();
  if (l.includes("existing") || l.includes("loyal") || l.includes("buying") || l.includes("customer")) return "#10b981";
  if (l.includes("never") || l.includes("unaware") || l.includes("no awareness")) return "#ef4444";
  return "#f59e0b";
}

const POPOVER_HEIGHT = 520;
const POPOVER_WIDTH = 440;

export default function PersonaPopover({ persona: p, rect, onMouseEnter, onMouseLeave }: PersonaPopoverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const top =
    rect.top - POPOVER_HEIGHT - 12 < 0
      ? rect.bottom + 12
      : rect.top - POPOVER_HEIGHT - 12;
  const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 16);

  const popover = (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        top,
        left,
        width: POPOVER_WIDTH,
        zIndex: 9999,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.18s ease, transform 0.18s ease",
        pointerEvents: "auto",
      }}
      className="bg-[#1a2230]/95 backdrop-blur-xl border border-white/12 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex gap-4 items-start p-5 pb-4">
        <div className="shrink-0">
          <PersonaAvatar name={p.name} avatarUrl={p.avatar_url} size="w-16 h-16" textSize="text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg leading-tight">{p.name}</span>
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getAwarenessColor(p.cc_awareness ?? "") }}
            />
            {(p.segment_label ?? p.behavioral_segment) && (
              <span className="text-white/55 text-xs font-mono truncate">
                {p.segment_label ?? p.behavioral_segment}
              </span>
            )}
          </div>
          <p className="text-white/70 text-sm mt-0.5">
            {p.generation} · {p.age_range} · {p.location ?? (p.market === "CA" ? "Canada" : p.market)}
          </p>
          {p.occupation && (
            <p className="text-white/80 text-sm mt-0.5">{p.occupation}</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-4 flex flex-col gap-3 max-h-[420px] overflow-y-auto dark-scroll">
        {/* Description */}
        {p.description && (
          <p className="text-white/75 text-sm leading-relaxed border-t border-white/8 pt-3">
            {p.description}
          </p>
        )}

        {/* Tags: core traits + current beverages */}
        {((p.core_traits?.length ?? 0) > 0 || (p.current_beverages?.length ?? 0) > 0) && (
          <div className="flex flex-col gap-2 border-t border-white/8 pt-3">
            {(p.core_traits?.length ?? 0) > 0 && (
              <div className="flex flex-wrap items-start gap-1.5">
                <span className="font-mono text-white/50 text-xs uppercase tracking-widest w-full">Core Traits</span>
                {p.core_traits.map((t, i) => (
                  <span key={i} className="bg-white/10 text-white/85 text-xs rounded-full px-3 py-1 border border-white/15">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {(p.current_beverages?.length ?? 0) > 0 && (
              <div className="flex flex-wrap items-start gap-1.5">
                <span className="font-mono text-white/50 text-xs uppercase tracking-widest w-full">Current Drinks</span>
                {p.current_beverages!.map((b, i) => (
                  <span key={i} className="bg-[#60a5fa]/15 text-[#93c5fd] text-xs rounded-full px-3 py-1 border border-[#60a5fa]/25">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Motivations / Pain Points / Buying Triggers */}
        {((p.motivations?.length ?? 0) > 0 || (p.pain_points?.length ?? 0) > 0 || (p.buying_triggers?.length ?? 0) > 0) && (
          <div className="flex flex-col gap-2.5 border-t border-white/8 pt-3">
            {(p.motivations?.length ?? 0) > 0 && (
              <div>
                <span className="font-mono text-white/50 text-xs uppercase tracking-widest block mb-1.5">Motivations</span>
                <ul className="flex flex-col gap-1">
                  {p.motivations.slice(0, 3).map((m, i) => (
                    <li key={i} className="text-white/80 text-sm flex gap-2">
                      <span className="text-white/35 shrink-0">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(p.pain_points?.length ?? 0) > 0 && (
              <div>
                <span className="font-mono text-white/50 text-xs uppercase tracking-widest block mb-1.5">Pain Points</span>
                <ul className="flex flex-col gap-1">
                  {p.pain_points.slice(0, 2).map((m, i) => (
                    <li key={i} className="text-white/80 text-sm flex gap-2">
                      <span className="text-white/35 shrink-0">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(p.buying_triggers?.length ?? 0) > 0 && (
              <div>
                <span className="font-mono text-white/50 text-xs uppercase tracking-widest block mb-1.5">Buying Triggers</span>
                <ul className="flex flex-col gap-1">
                  {p.buying_triggers.slice(0, 2).map((m, i) => (
                    <li key={i} className="text-white/80 text-sm flex gap-2">
                      <span className="text-white/35 shrink-0">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer: beverage psychology, price sensitivity, social media */}
        {(p.beverage_psychology || p.price_sensitivity || p.social_media_behavior) && (
          <div className="border-t border-white/8 pt-3 flex flex-col gap-2">
            {p.beverage_psychology && (
              <p className="text-white/60 text-sm italic leading-relaxed">
                &ldquo;{p.beverage_psychology}&rdquo;
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {p.price_sensitivity && (
                <span className="text-white/65 text-sm">
                  <span className="text-white/40">Price: </span>{p.price_sensitivity}
                </span>
              )}
              {p.decision_style && (
                <span className="text-white/65 text-sm">
                  <span className="text-white/40">Decides: </span>{p.decision_style}
                </span>
              )}
            </div>
            {p.social_media_behavior && (
              <p className="text-white/60 text-sm">{p.social_media_behavior}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(popover, document.body);
}
