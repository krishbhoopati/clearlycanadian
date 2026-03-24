"use client";

import { useState } from "react";
import type { ReportLogEntry, ReportInterview } from "@/lib/types";

interface Props {
  entries: ReportLogEntry[];
  elapsedMs: number;
}

function InterviewCard({ interview }: { interview: ReportInterview }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
          style={{ backgroundColor: interview.avatar_color }}
        >
          {interview.agent_name[0]}
        </div>
        <div>
          <div className="text-slate-700 font-medium">{interview.agent_name}</div>
          <div className="text-slate-400">{interview.role}</div>
        </div>
      </div>
      {interview.qa.map((pair, i) => (
        <div key={i} className="mb-1.5">
          <div className="text-slate-400 mb-0.5">Q: {pair.q}</div>
          <div className="text-slate-600 leading-relaxed">A: {pair.a}</div>
        </div>
      ))}
      {interview.key_quotes.length > 0 && (
        <div className="mt-2 border-l-2 border-orange-400 pl-2">
          <div className="text-orange-600/80 italic">"{interview.key_quotes[0]}"</div>
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
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors duration-150"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-500">{expandable.summary}</span>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-col gap-1.5">
          {expandable.type === "memory_list" && expandable.items && (
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto light-scroll">
              {expandable.items.map((item, i) => (
                <div key={i} className="text-slate-500 text-xs flex items-start gap-1.5">
                  <span className="text-slate-300 flex-shrink-0 font-mono">{String(i + 1).padStart(2, "0")}</span>
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
                <div key={i} className="text-slate-600 text-xs flex items-start gap-1.5">
                  <span className="text-emerald-600 flex-shrink-0">→</span>
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
    case "planning": return <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1" />;
    case "plan_complete": return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />;
    case "section_start": return <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />;
    case "llm_response": return <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1" />;
    case "tool_call": return <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1" />;
    case "tool_result": return <div className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-1" />;
    case "content_ready": return <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1" />;
    case "section_done": return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />;
    case "complete": return <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-0.5" />;
    default: return <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1" />;
  }
}

function entryColor(type: ReportLogEntry["type"]) {
  switch (type) {
    case "planning": return "text-slate-400";
    case "plan_complete": return "text-emerald-600";
    case "section_start": return "text-blue-600";
    case "llm_response": return "text-violet-600";
    case "tool_call": return "text-orange-600 font-medium";
    case "tool_result": return "text-orange-500";
    case "content_ready": return "text-teal-600";
    case "section_done": return "text-emerald-600";
    case "complete": return "text-emerald-700 font-semibold";
    default: return "text-slate-500";
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
          className="animate-log-entry flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0"
        >
          <div className="flex-shrink-0 mt-0.5">{entryIcon(entry.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={`text-xs ${entryColor(entry.type)}`}>{entry.label}</span>
              <span className="text-slate-300 text-xs font-mono flex-shrink-0">{formatMs(entry.offset_ms)}</span>
            </div>
            {entry.detail && (
              <div className="text-slate-400 text-xs mt-0.5">{entry.detail}</div>
            )}
            <ExpandableContent entry={entry} />
          </div>
        </div>
      ))}

      {visible.length === 0 && (
        <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
          <div className="w-3 h-3 border-2 border-orange-400/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Initializing report generation…
        </div>
      )}
    </div>
  );
}
