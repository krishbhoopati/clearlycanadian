"use client";

import { useEffect, useState } from "react";
import type { SimPost } from "@/lib/types";

interface Props {
  post: SimPost;
  isNew: boolean;
}

const SENTIMENT_COLORS = {
  positive: "text-emerald-400",
  neutral: "text-yellow-400",
  friction: "text-red-400",
};

function HeartIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

// Featured (full) post
function FeaturedPost({ post, isNew }: Props) {
  const [displayed, setDisplayed] = useState(isNew ? "" : post.body);
  const [done, setDone] = useState(!isNew);

  useEffect(() => {
    if (!isNew) return;
    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      setDisplayed(post.body.slice(0, idx));
      if (idx >= post.body.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, 22);
    return () => clearInterval(iv);
  }, [isNew, post.body]);

  const initials = post.persona_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="glass-dark rounded-xl p-4 animate-sim-post-in">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          style={{ backgroundColor: post.avatar_color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{post.persona_name}</span>
            <span className="text-white/40 text-xs">{post.handle}</span>
            {post.subreddit && (
              <span className="text-white/30 text-xs">in {post.subreddit}</span>
            )}
            <span className="text-white/30 text-xs ml-auto">{post.timestamp_label}</span>
          </div>
          <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
            {displayed}
            {!done && <span className="animate-report-cursor text-blue-400">|</span>}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`flex items-center gap-1 text-xs ${SENTIMENT_COLORS[post.sentiment]}`}>
              <HeartIcon /> {post.likes}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <CommentIcon /> {post.replies}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Background (compact) post
function BackgroundPost({ post, isNew }: Props) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 animate-sim-post-in ${isNew ? "" : ""}`}>
      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        <span className="text-white/30 text-[8px] font-mono">#</span>
      </div>
      <span className="text-white/30 text-xs font-mono flex-shrink-0">
        Agent {post.agentId} ({post.segment}, {post.city}):
      </span>
      <span className="text-white/50 text-xs truncate italic">"{post.body}"</span>
    </div>
  );
}

export default function SimulationPostCard(props: Props) {
  if (props.post.type === "background") return <BackgroundPost {...props} />;
  return <FeaturedPost {...props} />;
}
