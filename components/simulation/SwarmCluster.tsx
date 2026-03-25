"use client";

import { useEffect, useRef, useState } from "react";
import { simulationAgents, swarmSegments } from "@/data/simulation/mapleSimulationData";

interface Props {
  visible: boolean;
}

const TOTAL_AGENTS = 1247;

export default function SwarmCluster({ visible }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInit = useRef(false);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  // Count-up animation
  useEffect(() => {
    if (!visible) return;
    let current = 0;
    const target = TOTAL_AGENTS;
    const step = Math.ceil(target / 60);
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) {
        clearInterval(iv);
        setDone(true);
      }
    }, 80);
    return () => clearInterval(iv);
  }, [visible]);

  // Draw dot cluster
  useEffect(() => {
    if (!visible || !svgRef.current || hasInit.current) return;
    hasInit.current = true;

    const W = 600;
    const H = 360;

    // Pre-calculate dot positions (radial cluster per segment)
    const segmentDefs = swarmSegments;
    const centerX = W / 2;
    const centerY = H / 2;
    const segmentAngleStep = (Math.PI * 2) / segmentDefs.length;

    const dots: { x: number; y: number; color: string; r: number; label?: string; segIdx: number }[] = [];

    segmentDefs.forEach((seg, si) => {
      const angle = si * segmentAngleStep - Math.PI / 2;
      const clusterCX = centerX + Math.cos(angle) * 200;
      const clusterCY = centerY + Math.sin(angle) * 120;

      // Small background dots
      for (let i = 0; i < seg.count; i++) {
        const r = Math.random() * 50 + 5;
        const a = Math.random() * Math.PI * 2;
        dots.push({
          x: clusterCX + Math.cos(a) * r,
          y: clusterCY + Math.sin(a) * r,
          color: seg.color,
          r: 2.5,
          segIdx: si,
        });
      }

      // Featured agent dots (larger)
      const agentsInSeg = simulationAgents.filter((a) => seg.persona_ids.includes(a.id));
      agentsInSeg.forEach((agent, ai) => {
        const offset = (ai - agentsInSeg.length / 2) * 20;
        dots.push({
          x: clusterCX + offset,
          y: clusterCY - 20 - ai * 4,
          color: agent.avatar_color,
          r: 7,
          label: agent.name.split(" ")[0],
          segIdx: si,
        });
      });
    });

    const svg = svgRef.current;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    // Reveal dots in batches
    const batchSize = 50;
    const bgDots = dots.filter((d) => !d.label);
    const featuredDots = dots.filter((d) => d.label);

    let batchIdx = 0;
    const iv = setInterval(() => {
      const start = batchIdx * batchSize;
      const end = Math.min(start + batchSize, bgDots.length);
      for (let i = start; i < end; i++) {
        const dot = bgDots[i];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(dot.x));
        circle.setAttribute("cy", String(dot.y));
        circle.setAttribute("r", String(dot.r));
        circle.setAttribute("fill", dot.color);
        circle.setAttribute("opacity", "0.6");
        circle.classList.add("animate-dot-appear");
        svg.appendChild(circle);
      }
      batchIdx++;
      if (start >= bgDots.length) {
        clearInterval(iv);
        // Add featured dots
        featuredDots.forEach((dot) => {
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", String(dot.x));
          circle.setAttribute("cy", String(dot.y));
          circle.setAttribute("r", String(dot.r));
          circle.setAttribute("fill", dot.color);
          circle.setAttribute("stroke", "white");
          circle.setAttribute("stroke-width", "1.5");
          circle.setAttribute("opacity", "1");
          g.appendChild(circle);
          if (dot.label) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", String(dot.x));
            text.setAttribute("y", String(dot.y + dot.r + 9));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "7");
            text.setAttribute("fill", "rgba(255,255,255,0.7)");
            text.setAttribute("font-family", "Plus Jakarta Sans, sans-serif");
            text.textContent = dot.label;
            g.appendChild(text);
          }
          svg.appendChild(g);
        });
      }
    }, 100);

    return () => clearInterval(iv);
  }, [visible]);

  return (
    <div className="mt-6 glass-dark rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-white font-bold text-2xl tabular-nums">
            {count.toLocaleString()}
            <span className="text-white/40 text-sm font-normal ml-2">agents initialized</span>
          </div>
          <div className="text-white/40 text-xs mt-0.5">
            {done ? "Swarm ready. 12 featured archetypes selected." : "Generating consumer agents..."}
          </div>
        </div>
        {done && (
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </div>

      {/* Segment legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {swarmSegments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-white/50 text-xs">{seg.name}</span>
            <span className="text-white/25 text-xs">({seg.count.toLocaleString()})</span>
          </div>
        ))}
      </div>

      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: 360 }}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
