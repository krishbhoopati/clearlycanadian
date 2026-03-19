"use client";

import PersonaAvatar from "@/components/PersonaAvatar";
import type { PersonaSimulationResult, Persona } from "@/lib/types";

interface PersonaCardProps {
  result?: PersonaSimulationResult;
  persona?: Persona;
  onChatClick: () => void;
  streamingText?: string;
  isStreaming?: boolean;
}

const SENTIMENT: Record<string, { label: string; dot: string; bg: string; text: string; bar: string }> = {
  immediate_yes:           { label: 'Positive', dot: '#059669', bg: '#ecfdf5', text: '#059669', bar: '#059669' },
  already_buying:          { label: 'Loyal',    dot: '#059669', bg: '#ecfdf5', text: '#059669', bar: '#059669' },
  likely_try:              { label: 'Positive', dot: '#059669', bg: '#ecfdf5', text: '#059669', bar: '#059669' },
  interested_but_barriers: { label: 'Mixed',    dot: '#2563eb', bg: '#eff6ff', text: '#2563eb', bar: '#3b82f6' },
  indifferent:             { label: 'Neutral',  dot: '#d97706', bg: '#fffbeb', text: '#d97706', bar: '#f59e0b' },
  unlikely_without_push:   { label: 'Friction', dot: '#dc2626', bg: '#fef2f2', text: '#dc2626', bar: '#dc2626' },
  hard_no:                 { label: 'Friction', dot: '#dc2626', bg: '#fef2f2', text: '#dc2626', bar: '#dc2626' },
};

const FOOTER_LABEL: Record<string, string> = {
  immediate_yes:           'Key Driver',
  already_buying:          'Key Driver',
  likely_try:              'Key Driver',
  interested_but_barriers: 'Condition',
  indifferent:             'Condition',
  unlikely_without_push:   'Key Blocker',
  hard_no:                 'Key Blocker',
};

function formatSegment(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function extractShortLabel(text: string): string {
  if (!text) return '';
  const stripped = text.replace(/^(strong preference for|preference for|concerns? about|interest in|desire for|need for|value of|importance of)\s+/i, '');
  return stripped.slice(0, 28).replace(/[\s([{,;:]+$/, '');
}

export default function PersonaCard({ result, persona, onChatClick, streamingText, isStreaming }: PersonaCardProps) {
  // ── Streaming mode ──
  if (streamingText !== undefined && !result) {
    const displayName = persona
      ? `${persona.name}, ${persona.age ?? persona.age_range}`
      : "Loading…";
    const subtitle = persona?.behavioral_segment
      ? formatSegment(persona.behavioral_segment)
      : "";

    return (
      <div
        onClick={onChatClick}
        className="bg-white rounded-[20px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.13)] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 to-blue-200" />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <PersonaAvatar
              name={persona?.name ?? "?"}
              avatarUrl={persona?.avatar_url}
              size="w-12 h-12"
              textSize="text-sm"
            />
            <div>
              <div className="font-bold text-gray-900 text-[15px] leading-tight">
                {displayName}
              </div>
              {subtitle && (
                <div className="text-gray-400 text-xs mt-0.5">{subtitle}</div>
              )}
            </div>
          </div>

          {isStreaming ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Responding…
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Complete
            </div>
          )}
        </div>

        <p
          className="text-gray-700 text-[15px] italic leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          &ldquo;{streamingText}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
          )}
          &rdquo;
        </p>

        {!isStreaming && (
          <div className="flex items-end justify-between border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                Resonance
              </span>
              <span className="text-xl font-bold text-gray-300 font-mono leading-none">
                —
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Full result mode (existing) ──
  if (!result) return null;

  const sentiment = SENTIMENT[result.decision] ?? SENTIMENT.indifferent;
  const resonance = Math.round(result.confidence * 100);

  const isPositive = ['immediate_yes', 'already_buying', 'likely_try'].includes(result.decision);
  const keyLabel = FOOTER_LABEL[result.decision] ?? 'Condition';
  const keyValue = isPositive
    ? extractShortLabel(result.drivers[0] ?? result.barriers[0] ?? '')
    : extractShortLabel(result.barriers[0] ?? result.drivers[0] ?? '');

  const displayName = persona
    ? `${persona.name}, ${persona.age ?? persona.age_range}`
    : result.persona_name;
  const subtitle = persona?.behavioral_segment
    ? formatSegment(persona.behavioral_segment)
    : (persona?.customer_type ?? '');

  return (
    <div
      onClick={onChatClick}
      className="bg-white rounded-[20px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.13)] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: sentiment.bar }} />

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <PersonaAvatar name={result.persona_name} avatarUrl={persona?.avatar_url} size="w-12 h-12" textSize="text-sm" />
          <div>
            <div className="font-bold text-gray-900 text-[15px] leading-tight">{displayName}</div>
            {subtitle && <div className="text-gray-400 text-xs mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: sentiment.bg, color: sentiment.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: sentiment.dot }} />
          {sentiment.label}
        </div>
      </div>

      <p className="text-gray-700 text-[15px] italic leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        &ldquo;{result.response_text}&rdquo;
      </p>

      <div className="flex items-end justify-between border-t border-gray-100 pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Resonance</span>
          <span className="text-xl font-bold text-gray-800 font-mono leading-none">{resonance}/100</span>
        </div>
        {keyValue && (
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">{keyLabel}</span>
            <span className="text-base font-bold text-gray-800 leading-none">{keyValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
