"use client";

import PersonaAvatar from "@/components/PersonaAvatar";
import type { PersonaSimulationResult, Persona } from "@/lib/types";

interface PersonaCardProps {
  result: PersonaSimulationResult;
  persona?: Persona;
  onChatClick: () => void;
}

const SENTIMENT: Record<string, { label: string; color: string; bg: string; text: string; bar: string }> = {
  immediate_yes:           { label: 'Positive',    color: '#059669', bg: '#ecfdf5', text: '#059669', bar: '#059669' },
  already_buying:          { label: 'Loyal',       color: '#0284c7', bg: '#e0f2fe', text: '#0284c7', bar: '#0284c7' },
  likely_try:              { label: 'Interested',  color: '#d97706', bg: '#fffbeb', text: '#d97706', bar: '#d97706' },
  interested_but_barriers: { label: 'Conditional', color: '#d97706', bg: '#fffbeb', text: '#d97706', bar: '#f59e0b' },
  indifferent:             { label: 'Neutral',     color: '#6b7280', bg: '#f9fafb', text: '#6b7280', bar: '#9ca3af' },
  unlikely_without_push:   { label: 'Unlikely',    color: '#dc2626', bg: '#fef2f2', text: '#dc2626', bar: '#dc2626' },
  hard_no:                 { label: 'Friction',    color: '#dc2626', bg: '#fef2f2', text: '#dc2626', bar: '#dc2626' },
};

function extractShortLabel(text: string): string {
  if (!text) return '';
  // Strip long prefixes like "Strong preference for", "Concerns about", etc.
  const stripped = text.replace(/^(strong preference for|preference for|concerns? about|interest in|desire for|need for|value of|importance of)\s+/i, '');
  return stripped.slice(0, 30);
}

export default function PersonaCard({ result, persona, onChatClick }: PersonaCardProps) {
  const sentiment = SENTIMENT[result.decision] ?? SENTIMENT.indifferent;
  const resonance = Math.round(result.confidence * 100);

  const keyDriver = result.drivers[0] ? extractShortLabel(result.drivers[0]) : null;
  const keyBarrier = result.barriers[0] ? extractShortLabel(result.barriers[0]) : null;
  const footerLabel = keyDriver ?? keyBarrier;
  const footerType = keyDriver ? 'Driver' : 'Blocker';

  return (
    <div
      onClick={onChatClick}
      className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden cursor-pointer"
    >
      {/* Colored top bar */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: sentiment.bar }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <PersonaAvatar name={result.persona_name} avatarUrl={persona?.avatar_url} size="w-10 h-10" />
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">{result.persona_name}</div>
            {persona && (
              <div className="text-gray-500 text-xs">{persona.behavioral_segment}</div>
            )}
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: sentiment.bg, color: sentiment.text }}
        >
          {sentiment.label}
        </div>
      </div>

      {/* Quote */}
      <p
        className="text-gray-700 text-sm italic leading-relaxed line-clamp-4"
        style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        &ldquo;{result.response_text}&rdquo;
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
        <div>
          <span className="text-gray-400">Resonance </span>
          <span className="font-mono font-semibold text-gray-700">{resonance}/100</span>
        </div>
        {footerLabel && (
          <div className="text-right max-w-[55%]">
            <span className="text-gray-400">Key {footerType} </span>
            <span className="text-gray-600 truncate">{footerLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
