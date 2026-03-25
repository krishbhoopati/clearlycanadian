"use client";

import { useEffect, useState } from "react";

interface Props {
  currentDataIdx: number; // 0–7, advances as simulation progresses
  eventCount?: number;
}

// All signals are positive — hardcoded targets that animate live
const TARGET_NET       = 54;   // final net sentiment score
const TARGET_POSITIVE  = 68;   // % positive reach
const TARGET_MOMENTUM  = 12;   // % lift vs baseline
const TARGET_TRIAL     = 67;   // % trial intent
const TOTAL_EVENTS     = 1847;

const INSIGHTS = [
  { headline: "Gen X nostalgia trigger activating across the network",           stat: "42% nostalgic recall rate",                    type: "positive" },
  { headline: "Bartender community organically amplifying via cocktail content", stat: "3.4× engagement multiplier detected",          type: "positive" },
  { headline: "Sober-curious segment showing highest trial intent",              stat: "67% intent-to-try among NA seekers",           type: "positive" },
  { headline: "Premium buyers responding to glass bottle aesthetic signal",      stat: "+$2.40 avg price tolerance vs LaCroix",        type: "positive" },
  { headline: "Buy-Canadian sentiment driving strong cross-segment unity",       stat: "+38% purchase intent lift since tariff shift", type: "positive" },
  { headline: "Gen Z creating viral cocktail content on TikTok",                 stat: "8.1M potential reach via #CCMaple",             type: "positive" },
  { headline: "Maple positioning resonating with premium on-premise buyers",     stat: "4.2× bar menu conversion vs sparkling water",  type: "positive" },
  { headline: "Strong NPS signal — well above category benchmark",               stat: "Net Sentiment +54 vs industry avg +22",        type: "positive" },
];

const SEGMENTS = [
  { label: "Millennial",    pct: 31, color: "#3B82F6" },
  { label: "Gen Z",         pct: 28, color: "#8B5CF6" },
  { label: "Gen X",         pct: 24, color: "#F59E0B" },
  { label: "Sober Curious", pct: 17, color: "#A855F7" },
];

export default function Stage3SentimentChart({ currentDataIdx, eventCount = 0 }: Props) {
  const [visible, setVisible] = useState(true);
  const [shownIdx, setShownIdx] = useState(0);

  // Fade out → swap insight → fade in when idx changes
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setShownIdx(Math.min(currentDataIdx, INSIGHTS.length - 1));
      setVisible(true);
    }, 300);
    return () => clearTimeout(t);
  }, [currentDataIdx]);

  // All stats count up from 0 to their target as eventCount grows
  const progress = Math.min(eventCount / TOTAL_EVENTS, 1);
  const displayedNet      = Math.round(TARGET_NET      * progress);
  const displayedPositive = Math.round(TARGET_POSITIVE * progress);
  const displayedMomentum = Math.round(TARGET_MOMENTUM * progress);
  const displayedTrial    = Math.round(TARGET_TRIAL    * progress);

  const insight = INSIGHTS[shownIdx];

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Three live stats — all consistent, all positive */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Net Sentiment</div>
          <div className="text-emerald-600 font-bold text-3xl font-mono">+{displayedNet}</div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${displayedPositive}%` }}
            />
          </div>
          <div className="text-slate-400 text-xs mt-0.5">{displayedPositive}% positive reach</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Momentum</div>
          <div className="text-emerald-500 font-bold text-3xl font-mono">↑ +{displayedMomentum}%</div>
          <div className="text-slate-400 text-xs mt-2">vs simulation baseline</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Trial Intent</div>
          <div className="text-blue-500 font-bold text-3xl font-mono">{displayedTrial}%</div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${displayedTrial}%` }}
            />
          </div>
          <div className="text-slate-400 text-xs mt-0.5">intent-to-try detected</div>
        </div>
      </div>

      {/* Row 2: Live rotating insight */}
      <div
        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-700 border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Signal
          </span>
          <span className="text-slate-400 text-[10px]">Signal {shownIdx + 1} of {INSIGHTS.length}</span>
        </div>
        <p className="text-slate-700 text-sm font-semibold leading-snug mb-1">{insight.headline}</p>
        <p className="text-emerald-600 text-xs font-medium">{insight.stat}</p>
      </div>

      {/* Row 3: Segment activity bars */}
      <div>
        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Segment Activity</div>
        <div className="flex flex-col gap-2">
          {SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="text-slate-500 text-xs w-24 flex-shrink-0">{seg.label}</div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: eventCount > 0 ? `${seg.pct}%` : "0%",
                    backgroundColor: seg.color,
                  }}
                />
              </div>
              <div className="text-slate-400 text-xs w-8 text-right">{seg.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
