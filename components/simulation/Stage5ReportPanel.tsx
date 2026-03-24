"use client";

import { useEffect, useRef, useState } from "react";
import { reportLog, reportSections } from "@/data/simulation/mapleSimulationData";
import ReportGenerationLog from "./ReportGenerationLog";

interface Props {
  onComplete: () => void;
}

export default function Stage5ReportPanel({ onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [unlockedSections, setUnlockedSections] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  function handleStartReport() {
    setStarted(true);
    startTimeRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      setElapsedMs(elapsed);

      // Unlock sections based on section_done events
      reportLog.forEach((entry) => {
        if (entry.type === "section_done" && entry.section && elapsed >= entry.offset_ms) {
          setUnlockedSections((prev) => prev.includes(entry.section!) ? prev : [...prev, entry.section!]);
        }
        if (entry.type === "complete" && elapsed >= entry.offset_ms) {
          setDone(true);
        }
      });

      const maxOffset = Math.max(...reportLog.map((e) => e.offset_ms));
      if (elapsed < maxOffset + 2000) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {!started ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-white/50 text-sm text-center max-w-xs">
            The simulation has completed. Generate a comprehensive research report from the 1,247-agent swarm data.
          </div>
          <button
            onClick={handleStartReport}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200"
          >
            Generate Report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">
          {/* Report text (55%) */}
          <div className="lg:w-[55%] flex flex-col gap-4">
            <div className="glass-dark rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-white/60 text-sm font-medium">CC Maple Zero Sugar — Swarm Intelligence Report</span>
              </div>

              {[1, 2, 3].map((sectionNum) => {
                const isUnlocked = unlockedSections.includes(sectionNum);
                const isGenerating = !isUnlocked && started && reportLog.some(
                  (e) => e.type === "section_start" && e.section === sectionNum && e.offset_ms <= elapsedMs
                );

                return (
                  <div key={sectionNum} className="mb-6">
                    {isUnlocked ? (
                      <div className="animate-sim-post-in">
                        <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                          {reportSections[sectionNum]?.split("\n").map((line, i) => {
                            if (line.startsWith("## ")) {
                              return <h3 key={i} className="text-white font-bold text-base mb-2 mt-3">{line.slice(3)}</h3>;
                            }
                            if (line.startsWith("**") && line.endsWith("**")) {
                              return <strong key={i} className="text-white/90 block mb-1">{line.slice(2, -2)}</strong>;
                            }
                            if (line.startsWith("- ")) {
                              return <li key={i} className="text-white/65 ml-4 mb-0.5 text-sm">{line.slice(2)}</li>;
                            }
                            if (line.trim() === "") return <div key={i} className="h-2" />;
                            return <p key={i} className="text-white/65 mb-1.5 text-sm">{line}</p>;
                          })}
                        </div>
                      </div>
                    ) : isGenerating ? (
                      <div className="flex items-center gap-2 text-white/30 text-xs py-3">
                        <div className="w-3 h-3 border-2 border-blue-400/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        Writing section {sectionNum}…
                        <span className="animate-report-cursor ml-1">|</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generation Log (45%) */}
          <div className="lg:w-[45%] flex flex-col gap-2">
            <div className="glass-dark rounded-xl p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">Generation Log</div>
                <div className="text-white/25 text-xs font-mono">{(elapsedMs / 1000).toFixed(1)}s</div>
              </div>
              <div className="max-h-[500px] overflow-y-auto dark-scroll">
                <ReportGenerationLog entries={reportLog} elapsedMs={elapsedMs} />
              </div>
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200"
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
