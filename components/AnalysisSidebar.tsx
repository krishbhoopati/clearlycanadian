"use client";

import type { AskLabResponse, AnalysisResult } from "@/lib/types";

interface AnalysisSidebarProps {
  result?: AskLabResponse;
  aiAnalysis?: AnalysisResult | null;
  onFollowUpClick?: (question: string) => void;
}

function getSignal(score: number): { label: string; color: string; bg: string } {
  if (score >= 65) return { label: "Positive", color: "#059669", bg: "#ecfdf5" };
  if (score <= 40) return { label: "Low Signal", color: "#dc2626", bg: "#fef2f2" };
  return { label: "Mixed", color: "#d97706", bg: "#fffbeb" };
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; iconColor: string }> = {
  high:   { bg: "bg-red-50",    border: "border-red-100",    iconColor: "text-red-600" },
  medium: { bg: "bg-blue-50",   border: "border-blue-100",   iconColor: "text-blue-600" },
  low:    { bg: "bg-gray-50",   border: "border-gray-100",   iconColor: "text-gray-500" },
};

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high:   "bg-red-100 text-red-700",
    medium: "bg-blue-100 text-blue-700",
    low:    "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[priority] ?? colors.medium}`}>
      {priority}
    </span>
  );
}

function AIAnalysisView({
  analysis,
  onFollowUpClick,
}: {
  analysis: AnalysisResult;
  onFollowUpClick?: (q: string) => void;
}) {
  const score = Math.round(analysis.net_resonance);
  const signal = getSignal(score);
  const { positive, friction, neutral, negative } = analysis.sentiment_distribution;
  const total = positive + friction + neutral + negative || 1;

  return (
    <div className="w-[420px] bg-[#e8eff5] rounded-tl-[40px] shadow-[-20px_0_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden shrink-0 border-l border-white/10">
      <div className="h-20 border-b border-gray-200/60 bg-white/40 flex items-center px-8 gap-3">
        <span className="text-xl font-semibold text-gray-900">Analysis Summary</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700">
          AI
        </span>
      </div>

      <div className="flex-1 overflow-y-auto light-scroll p-8 flex flex-col gap-8">
        {/* Net Resonance */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest">
              Net Resonance
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: signal.bg, color: signal.color }}
            >
              {signal.label}
            </span>
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-3">
            {score}
            <span className="text-xl font-normal text-gray-400">/100</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {analysis.key_insight}
          </p>

          {/* Sentiment distribution bar */}
          <div className="mt-5 flex gap-0.5 h-2.5 rounded-full overflow-hidden">
            {positive > 0 && (
              <div
                className="bg-emerald-500 rounded-l-full first:rounded-l-full"
                style={{ width: `${(positive / total) * 100}%` }}
              />
            )}
            {friction > 0 && (
              <div
                className="bg-amber-400"
                style={{ width: `${(friction / total) * 100}%` }}
              />
            )}
            {neutral > 0 && (
              <div
                className="bg-gray-300"
                style={{ width: `${(neutral / total) * 100}%` }}
              />
            )}
            {negative > 0 && (
              <div
                className="bg-red-400 last:rounded-r-full"
                style={{ width: `${(negative / total) * 100}%` }}
              />
            )}
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-gray-500 font-mono">
            {positive > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{positive} Positive</span>}
            {friction > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{friction} Friction</span>}
            {neutral > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />{neutral} Neutral</span>}
            {negative > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />{negative} Negative</span>}
          </div>
        </div>

        {/* Dominant Themes */}
        {analysis.dominant_themes.length > 0 && (
          <div>
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest block mb-3">
              Dominant Themes
            </span>
            <div className="flex flex-wrap gap-2">
              {analysis.dominant_themes.map((t, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-700 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-semibold">#</span>
                    <span className="font-medium">
                      {t.theme.length > 30 ? t.theme.slice(0, 30) + "…" : t.theme}
                    </span>
                    {t.persona_count > 0 && (
                      <span className="text-gray-400 text-[10px] font-mono">
                        {t.persona_count}p
                      </span>
                    )}
                  </div>
                  {t.evidence && (
                    <p className="text-gray-400 text-xs leading-snug pl-5">
                      {t.evidence.length > 60
                        ? t.evidence.slice(0, 60) + "…"
                        : t.evidence}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Recommendations */}
        {analysis.strategic_recommendations.length > 0 && (
          <div>
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest block mb-3">
              Strategic Recommendations
            </span>
            <div className="flex flex-col gap-3">
              {analysis.strategic_recommendations.map((rec, i) => {
                const ps = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.medium;
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-blue-200 transition-colors`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${ps.bg} flex items-center justify-center shrink-0`}
                    >
                      <svg
                        className={`w-4 h-4 ${ps.iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900 text-sm font-semibold leading-snug">
                          {rec.action}
                        </p>
                        <PriorityBadge priority={rec.priority} />
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {analysis.risk_factors.length > 0 && (
          <div>
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest block mb-3">
              Risk Factors
            </span>
            <div className="flex flex-col gap-2">
              {analysis.risk_factors.map((risk, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {analysis.follow_up_questions.length > 0 && (
          <div>
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest block mb-3">
              Explore Further
            </span>
            <div className="flex flex-col gap-2">
              {analysis.follow_up_questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUpClick?.(q)}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl px-4 py-3 text-sm text-gray-700 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExistingAnalysisView({ result }: { result: AskLabResponse }) {
  const score = Math.round(result.confidence * 100);
  const signal = getSignal(score);

  const summaryTruncated =
    result.overall_summary.length > 160
      ? result.overall_summary.slice(0, 160) + "…"
      : result.overall_summary;

  return (
    <div className="w-[420px] bg-[#e8eff5] rounded-tl-[40px] shadow-[-20px_0_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden shrink-0 border-l border-white/10">
      <div className="h-20 border-b border-gray-200/60 bg-white/40 flex items-center px-8">
        <span className="text-xl font-semibold text-gray-900">
          Analysis Summary
        </span>
      </div>

      <div className="flex-1 overflow-y-auto light-scroll p-8 flex flex-col gap-8">
        {/* Net Resonance card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest">
              Net Resonance
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: signal.bg, color: signal.color }}
            >
              {signal.label}
            </span>
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-3">
            {score}
            <span className="text-xl font-normal text-gray-400">/100</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {summaryTruncated}
          </p>
        </div>

        {/* Dominant Themes */}
        {result.top_drivers.length > 0 && (
          <div>
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest block mb-3">
              Dominant Themes
            </span>
            <div className="flex flex-wrap gap-2">
              {result.top_drivers.map((driver, i) => (
                <span
                  key={i}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-sm text-gray-700 flex items-center gap-2"
                >
                  <span className="text-blue-500 font-semibold">#</span>
                  {driver.length > 35 ? driver.slice(0, 35) + "…" : driver}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Actions */}
        <div>
          <span className="font-mono text-gray-500 text-xs uppercase tracking-widest block mb-3">
            Strategic Actions
          </span>
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-blue-200 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {result.strategic_takeaway}
              </p>
            </div>

            {result.key_disagreements[0] && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-emerald-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {result.key_disagreements[0]}
                </p>
              </div>
            )}

            {result.segments_to_watch[0] && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-amber-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {result.segments_to_watch[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisSidebar({
  result,
  aiAnalysis,
  onFollowUpClick,
}: AnalysisSidebarProps) {
  if (aiAnalysis) {
    return (
      <AIAnalysisView
        analysis={aiAnalysis}
        onFollowUpClick={onFollowUpClick}
      />
    );
  }
  if (result) {
    return <ExistingAnalysisView result={result} />;
  }
  return null;
}
