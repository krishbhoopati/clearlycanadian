"use client";

import { useEffect, useRef, useState } from "react";
import { mainNodes, mainLinks, microNodes, microLinks } from "@/data/simulation/mapleSimulationData";
import type { GraphNode, GraphLink } from "@/lib/types";

interface Props {
  onComplete: () => void;
}

// Merge all nodes/links
const ALL_NODES = [...mainNodes, ...microNodes];
const ALL_LINKS = [...mainLinks, ...microLinks];

const GROUP_ORDER: GraphNode["group"][] = ["center", "product", "competitor", "channel", "persona", "concept", "market", "micro"];

export default function Stage1KnowledgeGraph({ onComplete }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInit = useRef(false);
  const [started, setStarted] = useState(false);
  const [graphDone, setGraphDone] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);

  function handleBeginAnalysis() {
    setStarted(true);
  }

  useEffect(() => {
    if (!started || !svgRef.current || hasInit.current) return;
    hasInit.current = true;

    import("d3").then((d3) => {
      const svg = d3.select(svgRef.current!);
      const rect = svgRef.current!.getBoundingClientRect();
      const W = rect.width || 600;
      const H = rect.height || 500;

      svg.selectAll("*").remove();

      const g = svg.append("g");

      // Zoom
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => g.attr("transform", event.transform));
      svg.call(zoom);

      // Build typed nodes/links for D3
      type DNode = GraphNode & d3.SimulationNodeDatum & { revealed?: boolean };
      type DLink = { source: string | DNode; target: string | DNode; label?: string; strength?: number; isDotted?: boolean };

      const nodes: DNode[] = ALL_NODES.map((n) => ({
        ...n,
        revealed: false,
      }));

      const links: DLink[] = ALL_LINKS.map((l) => ({ ...l }));

      const nodeMap = new Map<string, DNode>(nodes.map((n) => [n.id, n]));

      // Radius per node
      function nodeRadius(n: DNode) {
        if (n.group === "center") return 22;
        if (n.isMicro) return 5;
        return 11;
      }

      const sim = d3.forceSimulation<DNode>(nodes)
        .force("link", d3.forceLink<DNode, DLink>(links)
          .id((d) => d.id)
          .distance((l) => {
            const src = typeof l.source === "object" ? l.source as DNode : nodeMap.get(l.source as string);
            const tgt = typeof l.target === "object" ? l.target as DNode : nodeMap.get(l.target as string);
            if (src?.isMicro || tgt?.isMicro) return 80;
            return 120 + (1 - ((l as GraphLink).strength ?? 0.5)) * 60;
          })
          .strength(0.4))
        .force("charge", d3.forceManyBody().strength((d) => (d as DNode).isMicro ? -40 : -180))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force("collision", d3.forceCollide<DNode>().radius((d) => nodeRadius(d) + 6));

      // Draw links
      const linkGroup = g.append("g").attr("class", "links");
      const linkSel = linkGroup.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", (d) => (d as GraphLink).isDotted ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)")
        .attr("stroke-width", (d) => (d as GraphLink).isDotted ? 0.5 : 1)
        .attr("stroke-dasharray", (d) => (d as GraphLink).isDotted ? "3,3" : null)
        .attr("opacity", 0);

      // Draw nodes
      const nodeGroup = g.append("g").attr("class", "nodes");
      const nodeSel = nodeGroup.selectAll<SVGCircleElement, DNode>("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", (d) => nodeRadius(d))
        .attr("fill", (d) => d.isMicro ? d.color + "66" : d.color)
        .attr("stroke", (d) => d.isMicro ? "none" : "rgba(255,255,255,0.15)")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .style("cursor", "pointer");

      // Labels for main nodes
      const labelSel = nodeGroup.selectAll<SVGTextElement, DNode>("text")
        .data(nodes.filter((n) => !n.isMicro))
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => nodeRadius(d) + 12)
        .attr("font-size", (d) => d.group === "center" ? 11 : 9)
        .attr("font-family", "Plus Jakarta Sans, sans-serif")
        .attr("fill", "rgba(255,255,255,0.7)")
        .attr("opacity", 0)
        .text((d) => d.label.length > 16 ? d.label.slice(0, 14) + "…" : d.label);

      // Tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "sim-tooltip")
        .style("position", "fixed")
        .style("background", "rgba(30,40,55,0.97)")
        .style("border", "1px solid rgba(255,255,255,0.15)")
        .style("border-radius", "8px")
        .style("padding", "8px 12px")
        .style("font-size", "12px")
        .style("color", "rgba(255,255,255,0.85)")
        .style("pointer-events", "none")
        .style("z-index", "9999")
        .style("max-width", "220px")
        .style("opacity", 0)
        .style("transition", "opacity 0.15s");

      nodeSel
        .on("mouseover", (event, d) => {
          if (!d.tooltip) return;
          tooltip.style("opacity", 1).html(`<strong>${d.label}</strong><br/><span style="color:rgba(255,255,255,0.6)">${d.tooltip}</span>`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 10) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

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

      // Reveal nodes in waves by group order
      const mainNodesList = nodes.filter((n) => !n.isMicro);
      const microNodesList = nodes.filter((n) => n.isMicro);

      let revealDelay = 300;
      GROUP_ORDER.filter((g) => g !== "micro").forEach((group) => {
        const groupNodes = mainNodesList.filter((n) => n.group === group);
        groupNodes.forEach((node, i) => {
          setTimeout(() => {
            d3.selectAll<SVGCircleElement, DNode>("circle")
              .filter((d) => d.id === node.id)
              .transition().duration(400)
              .attr("opacity", 1);
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
              .attr("opacity", 1);
          }, revealDelay + i * 120);
        });
        revealDelay += groupNodes.length * 120 + 400;
      });

      // Second wave: micro nodes after main nodes
      setTimeout(() => {
        microNodesList.forEach((node, i) => {
          setTimeout(() => {
            d3.selectAll<SVGCircleElement, DNode>("circle")
              .filter((d) => d.id === node.id)
              .transition().duration(600)
              .attr("opacity", 0.4);
            d3.selectAll<SVGLineElement, DLink>("line")
              .filter((d) => {
                const s = typeof d.source === "object" ? (d.source as DNode).id : d.source;
                const t = typeof d.target === "object" ? (d.target as DNode).id : d.target;
                return (s === node.id || t === node.id);
              })
              .transition().duration(400)
              .attr("opacity", 0.4);
          }, i * 30);
        });
        setTimeout(() => {
          setGraphDone(true);
          setSummaryVisible(true);
          setTimeout(onComplete, 3000);
        }, microNodesList.length * 30 + 1500);
      }, revealDelay + 500);

      return () => {
        sim.stop();
        tooltip.remove();
      };
    });
  }, [started, onComplete]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-[520px]">
      {/* Left panel */}
      <div className="lg:w-72 flex-shrink-0 flex flex-col gap-4">
        <div className="glass-dark rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold">CC Maple Zero Sugar</div>
              <div className="text-white/40 text-xs">Growth Strategy Brief</div>
            </div>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">
            Market analysis, consumer insights, and distribution strategy for Clearly Canadian's new Maple Zero Sugar product launch across tourist retail, on-premise, and grocery channels.
          </p>
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <span className="bg-white/5 px-2 py-0.5 rounded">PDF</span>
            <span>•</span>
            <span>12 pages</span>
            <span>•</span>
            <span>CC Marketing Team</span>
          </div>
        </div>

        {!started && (
          <button
            onClick={handleBeginAnalysis}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Begin Analysis</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {started && !graphDone && (
          <div className="glass-dark rounded-xl p-4 text-xs text-white/50 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Extracting entities and relationships…
          </div>
        )}

        {summaryVisible && (
          <div className="glass-dark rounded-xl p-4 border border-emerald-500/30">
            <div className="text-emerald-400 text-xs font-semibold mb-2">Knowledge Graph Complete</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-white font-bold text-lg">78</div>
                <div className="text-white/40 text-xs">entities</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">94</div>
                <div className="text-white/40 text-xs">relationships</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">6</div>
                <div className="text-white/40 text-xs">segments</div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {started && (
          <div className="glass-dark rounded-xl p-4">
            <div className="text-white/40 text-xs font-medium mb-2">Node Legend</div>
            <div className="flex flex-col gap-1.5">
              {[
                { color: "#1B6EC2", label: "CC Maple (center)" },
                { color: "#EF4444", label: "Competitors" },
                { color: "#10B981", label: "Channels" },
                { color: "#8B5CF6", label: "Consumer Segments" },
                { color: "#F59E0B", label: "Concepts" },
                { color: "#14B8A6", label: "Markets" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-white/50 text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel — graph */}
      <div className="flex-1 glass-dark rounded-xl overflow-hidden min-h-[400px] relative">
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-20">⬡</div>
              <div className="text-white/30 text-sm">Knowledge graph will appear here</div>
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full h-full" style={{ minHeight: 400 }} />
      </div>
    </div>
  );
}
