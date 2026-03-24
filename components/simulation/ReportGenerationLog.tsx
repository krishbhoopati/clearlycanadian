"use client";

import { useState } from "react";
import type { ReportLogEntry, ReportInterview } from "@/lib/types";

interface Props {
  entries: ReportLogEntry[];
  elapsedMs: number;
}

function InterviewCard({ interview }: { interview: ReportInterview }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
          style={{ backgroundColor: interview.avatar_color }}
        >
          {interview.agent_name[0]}
        </div>
        <div>
          <div className="text-white/80 font-medium">{interview.agent_name}</div>
          <div className="text-white/30">{interview.role}</div>
        </div>
      </div>
      {interview.qa.map((pair, i) => (
        <div key={i} className="mb-1.5">
          <div className="text-white/40 mb-0.5">Q: {pair.q}</div>
          <div className="text-white/65 leading-relaxed">A: {pair.a}</div>
        </div>
      ))}
      {interview.key_quotes.length > 0 && (
        <div className="mt-2 border-l-2 border-blue-500/40 pl-2">
          <div className="text-blue-400/70 italic">"{interview.key_quotes[0]}"</div>
        </div>
      )}
    </div>
  );
}

function ExpandableContent({ entry }: { entry: ReportLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  if (!entry.expandable) return null;
  const { expandable } = entry;

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors duration-150"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white/50">{expandable.summary}</span>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-col gap-1.5">
          {expandable.type === "memory_list" && expandable.items && (
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto dark-scroll">
              {expandable.items.map((item, i) => (
                <div key={i} className="text-white/40 text-xs flex items-start gap-1.5">
                  <span className="text-white/20 flex-shrink-0 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
          {expandable.type === "interview_cards" && expandable.interviews && (
            <div className="flex flex-col gap-2">
              {expandable.interviews.map((iv) => (
                <InterviewCard key={iv.agent_id} interview={iv} />
              ))}
            </div>
          )}
          {(expandable.type === "search_results" || expandable.type === "deep_insight") && expandable.items && (
            <div className="flex flex-col gap-1">
              {expandable.items.map((item, i) => (
                <div key={i} className="text-white/45 text-xs flex items-start gap-1.5">
                  <span className="text-emerald-400/60 flex-shrink-0">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function entryIcon(type: ReportLogEntry["type"]) {
  switch (type) {
    case "planning": return <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1" />;
    case "plan_complete": return <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />;
    case "section_start": return <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />;
    case "llm_response": return <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1" />;
    case "tool_call": return <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />;
    case "tool_result": return <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-1" />;
    case "content_ready": return <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1" />;
    case "section_done": return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />;
    case "complete": return <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-0.5" />;
    default: return <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1" />;
  }
}

function entryColor(type: ReportLogEntry["type"]) {
  switch (type) {
    case "planning": return "text-white/40";
    case "plan_complete": return "text-emerald-400";
    case "section_start": return "text-blue-300";
    case "llm_response": return "text-purple-300";
    case "tool_call": return "text-amber-300";
    case "tool_result": return "text-amber-200/70";
    case "content_ready": return "text-teal-300";
    case "section_done": return "text-emerald-300";
    case "complete": return "text-emerald-400 font-semibold";
    default: return "text-white/50";
  }
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `+${s}s`;
}

export default function ReportGenerationLog({ entries, elapsedMs }: Props) {
  const visible = entries.filter((e) => e.offset_ms <= elapsedMs);

  return (
    <div className="flex flex-col gap-0.5">
      {visible.map((entry) => (
        <div
          key={entry.id}
          className="animate-log-entry flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0"
        >
          <div className="flex-shrink-0 mt-0.5">{entryIcon(entry.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={`text-xs ${entryColor(entry.type)}`}>{entry.label}</span>
              <span className="text-white/20 text-xs font-mono flex-shrink-0">{formatMs(entry.offset_ms)}</span>
            </div>
            {entry.detail && (
              <div className="text-white/30 text-xs mt-0.5">{entry.detail}</div>
            )}
            <ExpandableContent entry={entry} />
          </div>
        </div>
      ))}

      {visible.length === 0 && (
        <div className="flex items-center gap-2 text-white/30 text-xs py-4">
          <div className="w-3 h-3 border-2 border-blue-400/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Initializing report generation…
        </div>
      )}
    </div>
  );
}
