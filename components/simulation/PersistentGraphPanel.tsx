"use client";

import { useEffect, useRef, useState } from "react";
import { graphNodes, graphLinks } from "@/data/simulation/mapleSimulationData";
import type { GraphNode, GraphLink } from "@/lib/types";

interface Props {
  visible: boolean;
  onToggle: () => void;
  buildStarted: boolean;
}

type SelectedInfo = {
  id: string;
  label: string;
  group: string;
  color: string;
  wave: number;
  tooltip?: string;
  path: Array<{ id: string; label: string; edgeLabel?: string }>;
};

const GROUP_LABELS: Record<string, string> = {
  center: "Brand Core",
  product: "CC Product",
  competitor: "Competitor",
  segment: "Consumer Segment",
  flavor: "Flavor SKU",
  channel: "Retail Channel",
  destination: "Tourist Destination",
  market_data: "Market Data",
  people: "People / Partners",
  concept: "Strategic Concept",
  platform: "Digital Platform",
};

const LEGEND_ITEMS = [
  { color: "#1B6EC2", label: "CC Products" },
  { color: "#EF4444", label: "Competitors" },
  { color: "#10B981", label: "Channels" },
  { color: "#8B5CF6", label: "Consumers" },
  { color: "#F59E0B", label: "Market Data" },
  { color: "#F97316", label: "Concepts" },
  { color: "#EC4899", label: "Partners" },
  { color: "#14B8A6", label: "Destinations" },
  { color: "#06B6D4", label: "Platforms" },
];

export default function PersistentGraphPanel({ visible, onToggle, buildStarted }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInit = useRef(false);
  const simRef = useRef<unknown>(null);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);

  // We store D3 selections in refs so click handlers can access them
  const nodeSyncRef = useRef<{
    resetAll: () => void;
    highlightPath: (pathNodeIds: Set<string>, pathEdgeKeys: Set<string>) => void;
  } | null>(null);

  useEffect(() => {
    if (!buildStarted || !svgRef.current || hasInit.current) return;
    hasInit.current = true;

    import("d3").then((d3) => {
      const svg = d3.select(svgRef.current!);
      const rect = svgRef.current!.getBoundingClientRect();
      const W = rect.width || 400;
      const H = rect.height || 600;

      svg.selectAll("*").remove();

      const g = svg.append("g");

      // Zoom + pan
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => g.attr("transform", event.transform));
      svg.call(zoom);

      type DNode = GraphNode & d3.SimulationNodeDatum & { revealed?: boolean };
      type DLink = { source: string | DNode; target: string | DNode; label?: string; edgeLabel?: string; strength?: number; isDotted?: boolean; wave?: number };

      const nodes: DNode[] = graphNodes.map((n) => ({ ...n, revealed: false }));
      const links: DLink[] = graphLinks.map((l) => ({ ...l }));

      const nodeMap = new Map<string, DNode>(nodes.map((n) => [n.id, n]));

      function nodeRadius(n: DNode) {
        if (n.group === "center") return 18;
        if (n.isMicro) return 4;
        return 9;
      }

      // BFS from cc-maple to find shortest path
      function findPath(targetId: string): Array<{ id: string; edgeLabel?: string }> {
        if (targetId === "cc-maple") return [{ id: "cc-maple" }];

        // Build undirected adjacency
        const adj = new Map<string, Array<{ id: string; edgeLabel?: string }>>();
        nodes.forEach((n) => adj.set(n.id, []));
        links.forEach((l) => {
          const s = typeof l.source === "object" ? (l.source as DNode).id : l.source as string;
          const t = typeof l.target === "object" ? (l.target as DNode).id : l.target as string;
          adj.get(s)?.push({ id: t, edgeLabel: l.edgeLabel });
          adj.get(t)?.push({ id: s, edgeLabel: l.edgeLabel });
        });

        // BFS
        const visited = new Map<string, { from: string; edgeLabel?: string }>();
        visited.set("cc-maple", { from: "", edgeLabel: undefined });
        const queue = ["cc-maple"];
        let found = false;
        while (queue.length > 0) {
          const cur = queue.shift()!;
          if (cur === targetId) { found = true; break; }
          for (const neighbor of (adj.get(cur) ?? [])) {
            if (!visited.has(neighbor.id)) {
              visited.set(neighbor.id, { from: cur, edgeLabel: neighbor.edgeLabel });
              queue.push(neighbor.id);
            }
          }
        }

        if (!found && !visited.has(targetId)) return [{ id: targetId }];

        // Reconstruct path
        const path: Array<{ id: string; edgeLabel?: string }> = [];
        let cur = targetId;
        while (cur !== "") {
          const entry = visited.get(cur)!;
          path.unshift({ id: cur, edgeLabel: entry.edgeLabel });
          cur = entry.from;
        }
        return path;
      }

      const sim = d3.forceSimulation<DNode>(nodes)
        .force("link", d3.forceLink<DNode, DLink>(links)
          .id((d) => d.id)
          .distance((l) => {
            const src = typeof l.source === "object" ? l.source as DNode : nodeMap.get(l.source as string);
            const tgt = typeof l.target === "object" ? l.target as DNode : nodeMap.get(l.target as string);
            if (src?.isMicro || tgt?.isMicro) return 60;
            return 100 + (1 - ((l as GraphLink).strength ?? 0.5)) * 40;
          })
          .strength(0.4))
        .force("charge", d3.forceManyBody().strength((d) => (d as DNode).isMicro ? -25 : -120))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force("collision", d3.forceCollide<DNode>().radius((d) => nodeRadius(d) + 4));

      // Links
      const linkGroup = g.append("g");
      const linkSel = linkGroup.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", (d) => (d as GraphLink).isDotted ? "#cbd5e1" : "#94a3b8")
        .attr("stroke-width", (d) => (d as GraphLink).isDotted ? 0.8 : 1.2)
        .attr("stroke-dasharray", (d) => (d as GraphLink).isDotted ? "3,3" : null)
        .attr("opacity", 0);

      // Nodes
      const nodeGroup = g.append("g");
      const nodeSel = nodeGroup.selectAll<SVGCircleElement, DNode>("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", (d) => nodeRadius(d))
        .attr("fill", (d) => d.isMicro ? d.color + "55" : d.color)
        .attr("stroke", (d) => d.isMicro ? "none" : "rgba(255,255,255,0.12)")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .style("cursor", "pointer");

      // Labels (main nodes only)
      const labelSel = nodeGroup.selectAll<SVGTextElement, DNode>("text")
        .data(nodes.filter((n) => !n.isMicro))
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => nodeRadius(d) + 14)
        .attr("font-size", (d) => d.group === "center" ? 13 : 11)
        .attr("font-family", "Plus Jakarta Sans, sans-serif")
        .attr("fill", "#475569")
        .attr("opacity", 0)
        .text((d) => d.label.length > 18 ? d.label.slice(0, 16) + "…" : d.label);

      // Tooltip (hover)
      const tooltip = d3.select("body").append("div")
        .attr("class", "sim-tooltip-graph")
        .style("position", "fixed")
        .style("background", "white")
        .style("border", "1px solid #e2e8f0")
        .style("border-radius", "8px")
        .style("padding", "6px 10px")
        .style("font-size", "11px")
        .style("color", "#1e293b")
        .style("pointer-events", "none")
        .style("z-index", "9999")
        .style("max-width", "180px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.08)")
        .style("opacity", 0)
        .style("transition", "opacity 0.12s");

      // Store reset/highlight helpers
      function resetAll() {
        nodeSel
          .transition().duration(200)
          .attr("opacity", (d) => d.isMicro ? 0.35 : 0.9)
          .attr("stroke", (d) => d.isMicro ? "none" : "rgba(255,255,255,0.12)")
          .attr("stroke-width", 1)
          .attr("r", (d) => nodeRadius(d));
        labelSel
          .transition().duration(200)
          .attr("opacity", 1)
          .attr("fill", "#475569")
          .attr("font-size", (d) => d.group === "center" ? 13 : 11);
        linkSel
          .transition().duration(200)
          .attr("stroke", (d) => (d as GraphLink).isDotted ? "#94a3b8" : "#475569")
          .attr("stroke-width", (d) => (d as GraphLink).isDotted ? 0.8 : 1.2)
          .attr("opacity", 0.6);
      }

      function highlightPath(pathNodeIds: Set<string>, pathEdgeKeys: Set<string>) {
        nodeSel
          .transition().duration(200)
          .attr("opacity", (d) => pathNodeIds.has(d.id) ? 1 : 0.08)
          .attr("stroke", (d) => pathNodeIds.has(d.id) ? "#3B82F6" : "rgba(255,255,255,0.05)")
          .attr("stroke-width", (d) => pathNodeIds.has(d.id) ? 2.5 : 1)
          .attr("r", (d) => pathNodeIds.has(d.id) ? nodeRadius(d) * 1.3 : nodeRadius(d));
        labelSel
          .transition().duration(200)
          .attr("opacity", (d) => pathNodeIds.has(d.id) ? 1 : 0.05)
          .attr("fill", (d) => pathNodeIds.has(d.id) ? "#1e40af" : "#475569")
          .attr("font-size", (d) => pathNodeIds.has(d.id) ? (d.group === "center" ? 14 : 12) : (d.group === "center" ? 13 : 11));
        linkSel
          .transition().duration(200)
          .attr("stroke", (d) => {
            const s = typeof d.source === "object" ? (d.source as DNode).id : d.source as string;
            const t = typeof d.target === "object" ? (d.target as DNode).id : d.target as string;
            return pathEdgeKeys.has(`${s}::${t}`) ? "#3B82F6" : "#e2e8f0";
          })
          .attr("stroke-width", (d) => {
            const s = typeof d.source === "object" ? (d.source as DNode).id : d.source as string;
            const t = typeof d.target === "object" ? (d.target as DNode).id : d.target as string;
            return pathEdgeKeys.has(`${s}::${t}`) ? 2.5 : 0.4;
          })
          .attr("opacity", (d) => {
            const s = typeof d.source === "object" ? (d.source as DNode).id : d.source as string;
            const t = typeof d.target === "object" ? (d.target as DNode).id : d.target as string;
            return pathEdgeKeys.has(`${s}::${t}`) ? 1 : 0.08;
          });
      }

      nodeSyncRef.current = { resetAll, highlightPath };

      // Hover tooltip
      nodeSel
        .on("mouseover", (event, d) => {
          if (!d.tooltip && !d.label) return;
          tooltip.style("opacity", 1).html(`<strong>${d.label}</strong>${d.tooltip ? `<br/><span style="color:#64748b;margin-top:2px;display:block">${d.tooltip}</span>` : ""}`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.clientX + 12) + "px").style("top", (event.clientY - 8) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

      // Click to select node + show path
      nodeSel.on("click", (event, d) => {
        event.stopPropagation();
        tooltip.style("opacity", 0);

        const rawPath = findPath(d.id);
        const pathNodeIds = new Set(rawPath.map((p) => p.id));
        const pathEdgeKeys = new Set<string>();
        for (let i = 1; i < rawPath.length; i++) {
          pathEdgeKeys.add(`${rawPath[i - 1].id}::${rawPath[i].id}`);
          pathEdgeKeys.add(`${rawPath[i].id}::${rawPath[i - 1].id}`);
        }

        highlightPath(pathNodeIds, pathEdgeKeys);

        const pathWithLabels = rawPath.map((p) => ({
          id: p.id,
          label: nodeMap.get(p.id)?.label ?? p.id,
          edgeLabel: p.edgeLabel,
        }));

        setSelectedInfo({
          id: d.id,
          label: d.label,
          group: d.group,
          color: d.color,
          wave: (d as GraphNode).wave ?? 1,
          tooltip: d.tooltip,
          path: pathWithLabels,
        });
      });

      // Click SVG background to deselect
      svg.on("click", () => {
        resetAll();
        setSelectedInfo(null);
      });

      // Drag
      const drag = d3.drag<SVGCircleElement, DNode>()
        .on("start", (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
      nodeSel.call(drag);

      sim.on("tick", () => {
        linkSel
          .attr("x1", (d) => ((d.source as DNode).x ?? 0))
          .attr("y1", (d) => ((d.source as DNode).y ?? 0))
          .attr("x2", (d) => ((d.target as DNode).x ?? 0))
          .attr("y2", (d) => ((d.target as DNode).y ?? 0));
        nodeSel.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
        labelSel.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
      });

      // 6-wave reveal
      const WAVE_DELAY = 1500;
      for (let wave = 1; wave <= 6; wave++) {
        const waveNodes = nodes.filter((n) => n.wave === wave);
        const waveStart = (wave - 1) * WAVE_DELAY + 300;
        waveNodes.forEach((node, i) => {
          setTimeout(() => {
            d3.selectAll<SVGCircleElement, DNode>("circle")
              .filter((d) => d.id === node.id)
              .transition().duration(400)
              .attr("opacity", node.isMicro ? 0.35 : 0.9);
            d3.selectAll<SVGTextElement, DNode>("text")
              .filter((d) => d.id === node.id)
              .transition().duration(400)
              .attr("opacity", 1);
            d3.selectAll<SVGLineElement, DLink>("line")
              .filter((d) => {
                const s = typeof d.source === "object" ? (d.source as DNode).id : d.source;
                const t = typeof d.target === "object" ? (d.target as DNode).id : d.target;
                return s === node.id || t === node.id;
              })
              .transition().duration(500)
              .attr("opacity", node.isMicro ? 0.25 : 0.5);
          }, waveStart + i * 80);
        });
      }

      (simRef as { current: unknown }).current = sim;

      return () => {
        sim.stop();
        tooltip.remove();
      };
    });
  }, [buildStarted]);

  return (
    <div
      className="flex flex-col h-full transition-all duration-300 overflow-hidden bg-slate-50"
      style={{ width: visible ? undefined : 0, opacity: visible ? 1 : 0 }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Knowledge Graph</div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1 border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-50 transition-colors duration-150"
          title="Hide graph"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Hide
        </button>
      </div>

      {/* SVG area */}
      <div className="flex-1 relative overflow-hidden sim-grid">
        {!buildStarted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-3 opacity-20">⬡</div>
              <div className="text-slate-400 text-xs text-center">Graph builds in Stage 1</div>
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full h-full" />

        {/* Legend — floating bottom-left */}
        {!selectedInfo && (
          <div className="absolute bottom-4 left-3 bg-white/97 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-md pointer-events-none" style={{ minWidth: 180 }}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Node Types</div>
            <div className="flex flex-col gap-2.5">
              {LEGEND_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-700 font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node info card — shown when a node is selected */}
        {selectedInfo && (
          <div className="absolute bottom-3 left-3 right-3 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-sim-post-in">
            {/* Card header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: selectedInfo.color }} />
                <div className="min-w-0">
                  <div className="text-slate-800 font-bold text-sm leading-tight">{selectedInfo.label}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {GROUP_LABELS[selectedInfo.group] ?? selectedInfo.group}
                    </span>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      Wave {selectedInfo.wave}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  nodeSyncRef.current?.resetAll();
                  setSelectedInfo(null);
                }}
                className="text-slate-400 hover:text-slate-700 flex-shrink-0 mt-0.5 hover:bg-slate-100 rounded-md p-0.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Node ID + fact */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</span>
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                  {selectedInfo.id}
                </span>
              </div>
              {selectedInfo.tooltip && (
                <p className="text-xs text-slate-600 leading-relaxed">{selectedInfo.tooltip}</p>
              )}
            </div>

            {/* Path from root */}
            <div className="px-4 py-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Path from Brand Core
              </div>
              <div className="flex flex-col gap-1">
                {selectedInfo.path.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-1.5">
                    {/* Edge label (between nodes) */}
                    {i > 0 && step.edgeLabel && (
                      <div className="flex items-center gap-1 pl-2 mb-1">
                        <div className="w-0.5 h-3 bg-blue-300 rounded-full ml-1" />
                        <span className="text-[9px] font-mono text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {step.edgeLabel}
                        </span>
                      </div>
                    )}
                    <div className={[
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
                      i === selectedInfo.path.length - 1
                        ? "bg-blue-600 text-white"
                        : i === 0
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: i === selectedInfo.path.length - 1 || i === 0
                            ? "rgba(255,255,255,0.5)"
                            : selectedInfo.color,
                        }}
                      />
                      {step.label.length > 22 ? step.label.slice(0, 20) + "…" : step.label}
                    </div>
                  </div>
                ))}
              </div>
              {selectedInfo.path.length <= 1 && (
                <div className="text-xs text-slate-400 italic">This is the brand core node</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
