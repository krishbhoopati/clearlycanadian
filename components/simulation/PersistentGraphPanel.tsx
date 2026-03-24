"use client";

import { useEffect, useRef, useState } from "react";
import { graphNodes, graphLinks } from "@/data/simulation/mapleSimulationData";
import type { GraphNode, GraphLink } from "@/lib/types";

interface Props {
  visible: boolean;
  onToggle: () => void;
  buildStarted: boolean; // true once Stage 1 begins analysis
}

export default function PersistentGraphPanel({ visible, onToggle, buildStarted }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInit = useRef(false);
  const simRef = useRef<unknown>(null);

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
        .attr("stroke", (d) => (d as GraphLink).isDotted ? "#e2e8f0" : "#cbd5e1")
        .attr("stroke-width", (d) => (d as GraphLink).isDotted ? 0.5 : 0.8)
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

      // Tooltip
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

      nodeSel
        .on("mouseover", (event, d) => {
          if (!d.tooltip && !d.label) return;
          tooltip.style("opacity", 1).html(`<strong>${d.label}</strong>${d.tooltip ? `<br/><span style="color:rgba(255,255,255,0.5)">${d.tooltip}</span>` : ""}`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.clientX + 12) + "px").style("top", (event.clientY - 8) + "px");
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

      // Store sim for cleanup
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

      {/* SVG */}
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

        {/* Legend — floating bottom-left inside graph area */}
        <div className="absolute bottom-4 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm pointer-events-none">
          <div className="flex flex-col gap-1">
            {[
              { color: "#1B6EC2", label: "CC Products" },
              { color: "#EF4444", label: "Competitors" },
              { color: "#10B981", label: "Channels" },
              { color: "#8B5CF6", label: "Consumers" },
              { color: "#F59E0B", label: "Concepts" },
              { color: "#14B8A6", label: "Markets" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
