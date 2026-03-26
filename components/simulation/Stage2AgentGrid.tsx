"use client";

import { useEffect, useState, useRef } from "react";
import { simulationAgents } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";
import type { Persona, GraphNode, GraphLink } from "@/lib/types";

interface Props {
  onComplete: () => void;
  onAgentClick?: (personaId: string) => void;
  onGraphEvent?: (nodes: GraphNode[], links: GraphLink[]) => void;
}

const STAGGER_MS = 120;
const DONE_DELAY = simulationAgents.length * STAGGER_MS + 800;
const COUNTER_DURATION = 3200;
const COUNTER_TARGET = 1247;

// ─── Named agents (12) — prominent SVG nodes with labels ─────────────────────
const AGENT_NODES: GraphNode[] = [
  { id: "agent-ethan",   label: "Ethan",    group: "agent", color: "#3B82F6", wave: 7, tooltip: "Craft Curator — bartender, West End Toronto" },
  { id: "agent-aisha",   label: "Aisha",    group: "agent", color: "#EC4899", wave: 7, tooltip: "Aesthetic Chaser — Gen Z, Atlanta" },
  { id: "agent-doug",    label: "Doug",     group: "agent", color: "#10B981", wave: 7, tooltip: "Nostalgic Loyalist — Gen X, Kitchener-Waterloo" },
  { id: "agent-marie",   label: "Marie",    group: "agent", color: "#F59E0B", wave: 7, tooltip: "Sober Curious Trendsetter — Gen Z, Montréal" },
  { id: "agent-linda",   label: "Linda",    group: "agent", color: "#8B5CF6", wave: 7, tooltip: "Proud Canadian — Gen X, North Vancouver" },
  { id: "agent-tyler",   label: "Tyler",    group: "agent", color: "#6B7280", wave: 7, tooltip: "Indifferent Impulse Buyer — Millennial, Halifax" },
  { id: "agent-sofia",   label: "Sofia",    group: "agent", color: "#14B8A6", wave: 7, tooltip: "Ingredient Scrutinizer — checks sweetener list first" },
  { id: "agent-raj",     label: "Raj",      group: "agent", color: "#F97316", wave: 7, tooltip: "Premium Lifestyle Curator — glass bottle on bar cart" },
  { id: "agent-jake",    label: "Jake",     group: "agent", color: "#06B6D4", wave: 7, tooltip: "Experience-Forward Discovery buyer — Millennial" },
  { id: "agent-karen-h", label: "Karen H.", group: "agent", color: "#EF4444", wave: 7, tooltip: "Household Value Seeker — Gen X, Atlanta" },
  { id: "agent-marcus",  label: "Marcus",   group: "agent", color: "#A78BFA", wave: 7, tooltip: "The Rediscoverer — Millennial, Chicago" },
  { id: "agent-chloe",   label: "Chloe",    group: "agent", color: "#FB7185", wave: 7, tooltip: "Social Discovery buyer — Gen Z, Toronto" },
];

const AGENT_LINKS: Record<string, GraphLink[]> = {
  "agent-ethan":   [
    { source: "agent-ethan", target: "seg-bartenders", wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-ethan", target: "seg-cocktail",   wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-aisha":   [
    { source: "agent-aisha", target: "seg-genz",  wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-aisha", target: "sm-tiktok", wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-doug":    [
    { source: "agent-doug", target: "seg-genx",      wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-doug", target: "cc-originals",  wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-doug", target: "fl-blackberry", wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-marie":   [
    { source: "agent-marie", target: "seg-sober",     wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-marie", target: "dest-montreal", wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-linda":   [
    { source: "agent-linda", target: "seg-genx",     wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-linda", target: "cc-originals", wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-tyler":   [
    { source: "agent-tyler", target: "seg-convenience", wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-tyler", target: "ch-7eleven",      wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-sofia":   [
    { source: "agent-sofia", target: "seg-genz",      wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-sofia", target: "cc-zero-sugar", wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-raj":     [
    { source: "agent-raj", target: "seg-premium",     wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-raj", target: "cc-glass-bottle", wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-jake":    [
    { source: "agent-jake", target: "seg-millennials", wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-jake", target: "ch-festival",     wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-karen-h": [
    { source: "agent-karen-h", target: "seg-household", wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-karen-h", target: "ch-costco",     wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-marcus":  [
    { source: "agent-marcus", target: "seg-millennials", wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-marcus", target: "cc-originals",    wave: 7, isDotted: true, strength: 0.3 },
  ],
  "agent-chloe":   [
    { source: "agent-chloe", target: "seg-genz",     wave: 7, isDotted: true, strength: 0.3 },
    { source: "agent-chloe", target: "sm-instagram", wave: 7, isDotted: true, strength: 0.3 },
  ],
};

const AGENT_THRESHOLDS = [80, 185, 310, 430, 540, 650, 755, 850, 940, 1030, 1115, 1190];

// ─── Entity pool for random secondary connections ──────────────────────────
const ENTITY_POOL = [
  "cc-maple", "cc-originals", "cc-zero-sugar", "cc-glass-bottle", "cc-sleekcan",
  "cc-essence", "cc-473ml-can", "cc-mini-pack", "cc-cocktail-kit", "cc-dtc-website",
  "c-lacroix", "c-bubly", "c-perrier", "c-liquid-death", "c-spindrift",
  "c-waterloo", "c-poppi", "c-olipop",
  "seg-genz", "seg-millennials", "seg-genx", "seg-sober", "seg-bartenders",
  "seg-household", "seg-premium", "seg-convenience", "seg-boomer", "seg-athlete",
  "seg-cocktail", "seg-tourist-intl", "seg-vegan-conscious", "seg-craft-beer-crossover",
  "seg-college-student", "seg-senior-health", "seg-expat-canadian",
  "seg-yoga-wellness", "seg-wedding-planner", "seg-foodservice", "seg-corporate",
  "seg-hotel-buyer",
  "ch-costco", "ch-grocery", "ch-walmart", "ch-target", "ch-7eleven",
  "ch-amazon", "ch-festival", "ch-dtc", "ch-university", "ch-wholefoods",
  "ch-loblaws", "ch-shoppers", "ch-airport", "ch-souvenir", "ch-hotel",
  "sm-tiktok", "sm-instagram", "sm-reddit", "sm-facebook", "sm-youtube",
  "sm-pinterest", "sm-podcast", "sm-snapchat", "sm-threads", "sm-discord",
  "sm-substack", "sm-twitch", "sm-linkedin",
  "con-buy-canadian", "con-sugar-free-trend", "con-nostalgic-marketing",
  "con-canadian-identity", "con-real-maple-claim", "con-no-sweeteners",
  "con-health-halo", "con-cocktail-flywheel", "con-maple-souvenir", "con-crowdfunding",
  "fl-blackberry", "fl-cherry", "fl-maple", "fl-strawberry", "fl-grapefruit",
  "fl-lemon-lime", "fl-watermelon", "fl-peach", "fl-elderflower", "fl-cucumber",
];

function lcg(seed: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0);
}

// ─── Synthetic swarm nodes (1,235) ─────────────────────────────────────────
// Colors per user spec: blue=GenZ, green=Millennials, orange=GenX,
//   purple=Sober, red=Bartenders, yellow=Household, gray=Convenience, amber=Boomers
const SYNTH_SEGMENTS: Array<{ prefix: string; segId: string; color: string; count: number }> = [
  { prefix: "mil",  segId: "seg-millennials", color: "#22C55E", count: 330 },
  { prefix: "genz", segId: "seg-genz",        color: "#3B82F6", count: 275 },
  { prefix: "genx", segId: "seg-genx",        color: "#F97316", count: 240 },
  { prefix: "boom", segId: "seg-boomer",      color: "#F59E0B", count: 145 },
  { prefix: "hh",   segId: "seg-household",   color: "#EAB308", count: 100 },
  { prefix: "sob",  segId: "seg-sober",       color: "#8B5CF6", count: 80  },
  { prefix: "bar",  segId: "seg-bartenders",  color: "#EF4444", count: 40  },
  { prefix: "conv", segId: "seg-convenience", color: "#6B7280", count: 25  },
];

interface SynthNodeData extends GraphNode {
  _extraTargets: string[];
}

function buildSynthData(): { nodes: SynthNodeData[]; linkMap: Record<string, GraphLink[]> } {
  const nodes: SynthNodeData[] = [];
  const linkMap: Record<string, GraphLink[]> = {};

  SYNTH_SEGMENTS.forEach((seg, segIdx) => {
    for (let i = 0; i < seg.count; i++) {
      const id = `syn-${seg.prefix}-${i}`;
      let seed = ((i * 2654435761) >>> 0) ^ ((segIdx * 999983) >>> 0);

      // 2–3 extra connections from entity pool
      const extraTargets: string[] = [];
      const extraCount = 2 + (seed & 1);
      for (let c = 0; c < extraCount; c++) {
        seed = lcg(seed);
        const target = ENTITY_POOL[seed % ENTITY_POOL.length];
        if (target !== seg.segId && !extraTargets.includes(target)) {
          extraTargets.push(target);
        }
      }

      nodes.push({
        id, label: "", group: "agent", color: seg.color, wave: 7, isMicro: true,
        _extraTargets: extraTargets,
      });

      // Links: primary segment + extra targets
      linkMap[id] = [
        { source: id, target: seg.segId, wave: 7, isDotted: true, strength: 0.25 },
        ...extraTargets.map(t => ({ source: id, target: t, wave: 7, isDotted: true, strength: 0.1 } as GraphLink)),
      ];
    }
  });

  return { nodes, linkMap };
}

const { nodes: SYNTH_NODES, linkMap: SYNTH_LINK_MAP } = buildSynthData();

// 10 batch thresholds interleaved between named-agent thresholds
const SYNTH_BATCH_THRESHOLDS = [40, 145, 255, 368, 478, 595, 706, 808, 896, 1075];
const BATCH_SIZE = 124;

// ──────────────────────────────────────────────────────────────────────────────

export default function Stage2AgentGrid({ onComplete, onAgentClick, onGraphEvent }: Props) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [done, setDone] = useState(false);
  const [counter, setCounter] = useState(0);
  const injectedRef = useRef(new Set<number>());
  const synthInjectedRef = useRef(new Set<number>());
  const onGraphEventRef = useRef(onGraphEvent);
  onGraphEventRef.current = onGraphEvent;

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => setPersonas(Array.isArray(data) ? data : (data.personas ?? [])));
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), DONE_DELAY);
    const t2 = setTimeout(() => onComplete(), DONE_DELAY + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  // Counter + node injection
  useEffect(() => {
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = Math.floor(eased * COUNTER_TARGET);
      setCounter(current);

      // Named agent injections
      AGENT_THRESHOLDS.forEach((threshold, idx) => {
        if (current >= threshold && !injectedRef.current.has(idx)) {
          injectedRef.current.add(idx);
          const node = AGENT_NODES[idx];
          onGraphEventRef.current?.([node], AGENT_LINKS[node.id] ?? []);
        }
      });

      // Synthetic swarm batch injections
      SYNTH_BATCH_THRESHOLDS.forEach((threshold, batchIdx) => {
        if (current >= threshold && !synthInjectedRef.current.has(batchIdx)) {
          synthInjectedRef.current.add(batchIdx);
          const start = batchIdx * BATCH_SIZE;
          const batchNodes = SYNTH_NODES.slice(start, start + BATCH_SIZE) as GraphNode[];
          const batchLinks = batchNodes.flatMap(n => SYNTH_LINK_MAP[n.id] ?? []);
          onGraphEventRef.current?.(batchNodes, batchLinks);
        }
      });

      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const personaMap = new Map(personas.map((p) => [p.id, p]));

  return (
    <div className="glass-dark rounded-xl flex flex-col py-4 gap-3">
      <div className="flex-shrink-0 px-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-2xl">Agent Generation</h3>
          <p className="text-white/50 text-lg mt-1">
            Initializing {simulationAgents.length} featured archetypes from{" "}
            <span className="text-white/80 font-mono tabular-nums animate-count-flash">
              {counter.toLocaleString()}
            </span>
            -agent swarm
          </p>
        </div>
        {done && (
          <span className="flex-shrink-0 flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Completed
          </span>
        )}
      </div>

      <div className="overflow-y-auto light-scroll px-3" style={{ height: 460 }}>
        <div className="grid grid-cols-3 gap-2.5">
          {simulationAgents.map((agent, i) => (
            <div
              key={agent.id}
              className="opacity-0 animate-agent-pop-in"
              style={{ animationDelay: `${i * STAGGER_MS}ms`, animationFillMode: "forwards" }}
            >
              <SimulationAgentCard
                agent={agent}
                persona={personaMap.get(agent.persona_id)}
                onClick={() => onAgentClick?.(agent.persona_id)}
                compact
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
