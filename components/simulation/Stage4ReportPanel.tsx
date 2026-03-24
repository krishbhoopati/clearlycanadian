"use client";

import { useEffect, useState } from "react";
import { reportText } from "@/data/simulation/mapleSimulationData";

interface Props {
  onComplete: () => void;
}

// Simple inline markdown renderer
function renderMd(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    const key = i;
    if (line.startsWith("## ")) {
      return <h2 key={key} className="text-white font-bold text-lg mt-6 mb-2">{renderInline(line.slice(3))}</h2>;
    }
    if (line.startsWith("### ")) {
      return <h3 key={key} className="text-white/90 font-semibold text-base mt-4 mb-1">{renderInline(line.slice(4))}</h3>;
    }
    if (line.startsWith("---")) {
      return <hr key={key} className="border-white/10 my-3" />;
    }
    if (line.match(/^\d+\.\s/)) {
      return <div key={key} className="flex gap-2 my-1"><span className="text-blue-400 flex-shrink-0">{line.match(/^\d+/)![0]}.</span><span className="text-white/70 text-sm">{renderInline(line.replace(/^\d+\.\s/, ""))}</span></div>;
    }
    if (line.startsWith("- ")) {
      return <div key={key} className="flex gap-2 my-0.5"><span className="text-white/30 flex-shrink-0 mt-0.5">–</span><span className="text-white/70 text-sm">{renderInline(line.slice(2))}</span></div>;
    }
    if (line.trim() === "") return <div key={key} className="h-1" />;
    return <p key={key} className="text-white/70 text-sm leading-relaxed">{renderInline(line)}</p>;
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const SENTIMENT_DIST = [
  { label: "Strong Positive", count: 5, agents: "Ethan, Raj, Marie, Linda, Jake", color: "#10B981", pct: 42 },
  { label: "Positive", count: 3, agents: "Aisha, Marcus, Chloe", color: "#34D399", pct: 25 },
  { label: "Neutral", count: 2, agents: "Sofia, Karen H.", color: "#F59E0B", pct: 17 },
  { label: "Friction", count: 1, agents: "Doug", color: "#F97316", pct: 8 },
  { label: "Indifferent", count: 1, agents: "Tyler", color: "#6B7280", pct: 8 },
];

const THEMES = [
  { label: "Cocktail/Mixer Potential", count: 7 },
  { label: "Canadian Identity", count: 6 },
  { label: "Tourist Channel Opportunity", count: 5 },
  { label: "Price vs LaCroix", count: 4 },
  { label: "Glass Bottle Aesthetic", count: 4 },
  { label: "Nostalgia Trigger", count: 3 },
];

export default function Stage4ReportPanel({ onComplete }: Props) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    let i = 0;
    const SPEED = 2; // chars per tick
    const iv = setInterval(() => {
      i += SPEED;
      setDisplayed(reportText.slice(0, i));
      if (i >= reportText.length) {
        clearInterval(iv);
        setDone(true);
        setShowCharts(true);
        setTimeout(onComplete, 2000);
      }
    }, 10);
    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <h3 className="text-white font-semibold text-lg">Report Generation</h3>
        {done && <span className="text-emerald-400 text-sm ml-auto">Complete ✓</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report text */}
        <div className="lg:col-span-2 glass-dark rounded-xl p-6 max-h-[600px] overflow-y-auto dark-scroll">
          <div>
            {renderMd(displayed)}
            {!done && <span className="animate-report-cursor text-blue-400 text-sm">|</span>}
          </div>
        </div>

        {/* Sidebar charts */}
        <div className="flex flex-col gap-4">
          {/* Sentiment distribution */}
          <div className="glass-dark rounded-xl p-5">
            <div className="text-white/60 text-xs font-medium mb-3">Sentiment Distribution (12 featured agents)</div>
            <div className="flex flex-col gap-2.5">
              {SENTIMENT_DIST.map(({ label, count, agents, color, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">{label}</span>
                    <span className="text-white/40">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: showCharts ? `${pct}%` : "0%",
                        backgroundColor: color,
                        transitionDelay: `${SENTIMENT_DIST.indexOf(SENTIMENT_DIST.find(s => s.label === label)!) * 100}ms`,
                      }}
                    />
                  </div>
                  <div className="text-white/25 text-xs mt-0.5 truncate">{agents}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key themes */}
          <div className="glass-dark rounded-xl p-5">
            <div className="text-white/60 text-xs font-medium mb-3">Key Themes</div>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(({ label, count }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1"
                >
                  <span className="text-blue-300 text-xs">{label}</span>
                  <span className="text-blue-400/60 text-xs font-mono">{count}/12</span>
                </div>
              ))}
            </div>
          </div>

          {done && (
            <div className="glass-dark rounded-xl p-4 border border-emerald-500/20">
              <div className="text-emerald-400 text-xs font-medium mb-2">Report Complete</div>
              <div className="text-white/40 text-xs">Advancing to Deep Interaction…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
