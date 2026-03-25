"use client";

import type { ReportLogEntry, ReportInterview } from "@/lib/types";

interface Props {
  entries: ReportLogEntry[];
  elapsedMs: number;
}

function InterviewCard({ interview }: { interview: ReportInterview }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
          style={{ backgroundColor: interview.avatar_color }}
        >
          {interview.agent_name[0]}
        </div>
        <div>
          <div className="text-slate-700 text-sm font-semibold">{interview.agent_name}</div>
          <div className="text-slate-400 text-sm">{interview.role}</div>
        </div>
      </div>
      {interview.qa.slice(0, 1).map((pair, i) => (
        <div key={i}>
          <div className="text-slate-400 text-sm mb-0.5">Q: {pair.q}</div>
          <div className="text-slate-600 text-sm leading-relaxed">A: {pair.a}</div>
        </div>
      ))}
      {interview.key_quotes.length > 0 && (
        <div className="mt-2 border-l-2 border-orange-300 pl-2">
          <div className="text-orange-600 text-sm italic">"{interview.key_quotes[0]}"</div>
        </div>
      )}
    </div>
  );
}

function ExpandableItems({ entry }: { entry: ReportLogEntry }) {
  if (!entry.expandable) return null;
  const { expandable } = entry;

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {expandable.type === "memory_list" && expandable.items && (
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {expandable.items.map((item, i) => (
            <div key={i} className="text-slate-500 text-sm flex items-start gap-1.5">
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
            <div key={i} className="text-slate-600 text-sm flex items-start gap-1.5">
              <span className="text-emerald-500 flex-shrink-0">→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatMs(ms: number) {
  const s = (ms / 1000).toFixed(1);
  return `+${s}s`;
}

const TYPE_LABEL: Record<ReportLogEntry["type"], string> = {
  planning: "PLANNING",
  plan_complete: "PLAN COMPLETE",
  section_start: "SECTION START",
  llm_response: "LLM RESPONSE",
  tool_call: "TOOL CALL",
  tool_result: "TOOL RESULT",
  content_ready: "CONTENT READY",
  section_done: "SECTION DONE",
  complete: "COMPLETE",
};

const TYPE_DOT: Record<ReportLogEntry["type"], string> = {
  planning: "bg-slate-300",
  plan_complete: "bg-emerald-400",
  section_start: "bg-blue-400",
  llm_response: "bg-violet-400",
  tool_call: "bg-orange-400",
  tool_result: "bg-orange-300",
  content_ready: "bg-teal-400",
  section_done: "bg-emerald-500",
  complete: "bg-emerald-500 animate-pulse",
};

function EntryCard({ entry }: { entry: ReportLogEntry }) {
  const { type, label, detail, offset_ms } = entry;

  const toolName = type === "tool_call" || type === "tool_result"
    ? label.replace("Tool Call — ", "").replace("Tool Result — ", "")
    : null;

  const iterationMatch = type === "llm_response" ? label.match(/Iteration (\d+)/) : null;
  const iterationNum = iterationMatch ? iterationMatch[1] : null;

  const toolsYes = type === "llm_response" && detail?.includes("Tools: Yes");
  const isFinal = type === "llm_response" && detail?.includes("Final: Yes");

  return (
    <div className="animate-log-entry py-4 border-b border-slate-100 last:border-0">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${TYPE_DOT[type]}`} />
          <span className="text-slate-600 text-sm font-bold tracking-widest uppercase">
            {TYPE_LABEL[type] ?? type.toUpperCase()}
          </span>
        </div>
        <span className="text-slate-400 text-sm font-mono">{formatMs(offset_ms)}</span>
      </div>

      {/* Content area */}
      {type === "planning" && (
        <div className="ml-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
          <p className="text-slate-600 text-base">{detail?.replace(/^\d+:\d+:\d+ — /, "")}</p>
        </div>
      )}

      {type === "plan_complete" && (
        <div className="ml-4 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
          <p className="text-emerald-700 text-base font-medium">{detail?.replace(/^\+[\d.]+s — /, "")}</p>
        </div>
      )}

      {type === "section_start" && (
        <div className="ml-4">
          <span className="text-blue-500 text-sm font-bold uppercase tracking-wider block mb-1">
            {label.replace("Section Start — ", "")}
          </span>
          <p className="text-slate-600 text-base leading-relaxed">{detail}</p>
        </div>
      )}

      {type === "llm_response" && (
        <div className="ml-4">
          <div className="flex items-center gap-2 flex-wrap">
            {iterationNum && (
              <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                Iteration {iterationNum}
              </span>
            )}
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${toolsYes ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
              Tools: {toolsYes ? "Yes" : "No"}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${isFinal ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
              Final: {isFinal ? "Yes" : "No"}
            </span>
          </div>
        </div>
      )}

      {type === "tool_call" && toolName && (
        <div className="ml-4">
          <span className="inline-flex items-center gap-2 text-base px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            {toolName}
          </span>
        </div>
      )}

      {type === "tool_result" && (
        <div className="ml-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
          <span className="text-slate-700 text-base font-semibold block mb-1">{toolName}</span>
          <p className="text-slate-500 text-base">{detail}</p>
          <ExpandableItems entry={entry} />
        </div>
      )}

      {type === "content_ready" && (
        <div className="ml-4 bg-teal-50 border border-teal-100 rounded-lg px-4 py-3">
          <p className="text-teal-700 text-base font-medium">Section {entry.section} content ready — writing to report</p>
        </div>
      )}

      {type === "section_done" && (
        <div className="ml-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-emerald-600 text-base font-medium">{detail}</p>
        </div>
      )}

      {type === "complete" && (
        <div className="ml-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <p className="text-emerald-700 text-base font-semibold">Report generation complete</p>
        </div>
      )}
    </div>
  );
}

export default function ReportGenerationLog({ entries, elapsedMs }: Props) {
  const visible = entries.filter((e) => e.offset_ms <= elapsedMs);

  if (visible.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-base py-6">
        <div className="w-4 h-4 border-2 border-orange-400/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        Initializing report generation…
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {visible.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
