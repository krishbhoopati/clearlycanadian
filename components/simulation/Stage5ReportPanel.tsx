"use client";

import { useEffect, useRef, useState } from "react";
import { reportLog, reportSections } from "@/data/simulation/mapleSimulationData";
import ReportGenerationLog from "./ReportGenerationLog";

interface Props {
  onComplete: () => void;
}

const SPEED = 15;

export default function Stage5ReportPanel({ onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [unlockedSections, setUnlockedSections] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const logScrollRef = useRef<HTMLDivElement>(null);

  function handleStartReport() {
    setStarted(true);
    startTimeRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      const effectiveMs = elapsed * SPEED;
      setElapsedMs(effectiveMs);

      // Unlock sections based on section_done events
      reportLog.forEach((entry) => {
        if (entry.type === "section_done" && entry.section && effectiveMs >= entry.offset_ms) {
          setUnlockedSections((prev) => prev.includes(entry.section!) ? prev : [...prev, entry.section!]);
        }
        if (entry.type === "complete" && effectiveMs >= entry.offset_ms) {
          setDone(true);
        }
      });

      const maxOffset = Math.max(...reportLog.map((e) => e.offset_ms));
      if (effectiveMs < maxOffset + 2000) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Auto-scroll log panel to bottom as new entries appear
  useEffect(() => {
    const el = logScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [elapsedMs]);

  return (
    <div className="flex flex-col gap-4">
      {!started ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-slate-500 text-sm text-center max-w-xs">
            The simulation has completed. Generate a comprehensive research report from the 1,247-agent swarm data.
          </div>
          <button
            onClick={handleStartReport}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all duration-200"
          >
            Generate Report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[55fr_45fr] gap-4">
          {/* Left: Live Report */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-y-auto light-scroll max-h-[calc(100vh-200px)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-slate-600 text-sm font-medium">CC Maple Zero Sugar — Swarm Intelligence Report</span>
            </div>

            {[1, 2, 3, 4, 5].map((sectionNum) => {
              const isUnlocked = unlockedSections.includes(sectionNum);
              const isGenerating = !isUnlocked && started && reportLog.some(
                (e) => e.type === "section_start" && e.section === sectionNum && e.offset_ms <= elapsedMs
              );

              return (
                <div key={sectionNum} className="mb-6">
                  {isUnlocked ? (
                    <div className="animate-sim-post-in">
                      <div className="prose prose-sm max-w-none">
                        {reportSections[sectionNum]?.split("\n").map((line, i) => {
                          if (line.startsWith("## ")) {
                            return (
                              <h2 key={i} className="text-slate-800 font-bold text-xl mt-6 mb-3 pb-2 border-b border-slate-100 first:mt-0">
                                {line.slice(3)}
                              </h2>
                            );
                          }
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return (
                              <h3 key={i} className="text-slate-700 font-bold text-base mt-5 mb-2">
                                {line.slice(2, -2)}
                              </h3>
                            );
                          }
                          // numbered list: "1. **Title** — rest"
                          const numMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
                          if (numMatch) {
                            return (
                              <div key={i} className="flex gap-3 mb-3 ml-1">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                  {numMatch[1]}
                                </span>
                                <p className="text-slate-600 text-base leading-relaxed">
                                  <strong className="text-slate-800 font-semibold">{numMatch[2]}</strong>
                                  {numMatch[3]}
                                </p>
                              </div>
                            );
                          }
                          // bullet: "- **Name** — text" or "- text"
                          if (line.startsWith("- ")) {
                            const bulletBoldMatch = line.slice(2).match(/^\*\*(.+?)\*\*(.*)$/);
                            return (
                              <div key={i} className="flex gap-2.5 mb-2 ml-1">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5" />
                                <p className="text-slate-600 text-base leading-relaxed">
                                  {bulletBoldMatch ? (
                                    <>
                                      <strong className="text-slate-800 font-semibold">{bulletBoldMatch[1]}</strong>
                                      {bulletBoldMatch[2]}
                                    </>
                                  ) : line.slice(2)}
                                </p>
                              </div>
                            );
                          }
                          if (line.trim() === "") return <div key={i} className="h-3" />;
                          // inline bold
                          const parts = line.split(/\*\*(.+?)\*\*/g);
                          return (
                            <p key={i} className="text-slate-600 text-base leading-relaxed mb-2.5">
                              {parts.map((part, j) =>
                                j % 2 === 1
                                  ? <strong key={j} className="text-slate-800 font-semibold">{part}</strong>
                                  : part
                              )}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ) : isGenerating ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-3">
                      <div className="w-3 h-3 border-2 border-orange-400/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      Writing section {sectionNum}…
                      <span className="animate-report-cursor ml-1">|</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Right: AI Thinking */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col max-h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">AI Thinking</div>
              <div className="text-slate-400 text-xs font-mono">{(elapsedMs / 1000).toFixed(1)}s</div>
            </div>
            <div ref={logScrollRef} className="flex-1 overflow-y-auto light-scroll">
              <ReportGenerationLog entries={reportLog} elapsedMs={elapsedMs} />
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all duration-200"
          >
            Deep Interaction
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
