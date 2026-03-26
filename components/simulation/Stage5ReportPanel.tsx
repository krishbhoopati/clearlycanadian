"use client";

import { useEffect, useRef, useState } from "react";
import { reportLog, reportSections } from "@/data/simulation/mapleSimulationData";
import ReportGenerationLog from "./ReportGenerationLog";

interface Props {
  onComplete: () => void;
}

const SPEED = 15;

const SECTION_LABELS: Record<number, string> = {
  1: "STP & Consumer Behavior",
  2: "Marketing Mix & Distribution",
  3: "Launch Roadmap & KPIs",
  4: "Competitor Benchmarks",
  5: "Risk & Failure Analysis",
};

function renderLine(line: string, i: number) {
  // Section heading ## → skip, handled by wrapper
  if (line.startsWith("## ")) return null;

  // Standalone bold line → subheading
  if (line.startsWith("**") && line.endsWith("**")) {
    return (
      <h4 key={i} className="text-slate-800 font-bold text-base mt-6 mb-2 leading-snug">
        {line.slice(2, -2)}
      </h4>
    );
  }

  // Numbered list: "1. **Title** — rest"
  const numMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
  if (numMatch) {
    return (
      <div key={i} className="flex gap-3 mb-3 ml-1">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
          {numMatch[1]}
        </span>
        <p className="text-slate-600 text-sm leading-relaxed">
          <strong className="text-slate-800 font-semibold">{numMatch[2]}</strong>
          {numMatch[3]}
        </p>
      </div>
    );
  }

  // Bullet: "- **Name** — text" or "- text"
  if (line.startsWith("- ")) {
    const bulletBoldMatch = line.slice(2).match(/^\*\*(.+?)\*\*(.*)$/);
    return (
      <div key={i} className="flex gap-2.5 mb-2.5 ml-1">
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
        <p className="text-slate-600 text-sm leading-relaxed">
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

  // Inline bold in body paragraph
  const parts = line.split(/\*\*(.+?)\*\*/g);
  return (
    <p key={i} className="text-slate-600 text-sm leading-relaxed mb-3">
      {parts.map((part, j) =>
        j % 2 === 1
          ? <strong key={j} className="text-slate-800 font-semibold">{part}</strong>
          : part
      )}
    </p>
  );
}

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

  useEffect(() => {
    const el = logScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
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
        <div className="grid grid-cols-[38fr_62fr] gap-4">

          {/* Left: Live Report */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto light-scroll max-h-[calc(100vh-200px)]">

            {/* Report header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                  Swarm Report
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              </div>
              <h1 className="text-slate-900 font-extrabold text-2xl leading-tight mb-2">
                CC Maple Zero Sugar
              </h1>
              <p className="text-slate-500 text-xs leading-relaxed">
                1,247-agent swarm intelligence synthesis across 5 research sections — consumer behavior, marketing mix, launch roadmap, competitor benchmarks, and risk analysis.
              </p>
            </div>

            {/* Sections */}
            <div className="px-6 py-4 flex flex-col gap-1">
              {[1, 2, 3, 4, 5].map((sectionNum) => {
                const isUnlocked = unlockedSections.includes(sectionNum);
                const isGenerating = !isUnlocked && started && reportLog.some(
                  (e) => e.type === "section_start" && e.section === sectionNum && e.offset_ms <= elapsedMs
                );

                return (
                  <div key={sectionNum} className="border-b border-slate-100 last:border-0 pb-4 mb-2 last:pb-0 last:mb-0">
                    {/* Section number + title row */}
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-slate-300 font-black text-2xl tabular-nums leading-none select-none flex-shrink-0">
                        {String(sectionNum).padStart(2, "0")}
                      </span>
                      <h3 className={`font-bold text-base leading-snug ${isUnlocked ? "text-slate-800" : "text-slate-400"}`}>
                        {SECTION_LABELS[sectionNum]}
                      </h3>
                    </div>

                    {isUnlocked ? (
                      <div className="animate-sim-post-in">
                        {reportSections[sectionNum]?.split("\n").map((line, i) => renderLine(line, i))}
                      </div>
                    ) : isGenerating ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                        <div className="w-3 h-3 border-2 border-orange-400/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        Writing section {sectionNum}…
                        <span className="animate-report-cursor ml-1">|</span>
                      </div>
                    ) : (
                      <div className="text-slate-300 text-xs">Pending…</div>
                    )}
                  </div>
                );
              })}
            </div>
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
