"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { twitterPostSequence, redditPostSequence, sentimentTimeline, socialGraphEvents } from "@/data/simulation/mapleSimulationData";
import SimulationPostCard from "./SimulationPostCard";
import type { SimPost, GraphNode, GraphLink } from "@/lib/types";

const SEGMENT_NODES: Record<string, string> = {
  "Gen Z": "seg-genz",
  "Millennial": "seg-millennials",
  "Gen X": "seg-genx",
  "Boomer": "seg-boomer",
};

const SEGMENT_COLORS: Record<string, string> = {
  "Gen Z": "#8B5CF6",
  "Millennial": "#3B82F6",
  "Gen X": "#F59E0B",
  "Boomer": "#F97316",
};
import dynamic from "next/dynamic";

const SentimentChart = dynamic(() => import("./Stage3SentimentChart"), { ssr: false });

interface Props {
  onComplete: () => void;
  onGraphEvent?: (nodes: GraphNode[], links: GraphLink[]) => void;
}

const TOTAL_EVENTS = 1847;
const TOTAL_ROUNDS = 48;

export default function Stage4SocialFeed({ onComplete, onGraphEvent }: Props) {
  const [twitterPosts, setTwitterPosts] = useState<SimPost[]>([]);
  const [redditPosts, setRedditPosts] = useState<SimPost[]>([]);
  const [done, setDone] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [round, setRound] = useState(0);
  const [chartIdx, setChartIdx] = useState(0);
  const twitterRef = useRef<HTMLDivElement>(null);
  const redditRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const addedNodesRef = useRef<Set<string>>(new Set());

  const addPost = useCallback((platform: "twitter" | "reddit", post: SimPost) => {
    if (platform === "twitter") {
      setTwitterPosts((prev) => [post, ...prev].slice(0, 30));
      setTimeout(() => twitterRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } else {
      setRedditPosts((prev) => [post, ...prev].slice(0, 30));
      setTimeout(() => redditRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }

    // Add poster as a new knowledge graph node (once per unique poster)
    if (onGraphEvent) {
      const nodeId = post.type === "featured"
        ? `sf-${post.persona_id}`
        : `sf-bg-${post.agentId}`;

      if (nodeId && !addedNodesRef.current.has(nodeId)) {
        addedNodesRef.current.add(nodeId);

        const platformTarget = platform === "twitter" ? "sm-twitter" : "sm-reddit";
        const links: GraphLink[] = [
          { source: nodeId, target: platformTarget, edgeLabel: "POSTED_ON", wave: 6 },
        ];

        let node: GraphNode;
        if (post.type === "featured") {
          node = {
            id: nodeId,
            label: post.persona_name,
            group: "people",
            color: post.avatar_color,
            wave: 6,
            tooltip: `${post.handle} · ${post.sentiment} sentiment`,
          };
        } else {
          const segTarget = SEGMENT_NODES[post.segment ?? ""];
          if (segTarget) {
            links.push({ source: nodeId, target: segTarget, edgeLabel: "IS_SEGMENT", wave: 6 });
          }
          node = {
            id: nodeId,
            label: `${post.segment ?? "Agent"} · ${post.city ?? ""}`.replace(/· $/, "").trim(),
            group: "sim_agent",
            color: SEGMENT_COLORS[post.segment ?? ""] ?? "#94A3B8",
            wave: 6,
            isMicro: true,
            tooltip: `${post.segment} from ${post.city}`,
          };
        }
        onGraphEvent([node], links);
      }
    }
  }, [onGraphEvent]);

  useEffect(() => {
    const timers = timersRef.current;
    let finishedFeeds = 0;
    const totalFeeds = 2;

    function scheduleSequence(
      posts: SimPost[],
      platform: "twitter" | "reddit",
      bgDelay: [number, number],
      featDelay: [number, number]
    ) {
      let accDelay = 0;
      posts.forEach((post) => {
        const delay = post.type === "background"
          ? bgDelay[0] + Math.random() * (bgDelay[1] - bgDelay[0])
          : featDelay[0] + Math.random() * (featDelay[1] - featDelay[0]);
        accDelay += delay;
        const t = setTimeout(() => addPost(platform, post), accDelay);
        timers.push(t);
      });
      const doneT = setTimeout(() => {
        finishedFeeds++;
        if (finishedFeeds >= totalFeeds) {
          setDone(true);
          setChartIdx(sentimentTimeline.length - 1);
        }
      }, accDelay + 200);
      timers.push(doneT);
    }

    // Start both simultaneously
    scheduleSequence(twitterPostSequence, "twitter", [150, 280], [700, 1000]);
    scheduleSequence(redditPostSequence, "reddit", [180, 300], [750, 1100]);

    // Round counter — ticks every ~500ms up to 48 rounds (~24s total)
    const roundInterval = setInterval(() => {
      setRound((r) => {
        if (r >= TOTAL_ROUNDS) { clearInterval(roundInterval); return r; }
        return r + 1;
      });
    }, 500);
    timers.push(roundInterval as unknown as ReturnType<typeof setTimeout>);

    // Event counter — ticks rapidly to ~1847
    let ev = 0;
    const evInterval = setInterval(() => {
      ev = Math.min(ev + Math.floor(Math.random() * 12 + 5), TOTAL_EVENTS);
      setEventCount(ev);
      // Also advance chart periodically
      setChartIdx((c) => Math.min(c + 1, sentimentTimeline.length - 1));
      if (ev >= TOTAL_EVENTS) clearInterval(evInterval);
    }, 50);
    timers.push(evInterval as unknown as ReturnType<typeof setTimeout>);

    return () => {
      timers.forEach((t) => clearTimeout(t));
      clearInterval(roundInterval);
      clearInterval(evInterval);
    };
  }, [addPost]);

  // Fire graph events when round milestones are reached
  useEffect(() => {
    if (round === 0) return;
    const events = socialGraphEvents.filter((e) => e.round === round);
    events.forEach((e) => onGraphEvent?.([e.node], e.links));
  }, [round, onGraphEvent]);

  const positiveCount = Math.round(eventCount * 0.48);
  const neutralCount = Math.round(eventCount * 0.33);
  const frictionCount = eventCount - positiveCount - neutralCount;

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <div className="text-slate-800 font-bold text-3xl font-mono">{round}/{TOTAL_ROUNDS}</div>
          <div className="text-slate-400 text-sm">Round</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <div className="text-slate-800 font-bold text-3xl font-mono">{eventCount.toLocaleString()}</div>
          <div className="text-slate-400 text-sm">Total Events</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <div className="text-slate-800 font-bold text-3xl font-mono">1,247</div>
          <div className="text-slate-400 text-sm">Active Agents</div>
        </div>
      </div>

      {/* Dual feed columns — stacked in narrow sidebar */}
      <div className="flex flex-col gap-4">
        {/* Twitter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-sky-600 text-base font-medium">Twitter / X</span>
            <span className="text-slate-400 text-sm">· {twitterPosts.length} posts</span>
          </div>
          <div
            ref={twitterRef}
            className="h-[280px] overflow-y-auto light-scroll flex flex-col gap-2 pr-1 bg-slate-50 border border-slate-200 rounded-xl p-2"
          >
            {twitterPosts.map((post) => (
              <div key={post.id} className="animate-sim-post-in">
                <SimulationPostCard post={post} isNew={true} />
              </div>
            ))}
            {twitterPosts.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-400 text-base flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Waiting for posts…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reddit */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
            <span className="text-orange-600 text-base font-medium">Reddit</span>
            <span className="text-slate-400 text-sm">· {redditPosts.length} posts</span>
          </div>
          <div
            ref={redditRef}
            className="h-[280px] overflow-y-auto light-scroll flex flex-col gap-2 pr-1 bg-slate-50 border border-slate-200 rounded-xl p-2"
          >
            {redditPosts.map((post) => (
              <div key={post.id} className="animate-sim-post-in">
                <SimulationPostCard post={post} isNew={true} />
              </div>
            ))}
            {redditPosts.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-400 text-base flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Waiting for posts…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment bars + chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-600 text-sm font-medium">Sentiment Distribution</div>
          <div className="text-slate-400 text-sm font-mono">{eventCount.toLocaleString()} events analyzed</div>
        </div>
        <div className="flex gap-3 mb-4">
          {[
            { label: "Positive", count: positiveCount, color: "bg-emerald-500" },
            { label: "Neutral", count: neutralCount, color: "bg-slate-300" },
            { label: "Friction", count: frictionCount, color: "bg-red-400" },
          ].map((s) => (
            <div key={s.label} className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 text-sm">{s.label}</span>
                <span className="text-slate-600 text-sm font-mono">{s.count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.color} rounded-full transition-all duration-300`}
                  style={{ width: eventCount > 0 ? `${(s.count / eventCount) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
        <SentimentChart currentDataIdx={chartIdx} />
      </div>

      {done && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-sm transition-all duration-200"
          >
            Start Generating Results Report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
