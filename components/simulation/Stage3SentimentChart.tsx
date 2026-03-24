"use client";

import { useEffect, useRef } from "react";
import { sentimentTimeline } from "@/data/simulation/mapleSimulationData";
import type { SentimentPoint } from "@/lib/types";

interface Props {
  currentDataIdx: number; // how many data points to show (0–7)
}

export default function Stage3SentimentChart({ currentDataIdx }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (!svgRef.current) return;

    import("d3").then((d3) => {
      const svg = d3.select(svgRef.current!);
      const W = svgRef.current!.clientWidth || 300;
      const H = 120;
      const margin = { top: 8, right: 8, bottom: 20, left: 32 };
      const innerW = W - margin.left - margin.right;
      const innerH = H - margin.top - margin.bottom;

      if (!hasInit.current) {
        svg.selectAll("*").remove();
        svg.attr("viewBox", `0 0 ${W} ${H}`);
        hasInit.current = true;
      }

      const data = sentimentTimeline.slice(0, Math.max(currentDataIdx + 1, 1));

      const xScale = d3.scaleLinear()
        .domain([0, sentimentTimeline[sentimentTimeline.length - 1].t])
        .range([0, innerW]);

      const maxVal = d3.max(sentimentTimeline, (d: SentimentPoint) => d.positive + d.neutral + d.friction) ?? 1247;
      const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerH, 0]);

      svg.selectAll("*").remove();
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Grid lines
      g.append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(yScale.ticks(4))
        .enter()
        .append("line")
        .attr("x1", 0).attr("x2", innerW)
        .attr("y1", (d) => yScale(d)).attr("y2", (d) => yScale(d))
        .attr("stroke", "rgba(255,255,255,0.05)");

      // Lines
      const lines: { key: keyof SentimentPoint; color: string; label: string }[] = [
        { key: "positive", color: "#10B981", label: "Positive" },
        { key: "neutral", color: "#F59E0B", label: "Neutral" },
        { key: "friction", color: "#EF4444", label: "Friction" },
      ];

      lines.forEach(({ key, color }) => {
        const lineGen = d3.line<SentimentPoint>()
          .x((d) => xScale(d.t))
          .y((d) => yScale(d[key] as number))
          .curve(d3.curveMonotoneX);

        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("d", lineGen);

        // Dots
        g.selectAll<SVGCircleElement, SentimentPoint>(`.dot-${key}`)
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale(d.t))
          .attr("cy", (d) => yScale(d[key] as number))
          .attr("r", 3)
          .attr("fill", color);
      });

      // X axis label
      g.append("text")
        .attr("x", innerW / 2).attr("y", innerH + 16)
        .attr("text-anchor", "middle")
        .attr("font-size", 8)
        .attr("fill", "rgba(255,255,255,0.3)")
        .text("Simulation time (minutes)");
    });
  }, [currentDataIdx]);

  return (
    <div className="glass-dark rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white/70 text-xs font-medium">Sentiment Over Time</div>
        <div className="text-white/30 text-xs">Based on 1,247 agent interactions</div>
      </div>
      <svg ref={svgRef} className="w-full" style={{ height: 120 }} />
      <div className="flex items-center gap-4 mt-2 flex-wrap">
        {[
          { color: "#10B981", label: "Positive" },
          { color: "#F59E0B", label: "Neutral" },
          { color: "#EF4444", label: "Friction" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/40 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
