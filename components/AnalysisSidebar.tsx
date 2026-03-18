"use client";

import type { AskLabResponse } from "@/lib/types";

interface AnalysisSidebarProps {
  result: AskLabResponse;
}

export default function AnalysisSidebar({ result }: AnalysisSidebarProps) {
  const score = Math.round(result.confidence * 100);
  let signal: { label: string; color: string; bg: string };
  if (result.confidence >= 0.65) {
    signal = { label: 'Positive', color: '#059669', bg: '#ecfdf5' };
  } else if (result.confidence <= 0.40) {
    signal = { label: 'Low Signal', color: '#dc2626', bg: '#fef2f2' };
  } else {
    signal = { label: 'Mixed', color: '#d97706', bg: '#fffbeb' };
  }

  const summaryTruncated = result.overall_summary.length > 160
    ? result.overall_summary.slice(0, 160) + '…'
    : result.overall_summary;

  return (
    <div className="w-[420px] bg-[#e8eff5] rounded-tl-[40px] shadow-[-20px_0_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden shrink-0 border-l border-white/10">
      {/* Header */}
      <div className="h-20 border-b border-gray-200/60 bg-white/40 flex items-center px-8">
        <span className="text-xl font-semibold text-gray-900">Analysis Summary</span>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto light-scroll p-8 flex flex-col gap-8">
        {/* Net Resonance card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-gray-500 text-xs uppercase tracking-widest">Net Resonance</span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: signal.bg, color: signal.color }}
            >
              {signal.label}
            </span>
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-3">
            {score}<span className="text-xl font-normal text-gray-400">/100</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{summaryTruncated}</p>
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
                  {driver.length > 35 ? driver.slice(0, 35) + '…' : driver}
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
            {/* Takeaway */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-blue-200 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{result.strategic_takeaway}</p>
            </div>

            {/* First disagreement */}
            {result.key_disagreements[0] && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-emerald-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.key_disagreements[0]}</p>
              </div>
            )}

            {/* First watch segment */}
            {result.segments_to_watch[0] && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-amber-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.segments_to_watch[0]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
