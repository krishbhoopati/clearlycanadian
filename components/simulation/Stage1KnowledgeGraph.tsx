"use client";

import { useEffect, useState } from "react";
import { graphNodes, graphLinks } from "@/data/simulation/mapleSimulationData";

interface Props {
  onComplete: () => void;
  onBeginAnalysis?: () => void;
}

const ALL_NODES = graphNodes;
const ALL_LINKS = graphLinks;
const WAVE_DELAY = 1500;
const TOTAL_WAVE_TIME = 6 * WAVE_DELAY + 1500;

const ENTITY_TYPES = [
  "CC Products", "Competitors", "Consumer Segments",
  "Retail Channels", "Tourist Destinations", "Market Data",
  "Cultural Concepts", "Digital Platforms", "Influencers",
];

const RELATION_TYPES = [
  "COMPETES_WITH", "DISTRIBUTED_AT", "TARGETS",
  "BENEFITS_FROM", "ACTIVE_ON", "ASSOCIATED_WITH",
];

const WAVES = [
  { n: 1, label: "CC Brand Core", count: 8 },
  { n: 2, label: "Competitors", count: 10 },
  { n: 3, label: "Consumer Segments", count: 14 },
  { n: 4, label: "Channels & Destinations", count: 20 },
  { n: 5, label: "Market Data & Concepts", count: 22 },
  { n: 6, label: "Digital Platforms", count: 6 },
];

type StepStatus = "pending" | "processing" | "completed";

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-md tracking-wide">
        COMPLETED
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-md tracking-wide">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        PROCESSING
      </span>
    );
  }
  return (
    <span className="bg-slate-100 text-slate-400 text-xs font-bold px-3 py-1 rounded-md tracking-wide">
      PENDING
    </span>
  );
}

function ApiPill({ method, path }: { method: string; path: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded font-mono">
        {method}
      </span>
      <span className="text-slate-500 text-xs font-mono">{path}</span>
    </div>
  );
}

function StepCard({
  n, title, status, children, orangeBorder = false,
}: {
  n: string; title: string; status: StepStatus; children: React.ReactNode; orangeBorder?: boolean;
}) {
  return (
    <div className={[
      "bg-white rounded-xl shadow-sm border overflow-hidden",
      orangeBorder ? "border-orange-300 border-l-[5px] border-l-orange-400" : "border-slate-200",
    ].join(" ")}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-slate-200 leading-none select-none">{n}</span>
            <h3 className="text-slate-800 font-bold text-lg leading-tight">{title}</h3>
          </div>
          <div className="flex-shrink-0 pt-1">
            <StatusBadge status={status} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Stage1KnowledgeGraph({ onComplete, onBeginAnalysis }: Props) {
  const [started, setStarted] = useState(false);
  const [completedWaves, setCompletedWaves] = useState<number[]>([]);
  const [graphDone, setGraphDone] = useState(false);

  function handleBeginAnalysis() {
    setStarted(true);
    onBeginAnalysis?.();
  }

  useEffect(() => {
    if (!started) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let w = 1; w <= 6; w++) {
      timers.push(setTimeout(
        () => setCompletedWaves((prev) => [...prev, w]),
        (w - 1) * WAVE_DELAY + WAVE_DELAY - 100
      ));
    }
    timers.push(setTimeout(() => setGraphDone(true), TOTAL_WAVE_TIME));
    return () => timers.forEach(clearTimeout);
  }, [started]);

  const card1Status: StepStatus = !started ? "pending" : graphDone ? "completed" : "processing";
  const card2Status: StepStatus = graphDone ? "completed" : "pending";
  const card3Status: StepStatus = graphDone ? "processing" : "pending";
  const totalMainNodes = ALL_NODES.filter((n) => !n.isMicro).length;

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Card 01 — Knowledge Extraction */}
      <StepCard n="01" title="Knowledge Extraction" status={card1Status}>
        <ApiPill method="POST" path="/api/graph/extract" />

        <p className="text-slate-600 text-base leading-relaxed mt-4 mb-4">
          LLM analyzes the seed document, extracts the reality context and simulation requirements, and automatically generates a structured ontology of entities and relationships.
        </p>

        {/* Seed doc */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5">
          <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          </svg>
          <div>
            <div className="text-slate-700 text-sm font-semibold">CC Maple Zero Sugar — Growth Strategy Brief</div>
            <div className="text-slate-400 text-xs mt-0.5">PDF · 12 pages · CC Marketing Team</div>
          </div>
        </div>

        {/* Entity types — always shown */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Generated Entity Types</div>
          <div className="flex flex-wrap gap-2">
            {ENTITY_TYPES.map((t) => (
              <span key={t} className="border border-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg bg-white">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Relation types — always shown */}
        <div className="mb-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Generated Relation Types</div>
          <div className="flex flex-wrap gap-2">
            {RELATION_TYPES.map((r) => (
              <span key={r} className="border border-slate-200 text-slate-500 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-50">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Wave progress — shown while building */}
        {started && !graphDone && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Wave Progress</div>
            <div className="flex flex-col gap-2.5">
              {WAVES.map((wave) => {
                const done = completedWaves.includes(wave.n);
                return (
                  <div key={wave.n} className="flex items-center gap-3">
                    {done ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span className={`text-sm flex-1 ${done ? "text-slate-700" : "text-slate-400"}`}>{wave.label}</span>
                    <span className={`text-xs font-mono font-medium ${done ? "text-emerald-600" : "text-slate-300"}`}>+{wave.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${(completedWaves.length / 6) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-slate-400 text-xs">{completedWaves.length}/6 waves complete</span>
              <span className="text-slate-400 text-xs font-mono">{completedWaves.reduce((s, w) => s + (WAVES[w - 1]?.count ?? 0), 0)} nodes</span>
            </div>
          </div>
        )}
      </StepCard>

      {/* Card 02 — Graph Build */}
      <StepCard n="02" title="Knowledge Graph Build" status={card2Status}>
        <ApiPill method="POST" path="/api/graph/build" />
        <p className="text-slate-600 text-base leading-relaxed mt-4">
          Based on the generated ontology, the document is automatically segmented and the knowledge graph is constructed with entities, relationships, and community summaries.
        </p>
        <div className={`mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4 text-center ${graphDone ? "animate-sim-post-in" : "opacity-30"}`}>
          <div>
            <div className="text-slate-800 font-black text-5xl tabular-nums">{totalMainNodes}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Entity Nodes</div>
          </div>
          <div>
            <div className="text-slate-800 font-black text-5xl tabular-nums">{ALL_LINKS.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Relationships</div>
          </div>
          <div>
            <div className="text-slate-800 font-black text-5xl tabular-nums">6</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Wave Types</div>
          </div>
        </div>
      </StepCard>

      {/* Begin Analysis button — sits directly above card 03 */}
      {!started && (
        <button
          onClick={handleBeginAnalysis}
          className="w-full py-3.5 rounded-xl bg-white hover:bg-white/90 text-slate-900 font-bold text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          Begin Analysis
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Card 03 — Build Complete */}
      <StepCard n="03" title="Build Complete" status={card3Status} orangeBorder={graphDone}>
        <ApiPill method="POST" path="/api/simulation/setup" />
        <p className="text-slate-600 text-base leading-relaxed mt-4 mb-5">
          The knowledge graph construction is complete. Please proceed to the next step: setting up the simulation environment and configuring the agent swarm.
        </p>
        <button
          onClick={graphDone ? onComplete : undefined}
          disabled={!graphDone}
          className={[
            "w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2",
            graphDone
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          ].join(" ")}
        >
          Enter Environment Setup
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </StepCard>

    </div>
  );
}
