"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import PersonaAvatar from "@/components/PersonaAvatar";
import PersonaPopover from "@/components/PersonaPopover";
import ResultsView from "@/components/ResultsView";
import LoadingOverlay from "@/components/LoadingOverlay";
import AllPersonasModal from "@/components/AllPersonasModal";
import type { Persona, ConversationTurn, AIStreamState, AnalysisResult } from "@/lib/types";

interface HomeSearchProps {
  onQuery: (q: string) => void;
  loading: boolean;
  onPersonaClick?: (id: string) => void;
  view: "home" | "results";
  turns: ConversationTurn[];
  onFollowUp: (q: string) => void;
  onBack: () => void;
  aiStream?: AIStreamState | null;
  lastAiAnalysis?: AnalysisResult | null;
  onPersonasLoaded?: (personas: Persona[]) => void;
}

const TEMPLATE_CARDS = [
  {
    color: "#60a5fa", // blue-400
    title: "How would Ethan and Gen Z react to Clearly Canadian Maple as a bar cocktail mixer?",
    consults: "Ethan, Marie, Aisha, Raj",
    iconPath: "M9 3h6l1 5H8L9 3zM5 8h14l-2 13H7L5 8zm5 4v6m4-6v6",
  },
  {
    color: "#c084fc", // purple-400
    title: "Compare brand perception of Clearly Canadian among Gen Z vs. Millennials in Canada",
    consults: "Chloe, Jake, Marie, Doug",
    iconPath: "M3 3v18h18M7 16l4-4 4 4 4-6",
  },
  {
    color: "#fbbf24", // amber-400
    title: "How effective is nostalgia marketing for lapsed fans who haven't bought Clearly Canadian in a decade?",
    consults: "Linda, Marcus, Doug",
    iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    color: "#34d399", // emerald-400
    title: "Would a Costco demo convert household buyers to switch from LaCroix?",
    consults: "Karen H., Marcus, Jake",
    iconPath: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7.5M17 13l1.5 7.5M10 20.5a.5.5 0 11-1 0 .5.5 0 011 0zm7 0a.5.5 0 11-1 0 .5.5 0 011 0z",
  },
  {
    color: "#fb7185", // rose-400
    title: "Test the message: 'Never Plastic. Clearly Canadian.'",
    consults: "All 12 personas",
    iconPath: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  },
  {
    color: "#2dd4bf", // teal-400
    title: "What would it take for each persona to try Clearly Canadian for the first time?",
    consults: "All potential customers",
    iconPath: "M5 3l14 9-14 9V3z",
  },
];

const PLACEHOLDER_QUESTIONS = [
  "How would U.S. Gen Z react to Clearly Canadian Maple at a bar?",
  "Is $8.99 too much for a Zero Sugar 6-pack?",
  "What would make LaCroix drinkers switch to Clearly Canadian?",
  "Would a TikTok origin story campaign work for Gen Z?",
  "Test the message: Never Plastic. Clearly Canadian.",
  "How would bartenders use Clearly Canadian Maple in cocktails?",
];

const BUBBLES = [
  { left: "8%",  size: 5, duration: 22, delay: 0  },
  { left: "15%", size: 4, duration: 28, delay: 5  },
  { left: "25%", size: 6, duration: 18, delay: 2  },
  { left: "35%", size: 3, duration: 32, delay: 8  },
  { left: "48%", size: 5, duration: 25, delay: 3  },
  { left: "60%", size: 4, duration: 20, delay: 7  },
  { left: "70%", size: 6, duration: 30, delay: 1  },
  { left: "80%", size: 3, duration: 24, delay: 6  },
  { left: "90%", size: 5, duration: 26, delay: 4  },
];

function getAwarenessColor(cc_awareness: string): string {
  const l = (cc_awareness ?? "").toLowerCase();
  if (l.includes("existing") || l.includes("loyal") || l.includes("buying") || l.includes("customer")) return "#10b981";
  if (l.includes("never") || l.includes("unaware") || l.includes("no awareness")) return "#ef4444";
  return "#f59e0b";
}

function DataPointsCounter() {
  const [dataPoints, setDataPoints] = useState(500);
  useEffect(() => {
    const id = setInterval(() => {
      setDataPoints(n => n + Math.floor(Math.random() * 16) + 5);
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return <>{dataPoints}+ Research Data Points</>;
}

const DESIGN_WIDTH = 1560;

export default function HomeSearch({
  onQuery,
  loading,
  onPersonaClick,
  view,
  turns,
  onFollowUp,
  onBack,
  aiStream,
  lastAiAnalysis,
  onPersonasLoaded,
}: HomeSearchProps) {
  const [input, setInput] = useState("");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredPersona, setHoveredPersona] = useState<{ persona: Persona; rect: DOMRect } | null>(null);
  const [showAllPersonas, setShowAllPersonas] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scale, setScale] = useState(1);
  const [windowHeight, setWindowHeight] = useState(900);

  useEffect(() => {
    function updateDimensions() {
      setScale(Math.min(1, (window.innerWidth - 32) / DESIGN_WIDTH));
      setWindowHeight(window.innerHeight);
    }
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    fetch("/api/personas")
      .then(r => r.json())
      .then(data => {
        const p = data.personas ?? [];
        setPersonas(p);
        onPersonasLoaded?.(p);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFocused || input) return;
    const id = setInterval(() => {
      setPlaceholderIdx(i => {
        setPrevIdx(i);
        return (i + 1) % PLACEHOLDER_QUESTIONS.length;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [isFocused, input]);

  function handleSubmit() {
    const q = input.trim();
    if (!q || loading) return;
    onQuery(q);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  function handleFocus() {
    if (restartRef.current) clearTimeout(restartRef.current);
    setIsFocused(true);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!e.target.value) {
      restartRef.current = setTimeout(() => setIsFocused(false), 1000);
    }
  }

  const personaAvatarMap = useMemo(
    () => new Map(personas.map(p => [p.name, p.avatar_url ?? ""])),
    [personas]
  );

  const displayed = personas.slice(0, 3);
  const extra = personas.length - displayed.length;

  // In results mode, size the panel so it fills the viewport after scaling
  const panelHeightPx = view === "results"
    ? Math.floor((windowHeight - 120) / scale)
    : undefined;

  const panelClass = view === "results"
    ? "w-full rounded-[48px] glass-panel overflow-hidden relative z-10 my-8"
    : "w-full rounded-[48px] glass-panel flex flex-col gap-10 p-10 relative z-10 my-8 dark-scroll";

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center relative">
      {/* Background */}
      <Image
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=90&w=3840&auto=format&fit=crop"
        alt=""
        fill
        quality={100}
        style={{ objectFit: "cover" }}
        priority
        className="absolute inset-0"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-[#2a3441]/80" />

      {/* Ambient bubbles */}
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            left: b.left,
            bottom: "-20px",
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* Main panel */}
      <div
        style={{
          width: DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          opacity: (loading && turns.length === 0) ? 0 : 1,
          pointerEvents: (loading && turns.length === 0) ? "none" : undefined,
          transition: "opacity 0.4s ease",
        }}
      >
        <div
          className={panelClass}
          style={panelHeightPx !== undefined ? { height: panelHeightPx } : undefined}
        >
          {/* Home content */}
          <div
            className={`transition-opacity duration-500 ${
              view === "home"
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none absolute inset-0 overflow-hidden"
            }`}
          >
            <div className="flex flex-col gap-10">
              {/* Top section */}
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h1 className="text-[4rem] font-bold font-sans text-white leading-tight tracking-tight">
                      Your consumer panel{" "}
                      <span>is ready.</span>
                    </h1>
                    <p className="text-white/75 text-[1.35rem] font-bold mt-3">
                      12 AI personas built on real market data. Test any product, price, message, or channel decision instantly.
                    </p>
                  </div>
                  <div className="swarm-btn-wrapper relative flex-shrink-0 p-[2px] rounded-full mt-1">
                    <div className="swarm-glow-ring absolute inset-0 rounded-full" />
                    <Link
                      href="/simulation"
                      className="relative flex items-center gap-3 glass-dark px-7 py-4 rounded-full text-lg font-semibold text-white/90 hover:text-white transition-all duration-200"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      Swarm Simulation
                    </Link>
                  </div>
                </div>

                {/* Search input */}
                <div className="glass-input rounded-full p-2 pl-8 flex items-center gap-3 transition-all">
                  <svg className="w-5 h-5 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="relative flex-1 overflow-hidden" style={{ height: "1.75rem" }}>
                    {prevIdx !== null && !input && !isFocused && (
                      <span
                        key={`out-${prevIdx}`}
                        className="placeholder-slide-out absolute left-0 top-0 text-xl text-white/40 pointer-events-none whitespace-nowrap"
                        onAnimationEnd={() => setPrevIdx(null)}
                      >
                        {PLACEHOLDER_QUESTIONS[prevIdx]}
                      </span>
                    )}
                    {!input && !isFocused && (
                      <span
                        key={`in-${placeholderIdx}`}
                        className="placeholder-slide-in absolute left-0 top-0 text-xl text-white/40 pointer-events-none whitespace-nowrap"
                      >
                        {PLACEHOLDER_QUESTIONS[placeholderIdx]}
                      </span>
                    )}
                    <input
                      className="bg-transparent text-xl text-white flex-1 outline-none w-full h-full"
                      value={input}
                      onChange={e => {
                        setInput(e.target.value);
                        if (restartRef.current) clearTimeout(restartRef.current);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !input.trim()}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-white/90 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="#2a3441" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Persona strip */}
              {personas.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-white/55 uppercase text-sm tracking-widest">Your Consumer Panel</span>
                  <div className="overflow-hidden">
                    <div className="flex gap-3 persona-marquee" style={{ width: "max-content" }}>
                      {[...personas, ...personas].map((p, i) => (
                        <button
                          key={`${p.id}-${i}`}
                          onClick={() => onPersonaClick?.(p.id)}
                          onMouseEnter={e => {
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                            setHoveredPersona({ persona: p, rect: e.currentTarget.getBoundingClientRect() });
                          }}
                          onMouseLeave={() => {
                            hoverTimeoutRef.current = setTimeout(() => setHoveredPersona(null), 120);
                          }}
                          className="shrink-0 w-96 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 cursor-pointer text-left transition-all flex gap-4 items-center"
                        >
                          {/* Avatar */}
                          <div className="shrink-0">
                            <PersonaAvatar name={p.name} avatarUrl={p.avatar_url} size="w-14 h-14" textSize="text-lg" />
                          </div>

                          {/* Profile info */}
                          <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-base">{p.name}</span>
                              <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: getAwarenessColor(p.cc_awareness ?? "") }}
                              />
                            </div>
                            <p className="text-white/65 text-sm leading-snug">
                              {p.generation} • {p.age_range} • {p.location ?? (p.market === "CA" ? "Canada" : p.market)}
                            </p>
                            <p className="text-white/80 text-sm leading-snug truncate">
                              {p.occupation ?? p.segment_label ?? p.customer_type}
                            </p>
                            <p className="text-white/55 text-sm leading-snug line-clamp-2 mt-0.5">
                              {p.cc_awareness_label ?? p.cc_awareness ?? p.behavioral_segment}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Template cards section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white/65 uppercase text-sm tracking-widest">Starting Templates</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {TEMPLATE_CARDS.map((card, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(card.title)}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-6 cursor-pointer group flex flex-col h-full min-h-[200px] text-left transition-all duration-200"
                      style={hoveredCard === i ? { boxShadow: `0 0 28px ${card.color}33`, transform: "scale(1.02)" } : {}}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shrink-0 transition-all duration-200"
                        style={{
                          backgroundColor: `${card.color}1a`,
                          border: `1px solid ${card.color}33`,
                          ...(hoveredCard === i ? { boxShadow: `0 0 18px ${card.color}40` } : {}),
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke={card.color} strokeWidth={1.75} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d={card.iconPath} />
                        </svg>
                      </div>

                      {/* Question text — dominates the card */}
                      <p className="text-white/90 text-lg font-semibold leading-snug group-hover:text-white transition-colors flex-1">
                        {card.title}
                      </p>

                      {/* Consults row */}
                      <div className="flex items-center gap-2 mt-4">
                        <div className="flex -space-x-1.5">
                          {card.consults.split(", ").slice(0, 4).map((name, ni) => (
                            <PersonaAvatar
                              key={ni}
                              name={name}
                              avatarUrl={personaAvatarMap.get(name) || undefined}
                              size="w-5 h-5"
                              textSize="text-[8px]"
                              className="border border-white/20"
                            />
                          ))}
                        </div>
                        <span className="font-mono text-white/45 text-[11px] truncate">{card.consults}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer bar */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-white/75 text-sm font-bold tracking-widest uppercase bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                  <DataPointsCounter />
                </span>
                <div className="flex items-center gap-6">
                  {personas.length > 0 && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {displayed.map(p => (
                            <PersonaAvatar
                              key={p.id}
                              name={p.name}
                              avatarUrl={p.avatar_url}
                              size="w-8 h-8"
                              textSize="text-xs"
                              className="border-2 border-[#2a3441]"
                            />
                          ))}
                          {extra > 0 && (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white border-2 border-[#2a3441]">
                              +{extra}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                          <span className="font-mono text-white/50 text-xs uppercase tracking-widest">
                            {personas.length} Active Personas
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAllPersonas(true)}
                        className="flex items-center gap-2 text-white/50 hover:text-white/90 text-xs font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        View All Personas
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results content */}
          <div
            className={`transition-opacity duration-500 h-full ${
              view === "results"
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none absolute inset-0"
            }`}
          >
            <ResultsView
              turns={turns}
              loading={loading}
              onFollowUp={onFollowUp}
              onBack={onBack}
              onPersonaClick={onPersonaClick}
              personas={personas}
              aiStream={aiStream}
              lastAiAnalysis={lastAiAnalysis}
            />
          </div>
        </div>
      </div>

      <LoadingOverlay
        visible={loading && turns.length === 0}
        personas={personas}
        query={input}
      />

      {showAllPersonas && (
        <AllPersonasModal
          personas={personas}
          onClose={() => setShowAllPersonas(false)}
        />
      )}

      {/* Persona hover popover — rendered via portal to escape overflow:hidden */}
      {hoveredPersona && (
        <PersonaPopover
          persona={hoveredPersona.persona}
          rect={hoveredPersona.rect}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => setHoveredPersona(null), 120);
          }}
        />
      )}
    </div>
  );
}
