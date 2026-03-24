"use client";

import { useEffect, useRef, useState } from "react";
import { allPosts, featuredPosts } from "@/data/simulation/mapleSimulationData";
import SimulationPostCard from "./SimulationPostCard";
import type { SimPost } from "@/lib/types";
import dynamic from "next/dynamic";

const SentimentChart = dynamic(() => import("./Stage3SentimentChart"), { ssr: false });

interface Props {
  onComplete: () => void;
}

const TOTAL_AGENTS = 1247;

export default function Stage3SocialFeed({ onComplete }: Props) {
  const [visiblePosts, setVisiblePosts] = useState<SimPost[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [interactions, setInteractions] = useState(0);
  const [chartIdx, setChartIdx] = useState(0);
  const twitterRef = useRef<HTMLDivElement>(null);
  const redditRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const countRef = useRef<ReturnType<typeof setInterval>>();

  // Agent counter tick-up
  useEffect(() => {
    let current = 0;
    countRef.current = setInterval(() => {
      current = Math.min(current + 7, TOTAL_AGENTS);
      setAgentCount(current);
      if (current >= TOTAL_AGENTS) clearInterval(countRef.current);
    }, 30);
    return () => clearInterval(countRef.current);
  }, []);

  // Post sequencing
  useEffect(() => {
    let i = 0;
    let interactionCount = 0;

    function scheduleNext() {
      if (i >= allPosts.length) {
        setAllLoaded(true);
        setChartIdx(7);
        return;
      }
      const post = allPosts[i];
      const isBg = post.type === "background";
      // Background posts: 500ms. Featured: first 5 = 2500ms, rest = 3500ms
      const delay = isBg ? 500 : (i < 8 ? 2500 : 3500);

      timeoutRef.current = setTimeout(() => {
        setVisiblePosts((prev) => [post, ...prev]);
        interactionCount += isBg ? 2 : 12;
        setInteractions(Math.min(interactionCount, 1247));
        // Update chart every ~25 posts
        if (i % 25 === 0) setChartIdx((prev) => Math.min(prev + 1, 7));
        i++;
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Auto-scroll to top when new posts arrive
  useEffect(() => {
    if (twitterRef.current) twitterRef.current.scrollTop = 0;
    if (redditRef.current) redditRef.current.scrollTop = 0;
  }, [visiblePosts]);

  const twitterPosts = visiblePosts.filter((p) => p.platform === "twitter");
  const redditPosts = visiblePosts.filter((p) => p.platform === "reddit");

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="flex items-center justify-between glass-dark rounded-xl p-4">
        <div>
          <div className="text-white font-bold text-2xl tabular-nums">
            {agentCount.toLocaleString()}
            <span className="text-white/40 text-sm font-normal ml-2">agents active across 6 consumer segments</span>
          </div>
          <div className="text-white/40 text-xs mt-0.5">
            Showing featured agent responses. {Math.max(agentCount - 12, 0).toLocaleString()} background agents contributing to sentiment analysis.
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-white/60 text-sm font-mono tabular-nums">{interactions.toLocaleString()}</div>
          <div className="text-white/30 text-xs">interactions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Twitter feed */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-blue-400">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-white/60 text-sm font-medium">Clearly Social</span>
            <span className="text-white/30 text-xs ml-auto">{twitterPosts.length} posts</span>
          </div>
          <div
            ref={twitterRef}
            className="flex flex-col gap-2 max-h-[520px] overflow-y-auto dark-scroll"
          >
            {twitterPosts.map((post, i) => (
              <SimulationPostCard key={post.id} post={post} isNew={i === 0} />
            ))}
            {twitterPosts.length === 0 && (
              <div className="glass-dark rounded-xl p-6 text-center text-white/20 text-sm">
                Waiting for agent reactions...
              </div>
            )}
          </div>
        </div>

        {/* Reddit feed */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-orange-400">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </div>
            <span className="text-white/60 text-sm font-medium">Clearly Forum</span>
            <span className="text-white/30 text-xs ml-auto">{redditPosts.length} posts</span>
          </div>
          <div
            ref={redditRef}
            className="flex flex-col gap-2 max-h-[520px] overflow-y-auto dark-scroll"
          >
            {redditPosts.map((post, i) => (
              <SimulationPostCard key={post.id} post={post} isNew={i === 0} />
            ))}
            {redditPosts.length === 0 && (
              <div className="glass-dark rounded-xl p-6 text-center text-white/20 text-sm">
                Forum discussion loading...
              </div>
            )}
          </div>
        </div>

        {/* Sentiment + stats */}
        <div className="flex flex-col gap-3">
          <SentimentChart currentDataIdx={chartIdx} />

          <div className="glass-dark rounded-xl p-4 flex flex-col gap-3">
            <div className="text-white/60 text-xs font-medium">Final Sentiment</div>
            {[
              { label: "Positive", value: 847, total: 1247, color: "#10B981" },
              { label: "Neutral", value: 231, total: 1247, color: "#F59E0B" },
              { label: "Friction", value: 169, total: 1247, color: "#EF4444" },
            ].map(({ label, value, total, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/50">{label}</span>
                  <span className="text-white/40">{value.toLocaleString()} ({Math.round(value / total * 100)}%)</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round(value / total * 100)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
            <div className="text-white/25 text-xs mt-1">Based on 1,247 agent interactions</div>
          </div>

          {allLoaded && (
            <button
              onClick={onComplete}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              Generate Report →
            </button>
          )}

          {!allLoaded && (
            <div className="glass-dark rounded-xl p-3 text-xs text-white/40 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Simulation running… {visiblePosts.filter((p) => p.type === "featured").length}/{featuredPosts.length} featured posts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
