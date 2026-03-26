"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { graphNodes, graphLinks } from "@/data/simulation/mapleSimulationData";
import type { GraphNode, GraphLink } from "@/lib/types";

interface Props {
  visible: boolean;
  onToggle: () => void;
  buildStarted: boolean;
  pendingNodes?: GraphNode[];
  pendingLinks?: GraphLink[];
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

interface CanvasAgent {
  id: string;
  color: string;
  x: number;       // absolute random position on canvas
  y: number;
  targets: string[]; // all entity node IDs to draw lines to
}

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
  agent: "Simulation Agent",
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

export default function PersistentGraphPanel({ visible, onToggle, buildStarted, pendingNodes, pendingLinks }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInit = useRef(false);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);

  // Refs that expose live D3 state for dynamic node injection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const forceLinkRef = useRef<any>(null);
  const nodesRef = useRef<Array<GraphNode & { revealed?: boolean; x?: number; y?: number; fx?: number | null; fy?: number | null }>>([]);
  const linksRef = useRef<GraphLink[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d3Ref = useRef<any>(null);
  const nodeMapRef = useRef<Map<string, GraphNode>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const agentLayerRef = useRef<CanvasAgent[]>([]);
  const zoomTransformRef = useRef<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1 });
  const drawCanvasRef = useRef<(() => void) | null>(null);

  // We store D3 selections in refs so click handlers can access them
  const nodeSyncRef = useRef<{
    resetAll: () => void;
    highlightPath: (pathNodeIds: Set<string>, pathEdgeKeys: Set<string>) => void;
  } | null>(null);

  useEffect(() => {
    if (!buildStarted || !svgRef.current || hasInit.current) return;
    hasInit.current = true;

    import("d3").then((d3) => {
      d3Ref.current = d3;
      const svg = d3.select(svgRef.current!);
      const rect = svgRef.current!.getBoundingClientRect();
      const W = rect.width || 400;
      const H = rect.height || 600;

      if (canvasRef.current) { canvasRef.current.width = W; canvasRef.current.height = H; }

      svg.selectAll("*").remove();

      const g = svg.append("g");

      // Zoom + pan
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
          zoomTransformRef.current = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
          drawCanvasRef.current?.();
        });
      svg.call(zoom);

      type DNode = GraphNode & d3.SimulationNodeDatum & { revealed?: boolean };
      type DLink = { source: string | DNode; target: string | DNode; label?: string; edgeLabel?: string; strength?: number; isDotted?: boolean; wave?: number };

      const nodes: DNode[] = graphNodes.map((n) => ({ ...n, revealed: false }));
      const links: DLink[] = graphLinks.map((l) => ({ ...l }));

      // Populate refs for dynamic injection
      nodesRef.current = nodes as GraphNode[];
      linksRef.current = links as GraphLink[];

      const nodeMap = new Map<string, DNode>(nodes.map((n) => [n.id, n]));
      nodeMapRef.current = nodeMap as Map<string, GraphNode>;

      function nodeRadius(n: DNode) {
        if (n.group === "center") return 24;
        if (n.isMicro) return 5;
        return 13;
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

      const forceLink = d3.forceLink<DNode, DLink>(links)
        .id((d) => d.id)
        .distance((l) => {
          const src = typeof l.source === "object" ? l.source as DNode : nodeMap.get(l.source as string);
          const tgt = typeof l.target === "object" ? l.target as DNode : nodeMap.get(l.target as string);
          if (src?.isMicro || tgt?.isMicro) return 100;
          return 200 + (1 - ((l as GraphLink).strength ?? 0.5)) * 120;
        })
        .strength(0.25);
      forceLinkRef.current = forceLink;

      const sim = d3.forceSimulation<DNode>(nodes)
        .force("link", forceLink)
        .force("charge", d3.forceManyBody().strength((d) => (d as DNode).isMicro ? -60 : -400))
        .force("center", d3.forceCenter(W / 2, H / 2).strength(0.04))
        .force("collision", d3.forceCollide<DNode>().radius((d) => nodeRadius(d) + 10));
      simRef.current = sim;

      // Links
      const linkGroup = g.append("g");
      linkGroupRef.current = linkGroup;
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
      nodeGroupRef.current = nodeGroup;
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

      // Label badge backgrounds (white pill, rendered before text so it sits behind)
      const labelData = nodes.filter((n) => !n.isMicro);
      const labelBgSel = nodeGroup.selectAll<SVGRectElement, DNode>("rect.label-bg")
        .data(labelData)
        .enter()
        .append("rect")
        .attr("class", "label-bg")
        .attr("rx", 4).attr("ry", 4)
        .attr("height", 17)
        .attr("width", (d) => {
          const t = d.label.length > 18 ? d.label.slice(0, 16) + "…" : d.label;
          return t.length * (d.group === "center" ? 7.5 : 6.5) + 14;
        })
        .attr("fill", "rgba(255,255,255,0.93)")
        .attr("opacity", 0);

      // Labels (main nodes only — dark text positioned right of node)
      const labelSel = nodeGroup.selectAll<SVGTextElement, DNode>("text")
        .data(labelData)
        .enter()
        .append("text")
        .attr("text-anchor", "start")
        .attr("font-size", (d) => d.group === "center" ? 12 : 10)
        .attr("font-weight", "600")
        .attr("font-family", "Plus Jakarta Sans, sans-serif")
        .attr("fill", "#0f172a")
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
        labelBgSel.transition().duration(200).attr("opacity", 1);
        labelSel
          .transition().duration(200)
          .attr("opacity", 1)
          .attr("fill", "#0f172a")
          .attr("font-size", (d) => d.group === "center" ? 12 : 10);
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
        labelBgSel.transition().duration(200).attr("opacity", (d) => pathNodeIds.has(d.id) ? 1 : 0.05);
        labelSel
          .transition().duration(200)
          .attr("opacity", (d) => pathNodeIds.has(d.id) ? 1 : 0.05)
          .attr("fill", (d) => pathNodeIds.has(d.id) ? "#1e40af" : "#0f172a")
          .attr("font-size", (d) => pathNodeIds.has(d.id) ? (d.group === "center" ? 13 : 11) : (d.group === "center" ? 12 : 10));
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
        // Use selectAll so newly injected elements are included automatically
        linkGroup.selectAll("line")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr("x1", (d: any) => (d.source?.x ?? 0))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr("y1", (d: any) => (d.source?.y ?? 0))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr("x2", (d: any) => (d.target?.x ?? 0))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr("y2", (d: any) => (d.target?.y ?? 0));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeGroup.selectAll("circle").attr("cx", (d: any) => d.x ?? 0).attr("cy", (d: any) => d.y ?? 0);
        // Label bg rects — positioned to the right of each node
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeGroup.selectAll<SVGRectElement, any>("rect.label-bg")
          .attr("x", (d) => (d.x ?? 0) + nodeRadius(d) + 5)
          .attr("y", (d) => (d.y ?? 0) - 8.5);
        // Labels — right-side badge text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeGroup.selectAll("text").attr("x", (d: any) => (d.x ?? 0) + nodeRadius(d) + 12).attr("y", (d: any) => (d.y ?? 0) + 4);
        drawCanvasRef.current?.();
      });

      // Canvas draw: renders agent swarm overlay (1,235 synthetic agents)
      function drawAgentCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;
        const { x: tx, y: ty, k } = zoomTransformRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(k, k);

        // Batch lines by color for performance
        const linesByColor = new Map<string, Array<[number, number, number, number]>>();
        const dotsByColor = new Map<string, Array<[number, number]>>();

        for (const agent of agentLayerRef.current) {
          if (!linesByColor.has(agent.color)) linesByColor.set(agent.color, []);
          if (!dotsByColor.has(agent.color)) dotsByColor.set(agent.color, []);

          for (const tId of agent.targets) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const t = nodeMapRef.current.get(tId) as any;
            if (t?.x == null || t?.y == null) continue;
            linesByColor.get(agent.color)!.push([agent.x, agent.y, t.x, t.y]);
          }
          dotsByColor.get(agent.color)!.push([agent.x, agent.y]);
        }

        // Draw all lines — visible enough to show relationships without overwhelming
        ctx.lineWidth = 0.8;
        linesByColor.forEach((lines, color) => {
          ctx.strokeStyle = color + "38"; // ~22% alpha — faint colored threads
          ctx.beginPath();
          for (const [x1, y1, x2, y2] of lines) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.stroke();
        });

        // Draw dots (3.5px radius, very faint — ghost-like so main nodes pop)
        dotsByColor.forEach((dots, color) => {
          ctx.fillStyle = color + "22"; // ~13% alpha — very faint pastel tint
          ctx.beginPath();
          for (const [x, y] of dots) {
            ctx.moveTo(x + 3.5, y);
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          }
          ctx.fill();
        });

        ctx.restore();
      }
      drawCanvasRef.current = drawAgentCanvas;

      // 6-wave reveal
      const WAVE_DELAY = 1500;
      for (let wave = 1; wave <= 6; wave++) {
        const waveNodes = nodes.filter((n) => n.wave === wave);
        const waveStart = (wave - 1) * WAVE_DELAY + 300;
        waveNodes.forEach((node, i) => {
          setTimeout(() => {
            d3.selectAll<SVGCircleElement, DNode>("circle")
              .filter((d) => d?.id === node.id)
              .transition().duration(400)
              .attr("opacity", node.isMicro ? 0.35 : 0.9);
            d3.selectAll<SVGRectElement, DNode>("rect.label-bg")
              .filter((d) => d?.id === node.id)
              .transition().duration(400)
              .attr("opacity", 1);
            d3.selectAll<SVGTextElement, DNode>("text")
              .filter((d) => d?.id === node.id)
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

      return () => {
        sim.stop();
        tooltip.remove();
      };
    });
  }, [buildStarted]);

  // Dynamically inject new nodes/links as social simulation progresses
  useEffect(() => {
    const d3 = d3Ref.current;
    const sim = simRef.current;
    const nodeGroup = nodeGroupRef.current;
    const linkGroup = linkGroupRef.current;
    const forceLink = forceLinkRef.current;
    if (!d3 || !sim || !nodeGroup || !linkGroup || !pendingNodes?.length) return;

    const existingIds = new Set(nodesRef.current.map((n) => n.id));
    let addedRegularNode = false;

    pendingNodes.forEach((newNode) => {
      if (existingIds.has(newNode.id)) return;
      existingIds.add(newNode.id);

      // Synthetic agents (syn-*) go to canvas layer only — not D3 sim or SVG
      if (newNode.id.startsWith("syn-")) {
        const nodeLinks = (pendingLinks ?? []).filter(l => l.source === newNode.id);
        const targets = nodeLinks.map(l => l.target as string).filter(Boolean);

        // Organic elliptical scatter — fills the panel area with no visible rectangular edge
        const W = canvasRef.current?.width ?? 600;
        const H = canvasRef.current?.height ?? 400;
        const idx = agentLayerRef.current.length;
        const s1 = (((idx * 2654435761) >>> 0) ^ 0x9e3779b9) >>> 0;
        const s2 = ((s1 * 1664525 + 1013904223) >>> 0);
        const s3 = ((s2 * 1664525 + 1013904223) >>> 0);
        const s4 = ((s3 * 1664525 + 1013904223) >>> 0);
        const angle = (s1 / 0x100000000) * Math.PI * 2;
        // Uniform ellipse fill (sqrt gives uniform disc density)
        const baseR = Math.sqrt(s2 / 0x100000000);
        // Per-angle radius noise: each direction gets a unique perturbation so the edge is jagged/organic
        const angularNoise = 0.7 + (s3 / 0x100000000) * 0.6; // 0.7–1.3
        const radialSpike = 1 + (s4 / 0x100000000) * 0.4;    // occasional outward spikes
        const r = baseR * angularNoise * radialSpike;
        const x = W / 2 + Math.cos(angle) * r * W * 0.48;
        const y = H / 2 + Math.sin(angle) * r * H * 0.46;

        agentLayerRef.current.push({ id: newNode.id, color: newNode.color, x, y, targets });
        return; // Skip D3 sim + SVG entirely
      }

      addedRegularNode = true;

      // Add to data arrays
      const dNode = { ...newNode, revealed: true };
      nodesRef.current.push(dNode);
      nodeMapRef.current.set(newNode.id, newNode);

      const newLinks = (pendingLinks ?? []).filter((l) => {
        if (l.source !== newNode.id && l.target !== newNode.id) return false;
        // Only add link if both endpoints exist in the simulation
        const srcId = typeof l.source === "string" ? l.source : (l.source as { id: string }).id;
        const tgtId = typeof l.target === "string" ? l.target : (l.target as { id: string }).id;
        return existingIds.has(srcId) && existingIds.has(tgtId);
      });
      newLinks.forEach((l) => linksRef.current.push(l));

      // Append SVG circle
      nodeGroup.append("circle")
        .datum(dNode)
        .attr("r", dNode.isMicro ? 4 : (dNode.group === "center" ? 18 : 9))
        .attr("fill", dNode.isMicro ? dNode.color + "55" : dNode.color)
        .attr("stroke", dNode.isMicro ? "none" : "#3B82F6")
        .attr("stroke-width", dNode.isMicro ? 0 : 3)
        .attr("opacity", 0)
        .style("cursor", dNode.isMicro ? "default" : "pointer")
        .transition().duration(dNode.isMicro ? 200 : 500)
        .attr("opacity", dNode.isMicro ? 0.35 : 0.9)
        .on("end", function(this: SVGCircleElement) {
          if (!dNode.isMicro) {
            d3.select(this)
              .transition().delay(2000).duration(600)
              .attr("stroke", "rgba(255,255,255,0.12)")
              .attr("stroke-width", 1);
          }
        });

      // Append SVG label badge (skip for micro nodes)
      if (!dNode.isMicro) {
        const truncLabel = newNode.label.length > 18 ? newNode.label.slice(0, 16) + "…" : newNode.label;
        const r = dNode.group === "center" ? 18 : 9;
        nodeGroup.append("rect")
          .datum(dNode)
          .attr("class", "label-bg")
          .attr("rx", 4).attr("ry", 4)
          .attr("height", 17)
          .attr("width", truncLabel.length * (dNode.group === "center" ? 7.5 : 6.5) + 14)
          .attr("x", r + 5)
          .attr("y", -8.5)
          .attr("fill", "rgba(255,255,255,0.93)")
          .attr("opacity", 0)
          .transition().duration(500)
          .attr("opacity", 1);
        nodeGroup.append("text")
          .datum(dNode)
          .attr("text-anchor", "start")
          .attr("font-size", dNode.group === "center" ? 12 : 10)
          .attr("font-weight", "600")
          .attr("font-family", "Plus Jakarta Sans, sans-serif")
          .attr("fill", "#0f172a")
          .attr("opacity", 0)
          .text(truncLabel)
          .transition().duration(500)
          .attr("opacity", 1);
      }

      // Append SVG lines for new links
      newLinks.forEach((l) => {
        linkGroup.append("line")
          .datum(l)
          .attr("stroke", "#94a3b8")
          .attr("stroke-width", 1.2)
          .attr("opacity", 0)
          .transition().duration(600)
          .attr("opacity", 0.5);
      });
    });

    if (addedRegularNode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sim.nodes(nodesRef.current as any);
      if (forceLink) forceLink.links(linksRef.current);
      sim.alpha(0.3).restart();
    }
    drawCanvasRef.current?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNodes]);

  return (
    <div
      className="flex flex-col h-full transition-all duration-300 overflow-hidden bg-slate-50"
      style={{ width: visible ? undefined : 0, opacity: visible ? 1 : 0 }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-[11px] font-medium border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-50 transition-colors duration-150"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Knowledge Graph</div>
        </div>
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
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <svg ref={svgRef} className="w-full h-full relative" style={{ zIndex: 1 }} />

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
