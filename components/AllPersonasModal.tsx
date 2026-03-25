"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Persona } from "@/lib/types";

interface AllPersonasModalProps {
  personas: Persona[];
  onClose: () => void;
}

const SEGMENTS = [
  { key: "health",     label: "Health Scrutinizer",  color: "#f97316" },
  { key: "social",     label: "Social Discovery",     color: "#8b5cf6" },
  { key: "premium",    label: "Premium Curator",      color: "#3b82f6" },
  { key: "experience", label: "Experience-Forward",   color: "#10b981" },
  { key: "genz",       label: "Gen Z Explorer",       color: "#ec4899" },
  { key: "urban",      label: "Urban Professional",   color: "#f59e0b" },
  { key: "sober",      label: "Sober-Curious",        color: "#a78bfa" },
  { key: "bartender",  label: "Bartender Tastemaker", color: "#14b8a6" },
];

const FIRST_NAMES = [
  "Sofia","Chloe","Raj","Jake","Emma","Liam","Olivia","Noah","Ava","Ethan",
  "Mia","Lucas","Isabella","Mason","Sophia","Logan","Amelia","James","Charlotte","Aiden",
  "Harper","Elijah","Evelyn","Oliver","Abigail","Benjamin","Emily","Sebastian","Zoe","Jack",
  "Avery","Owen","Daniel","Ella","Henry","Madison","Carter","Scarlett","Wyatt","Natalie",
  "Victoria","Gabriel","Aria","Jayden","Grace","Lincoln","Leo","Penelope","Julian","Riley",
  "Nathan","Hazel","Aaron","Layla","Ryan","Nora","Dylan","Hannah","Caleb","Lily",
  "Hunter","Addison","Connor","Aubrey","Luke","Ellie","Isaiah","Stella","Adam","Aurora",
  "Tyler","Leah","Evan","Violet","Gavin","Iris","Chase","Claire","Ian","Maya",
  "Marcus","Sadie","Derek","Piper","Miles","Brielle","Finn","Camille","Reid","Naomi",
  "Kai","Isla","Theo","Luna","Max","Jade","Cole","Sienna","Drew","Freya",
];

interface SwarmNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  color: string;
  segKey: string;
  r: number;
  isFeatured: boolean;
}

interface SwarmLink extends d3.SimulationLinkDatum<SwarmNode> {
  color: string;
  opacity: number;
}

// 8 featured anchors
const FEATURED_NODES: SwarmNode[] = SEGMENTS.map((seg, i) => ({
  id: `featured-${seg.key}`,
  name: ["Sofia","Chloe","Raj","Jake","Mia","Lucas","Emma","Liam"][i],
  color: seg.color,
  segKey: seg.key,
  r: 20,
  isFeatured: true,
}));

// 992 micro agents (evenly split across segments)
const MICRO_NODES: SwarmNode[] = Array.from({ length: 992 }, (_, i) => {
  const seg = SEGMENTS[i % SEGMENTS.length];
  return {
    id: `agent-${i}`,
    name: FIRST_NAMES[i % FIRST_NAMES.length],
    color: seg.color,
    segKey: seg.key,
    r: 4,
    isFeatured: false,
  };
});

function buildLinks(allNodes: SwarmNode[]): SwarmLink[] {
  const links: SwarmLink[] = [];
  const featuredById = new Map(FEATURED_NODES.map(f => [f.segKey, f.id]));

  // Every micro node → its segment anchor
  for (const n of allNodes.filter(n => !n.isFeatured)) {
    links.push({
      source: n.id,
      target: featuredById.get(n.segKey)!,
      color: n.color,
      opacity: 0.12,
    });
  }

  // Every 5th micro node → another random micro in same segment (mesh feel)
  const bySegment = new Map<string, SwarmNode[]>();
  for (const n of allNodes.filter(n => !n.isFeatured)) {
    if (!bySegment.has(n.segKey)) bySegment.set(n.segKey, []);
    bySegment.get(n.segKey)!.push(n);
  }
  bySegment.forEach((group) => {
    for (let i = 0; i < group.length; i += 4) {
      const next = group[(i + 1) % group.length];
      links.push({ source: group[i].id, target: next.id, color: group[i].color, opacity: 0.08 });
    }
  });

  // Featured nodes connected to each other in a ring
  for (let i = 0; i < FEATURED_NODES.length; i++) {
    const j = (i + 1) % FEATURED_NODES.length;
    links.push({ source: FEATURED_NODES[i].id, target: FEATURED_NODES[j].id, color: "#ffffff", opacity: 0.1 });
  }
  // A few cross-connections between featured for extra mesh
  const crosses = [[0,3],[1,5],[2,6],[3,7],[0,4],[1,6]];
  for (const [a, b] of crosses) {
    links.push({ source: FEATURED_NODES[a].id, target: FEATURED_NODES[b].id, color: "#ffffff", opacity: 0.07 });
  }

  return links;
}

export default function AllPersonasModal({ onClose }: AllPersonasModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const allNodes: SwarmNode[] = [
      ...FEATURED_NODES.map(n => ({ ...n, x: width / 2, y: height / 2 })),
      ...MICRO_NODES.map(n => ({ ...n })),
    ];

    const nodeById = new Map(allNodes.map(n => [n.id, n]));
    const rawLinks = buildLinks(allNodes);

    // Resolve source/target to node objects for D3
    const links: SwarmLink[] = rawLinks.map(l => ({
      ...l,
      source: nodeById.get(l.source as string)!,
      target: nodeById.get(l.target as string)!,
    }));

    const sel = d3.select(svg).attr("width", width).attr("height", height);
    sel.selectAll("*").remove();

    sel.append("rect").attr("width", width).attr("height", height).attr("fill", "#0b1120");

    const g = sel.append("g");

    // Zoom
    sel.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.15, 5])
        .on("zoom", e => g.attr("transform", e.transform))
    );

    // Links layer
    const linkSel = g.append("g")
      .selectAll<SVGLineElement, SwarmLink>("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", d => d.color)
      .attr("stroke-opacity", d => d.opacity)
      .attr("stroke-width", 0.7);

    // Micro nodes
    const microG = g.append("g")
      .selectAll<SVGGElement, SwarmNode>(".micro")
      .data(allNodes.filter(n => !n.isFeatured))
      .enter()
      .append("g");

    microG.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.color)
      .attr("opacity", 0.75);

    microG.append("text")
      .text(d => d.name)
      .attr("dy", d => d.r + 8)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.color)
      .attr("opacity", 0.8)
      .attr("font-size", "7px")
      .attr("font-weight", "500")
      .attr("font-family", "ui-sans-serif, system-ui, sans-serif");

    // Featured nodes
    const featuredG = g.append("g")
      .selectAll<SVGGElement, SwarmNode>(".featured")
      .data(allNodes.filter(n => n.isFeatured))
      .enter()
      .append("g");

    // Outer glow
    featuredG.append("circle")
      .attr("r", d => d.r + 10)
      .attr("fill", d => d.color)
      .attr("opacity", 0.12);

    featuredG.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Segment label below (primary label — no person name)
    featuredG.append("text")
      .text(d => SEGMENTS.find(s => s.key === d.segKey)?.label ?? "")
      .attr("dy", d => d.r + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("font-family", "ui-sans-serif, system-ui, sans-serif");

    // Force simulation
    const forceLink = d3.forceLink<SwarmNode, SwarmLink>(links)
      .id(d => d.id)
      .distance(d => {
        const s = d.source as SwarmNode;
        const t = d.target as SwarmNode;
        if (s.isFeatured && t.isFeatured) return 130;
        if (s.isFeatured || t.isFeatured) return 28;
        return 12;
      })
      .strength(d => {
        const s = d.source as SwarmNode;
        const t = d.target as SwarmNode;
        if (s.isFeatured && t.isFeatured) return 0.06;
        if (s.isFeatured || t.isFeatured) return 0.7;
        return 0.3;
      });

    const simulation = d3.forceSimulation<SwarmNode>(allNodes)
      .force("link", forceLink)
      .force("charge", d3.forceManyBody<SwarmNode>().strength(d => d.isFeatured ? -200 : -8))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<SwarmNode>().radius(d => d.r + (d.isFeatured ? 6 : 2)).iterations(2))
      .alphaDecay(0.01)
      .velocityDecay(0.4);

    simulation.on("tick", () => {
      linkSel
        .attr("x1", d => (d.source as SwarmNode).x ?? 0)
        .attr("y1", d => (d.source as SwarmNode).y ?? 0)
        .attr("x2", d => (d.target as SwarmNode).x ?? 0)
        .attr("y2", d => (d.target as SwarmNode).y ?? 0);

      microG.attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`);
      featuredG.attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { simulation.stop(); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0b1120" }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-lg">Agent Swarm</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold">
            1,247 agents
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ background: "#0b1120" }}>
        <svg ref={svgRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-black/40 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Consumer Segments</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {SEGMENTS.map(seg => (
              <div key={seg.key} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-white/60 text-xs">{seg.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 right-6 text-white/25 text-xs">Scroll to zoom · Drag to pan</div>
      </div>
    </div>
  );
}
