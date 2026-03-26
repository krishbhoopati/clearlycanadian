"use client";

import { useEffect, useRef, useState } from "react";
import { simulationAgents, followUpResponses, reportSections } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";
import PersonaChatModal from "@/components/PersonaChatModal";
import type { SimAgent } from "@/lib/types";
import personasData from "@/data/processed/personas.json";

interface Props {
  onPersonaChat: (personaId: string) => void;
}

// Maps persona_id → avatar_url (from data/processed/personas.json)
const PERSONA_AVATARS: Record<string, string> = {
  ca_genz_potential:    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
  ca_mill_potential:    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  ca_genz_sober_curious:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
  ca_mill_loyal:        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  us_genz_potential:    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face",
  us_mill_lapsed:       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  us_genz_wellness:     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
  us_mill_convenience:  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  nostalgia_loyalist:   "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
  premium_lifestyle:    "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200&h=200&fit=crop&crop=face",
  household_stockup:    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
  bartender_mixologist: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face",
};

type Mode = "report" | "agents";

interface Message {
  role: "user" | "agent";
  text: string;
  agentColor?: string;
  agentName?: string;
  agentAvatarUrl?: string;
}

// Show 6 pill shortcuts — exact Q&A lookup only
const SUGGESTED_QUESTIONS = Object.keys(followUpResponses).slice(0, 6);

// ─── Paragraph chunk retrieval engine ────────────────────────────────────────

const STOP_WORDS = new Set([
  "the","is","are","was","were","what","who","how","why","when","where","does","tell",
  "about","me","us","our","its","it","in","on","at","to","for","and","or","of","a","an",
  "do","did","be","been","with","from","by","that","this","can","we","you","my","your",
  "should","would","could","will","more","give","get","some","have","has","had","not",
  "they","them","their","just","also","than","then","there","here","which","very","any",
]);

const SECTION_TITLES: Record<number, string> = {
  1: "STP & Consumer Behavior",
  2: "Marketing Mix & Distribution",
  3: "Launch Roadmap & KPIs",
  4: "Competitor Benchmarks",
  5: "Risk & Failure Analysis",
};

interface ReportChunk {
  section: number;
  title: string;
  text: string;
  keywords: Set<string>;
}

// Pre-process report into paragraph chunks at module load (reportSections is a static import)
const REPORT_CHUNKS: ReportChunk[] = (() => {
  const chunks: ReportChunk[] = [];
  for (const [key, content] of Object.entries(reportSections)) {
    const n = Number(key);
    const title = SECTION_TITLES[n] ?? `Section ${n}`;
    // Group consecutive non-empty lines into paragraph blocks
    const paragraphs: string[] = [];
    let current: string[] = [];
    for (const line of content.split("\n")) {
      const clean = line.replace(/\*\*/g, "").replace(/^\s*[#\-*]\s*/, "").trim();
      if (clean.length > 0) {
        current.push(clean);
      } else if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    }
    if (current.length > 0) paragraphs.push(current.join(" "));

    for (const para of paragraphs) {
      if (para.length < 40) continue;
      const keywords = new Set(
        para.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
      );
      if (keywords.size >= 3) chunks.push({ section: n, title, text: para, keywords });
    }
  }
  return chunks;
})();

const CHAT_FALLBACK = `The CC Maple Zero simulation covers five report sections: **STP & Consumer Behavior**, **Marketing Mix**, **Launch Roadmap & KPIs**, **Competitor Benchmarks**, and **Risk Analysis**.\n\nTry asking about a specific topic — for example: "Topo Chico", "Sofia archetype", "airport channels", "zero sugar risk", "KPIs", or "pricing strategy".`;

// Intent keyword → section priority mapping
const INTENT_SECTIONS: Array<{ keywords: string[]; sections: number[] }> = [
  { keywords: ["sofia", "chloe", "raj", "jake", "persona", "segment", "archetype", "consumer", "behavior", "scrutinizer", "discovery", "lifestyle", "curator", "experience", "stp"], sections: [1] },
  { keywords: ["channel", "airport", "souvenir", "hotel", "grocery", "campaign", "sugaring", "mixology", "distribution", "pricing", "sku", "format", "retail", "promotion", "on-premise", "ecommerce"], sections: [2] },
  { keywords: ["kpi", "metric", "timeline", "roadmap", "launch", "gantt", "milestone", "dashboard", "track", "awareness", "conversion", "foundation", "build", "activate", "optimize"], sections: [3] },
  { keywords: ["competitor", "bubly", "topo", "poppi", "olipop", "maple3", "lacroix", "perrier", "spindrift", "benchmark", "pricing", "comparison", "versus", "compete"], sections: [4] },
  { keywords: ["risk", "failure", "loyalist", "backlash", "backlash", "zero", "sugar", "sweetener", "premium", "trial", "low", "mismatch", "concern", "danger", "problem", "threat"], sections: [5] },
];

const SECTION_STRATEGIC_NOTES: Record<number, string> = {
  1: "**Strategic note:** Consumer segment behavior drives all downstream channel and campaign decisions. Understanding each archetype's conversion trigger — and what blocks them — is the foundation of the entire launch plan.",
  2: "**Strategic note:** Channel selection precedes campaign execution. Establishing premium context in tourist and airport retail before entering mass grocery is the single most important sequencing decision in the go-to-market.",
  3: "**Strategic note:** The six-month Gantt is sequenced deliberately — premium context first, sampling scale second, household distribution third. Skipping steps collapses the premium signal.",
  4: "**Strategic note:** Competitive differentiation in this category is won by owning a distinct context (tourism, bar, wellness) — not by out-spending on distribution or pricing below the competition.",
  5: "**Strategic note:** Risk mitigation is front-loaded in the launch timeline. Label compliance and channel separation are mandatory gates, not optimizations — and the zero sugar claim must clear Health Canada before any public activation.",
};

function answerQuestion(question: string): string {
  const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  if (qWords.length === 0) return CHAT_FALLBACK;

  // ── Phase A: fuzzy-match against followUpResponses ──────────────────────────
  let bestKey: string | null = null;
  let bestScore = 0;
  for (const key of Object.keys(followUpResponses)) {
    const keyWords = key.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    let score = 0;
    for (const qw of qWords) {
      for (const kw of keyWords) {
        if (kw === qw) score += 3;
        else if (kw.length > 3 && qw.length > 3 && (kw.includes(qw) || qw.includes(kw))) score += 1;
      }
    }
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }
  // Return pre-built answer if match is strong (≥4 ≈ two meaningful keyword overlaps)
  if (bestKey && bestScore >= 4) {
    return followUpResponses[bestKey];
  }

  // ── Phase B: intent detection → section priority boost ──────────────────────
  const sectionBonus = new Map<number, number>();
  for (const qw of qWords) {
    for (const { keywords, sections } of INTENT_SECTIONS) {
      if (keywords.some(k => qw.includes(k) || k.includes(qw))) {
        for (const s of sections) sectionBonus.set(s, (sectionBonus.get(s) ?? 0) + 2);
      }
    }
  }

  // ── Phase C: score chunks with intent boost, retrieve up to 6 ───────────────
  const scored = REPORT_CHUNKS.map(chunk => {
    let score = 0;
    for (const w of qWords) {
      for (const k of chunk.keywords) {
        if (k === w) score += 3;
        else if (k.length > 3 && w.length > 3 && (k.includes(w) || w.includes(k))) score += 1;
      }
    }
    score += (sectionBonus.get(chunk.section) ?? 0);
    return { chunk, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length === 0) return CHAT_FALLBACK;

  // Allow up to 2 chunks per section, 6 total
  const seenSections = new Map<number, number>();
  const top: ReportChunk[] = [];
  for (const { chunk } of scored) {
    const cnt = seenSections.get(chunk.section) ?? 0;
    if (cnt < 2) {
      seenSections.set(chunk.section, cnt + 1);
      top.push(chunk);
    }
    if (top.length === 6) break;
  }

  // Group by section and build structured response
  const bySec = new Map<number, ReportChunk[]>();
  for (const c of top) {
    if (!bySec.has(c.section)) bySec.set(c.section, []);
    bySec.get(c.section)!.push(c);
  }

  const parts: string[] = [];
  for (const [sec, chunks] of bySec) {
    parts.push(`**${SECTION_TITLES[sec]}**\n\n${chunks.map(c => c.text).join("\n\n")}`);
  }

  // Append strategic note for the dominant section
  const dominantSec = [...bySec.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0];
  if (dominantSec && SECTION_STRATEGIC_NOTES[dominantSec]) {
    parts.push(SECTION_STRATEGIC_NOTES[dominantSec]);
  }

  return `**Report Agent:**\n\n${parts.join("\n\n---\n\n")}`;
}

const INITIAL_MESSAGE: Message = {
  role: "agent",
  text: "Hi — I'm your Report Agent. I have full context of the CC Maple Zero swarm simulation: 1,247 agents across 6 demographic segments, 1,847 interaction events, and 5 report sections covering sentiment, channel strategy, and recommendations.\n\nAsk me anything about the findings, or pick a suggested question below.",
};

// Generate canned agent chat responses from their data
function getAgentResponses(agent: SimAgent): Record<string, string> {
  const responses: Record<string, string> = {
    [`What do you think of CC Maple Zero?`]: agent.maple_stance,
    [`What would make you buy it?`]: agent.key_insight
      ? `${agent.key_insight} ${agent.key_implication ? `That means: ${agent.key_implication}` : ""}`
      : `As a ${agent.archetype.toLowerCase()}, I need to see it in the right context first — whether that's a bar menu, a friend recommending it, or finding it in a store I already trust.`,
    [`Tell me about yourself`]: `I'm ${agent.name}, ${agent.age}, based in ${agent.location}. I'd describe my style as: ${agent.archetype}. When it comes to beverages, I'm pretty particular about what I reach for.`,
    [`Would you recommend it to others?`]: agent.awareness_level === "loyal"
      ? `Absolutely — I'm already a CC fan. If Maple Zero delivers on the promise, I'd be telling everyone.`
      : agent.awareness_level === "never_heard"
      ? `Honestly I didn't know CC was still around. I'd need to try it first before telling friends — I don't recommend things I haven't experienced.`
      : `Maybe. I'd want to try it first. If it's as good as it sounds, sure — but I'd need that first experience to happen.`,
  };
  return responses;
}

function getAgentOpeningMessage(agent: SimAgent): string {
  return `Hey, I'm ${agent.name} — ${agent.age}, from ${agent.location}. I'm what you'd call a ${agent.archetype.toLowerCase()}.\n\nMy take on CC Maple Zero: "${agent.maple_stance}"\n\nAsk me anything.`;
}

function getPersonaResponse(agent: SimAgent, question: string): string {
  const responses = getAgentResponses(agent);
  // Exact match first
  if (responses[question]) return responses[question];
  // Fuzzy match: question contains a key word from one of the canned Q keys
  const qLower = question.toLowerCase();
  for (const [key, val] of Object.entries(responses)) {
    const keyWords = key.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    if (keyWords.some(w => qLower.includes(w))) return val;
  }
  // Fallback: use the agent's core data
  return `${agent.maple_stance} ${agent.key_insight ?? ""}`.trim();
}

function buildPersonaProfile(agent: SimAgent): string {
  const p = (personasData as Record<string, unknown>[]).find((x) => x.id === agent.persona_id);
  if (!p) {
    return [
      `Name: ${agent.name}, Age: ${agent.age}, Location: ${agent.location}`,
      `Archetype: ${agent.archetype}`,
      `Maple Zero stance: ${agent.maple_stance}`,
    ].join("\n");
  }
  return [
    `Name: ${p.name}, Age: ${p.age}, Location: ${p.location}`,
    `Occupation: ${p.occupation}`,
    `Description: ${p.description}`,
    `Beverage psychology: ${p.beverage_psychology}`,
    `Language style: ${p.language_style}`,
    `CC perception: ${p.cc_perception}`,
    `Response to Maple Zero: ${p.response_to_maple_product}`,
    `Behavior rules: ${((p.behavior_rules as string[]) ?? []).join("; ")}`,
    `Never say: ${((p.never_say as string[]) ?? []).join(", ")}`,
  ].join("\n");
}

function ReportSection({ content }: { content: string }) {
  return (
    <div className="mb-8">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-slate-800 font-bold text-xl mt-6 mb-3 pb-2 border-b border-slate-100 first:mt-0">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3 key={i} className="text-slate-700 font-bold text-base mt-5 mb-2">
              {line.slice(2, -2)}
            </h3>
          );
        }
        const numMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-3 mb-3 ml-1">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {numMatch[1]}
              </span>
              <p className="text-slate-600 text-base leading-relaxed">
                <strong className="text-slate-800 font-semibold">{numMatch[2]}</strong>
                {numMatch[3]}
              </p>
            </div>
          );
        }
        if (line.startsWith("- ")) {
          const boldMatch = line.slice(2).match(/^\*\*(.+?)\*\*(.*)$/);
          return (
            <div key={i} className="flex gap-2.5 mb-2 ml-1">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5" />
              <p className="text-slate-600 text-base leading-relaxed">
                {boldMatch ? (
                  <><strong className="text-slate-800 font-semibold">{boldMatch[1]}</strong>{boldMatch[2]}</>
                ) : line.slice(2)}
              </p>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-3" />;
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="text-slate-600 text-base leading-relaxed mb-2.5">
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="text-slate-800 font-semibold">{part}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

function ChatBubble({ msg }: { msg: Message }) {
  const isAgent = msg.role === "agent";
  const lines = msg.text.split("\n");

  if (!isAgent) {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed">
          {msg.text}
        </div>
      </div>
    );
  }

  const avatar = msg.agentAvatarUrl ? (
    <img src={msg.agentAvatarUrl} alt={msg.agentName ?? "Agent"} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
  ) : msg.agentColor ? (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
      style={{ backgroundColor: msg.agentColor }}
    >
      {msg.agentName?.[0] ?? "A"}
    </div>
  ) : (
    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    </div>
  );

  return (
    <div className="flex items-end gap-2 justify-start">
      {avatar}
      <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-[80%] flex flex-col gap-1 border border-slate-100">
        {msg.agentName && (
          <div className="text-xs text-gray-400 font-semibold">{msg.agentName}</div>
        )}
        <div className="text-slate-700 text-sm leading-relaxed">
          {lines.map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <strong key={i} className="block mb-1 font-semibold text-slate-800">{line.slice(2, -2)}</strong>;
            }
            if (line.trim() === "") return <div key={i} className="h-1.5" />;
            const parts = line.split(/\*\*(.+?)\*\*/g);
            return (
              <p key={i} className="mb-1 last:mb-0">
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className="font-semibold text-slate-800">{part}</strong> : part
                )}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AgentChatPanel({ agent, avatarUrl, onBack }: { agent: SimAgent; avatarUrl?: string; onBack: () => void }) {
  const suggestedQs = Object.keys(getAgentResponses(agent));
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: getAgentOpeningMessage(agent),
      agentColor: agent.avatar_color,
      agentName: agent.name,
      agentAvatarUrl: avatarUrl,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(q?: string) {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: agent.persona_id, message: question, sessionId }),
      });
      const data = await res.json();
      if (data.data) {
        setSessionId(data.data.session_id);
        setMessages(prev => [
          ...prev,
          { role: "agent", text: data.data.persona_response, agentColor: agent.avatar_color, agentName: agent.name, agentAvatarUrl: avatarUrl },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "agent", text: agent.maple_stance, agentColor: agent.avatar_color, agentName: agent.name, agentAvatarUrl: avatarUrl },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {avatarUrl ? (
          <img src={avatarUrl} alt={agent.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: agent.avatar_color }}
          >
            {agent.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-slate-800 font-bold text-sm leading-tight">{agent.name}</div>
          <div className="text-slate-400 text-xs">{agent.age} · {agent.location} · {agent.archetype}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto light-scroll px-4 py-4 flex flex-col gap-4">
        {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                       style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested */}
      <div className="px-4 pt-2 flex-shrink-0">
        <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Ask {agent.name.split(" ")[0]}</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestedQs.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 disabled:opacity-50 transition-colors duration-150"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={`Message ${agent.name.split(" ")[0]}…`}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-900 disabled:bg-slate-200 flex items-center justify-center transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Stage6DeepInteraction({ onPersonaChat: _ }: Props) {
  const [mode, setMode] = useState<Mode>("report");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSuggestedQuestion(key: string) {
    const response = followUpResponses[key] ?? answerQuestion(key);
    setMessages(prev => [...prev, { role: "user", text: key }, { role: "agent", text: response }]);
  }

  function handleSend() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    const response = answerQuestion(q);
    setMessages(prev => [...prev, { role: "user", text: q }, { role: "agent", text: response }]);
  }

  return (
    <>
    <div className="grid grid-cols-[55fr_45fr] gap-4 h-[calc(100vh-130px)]">
      {/* Left: Full Report */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-slate-600 text-sm font-semibold">CC Maple Zero Sugar — Swarm Intelligence Report</span>
        </div>
        <div className="flex-1 overflow-y-auto light-scroll px-5 py-4">
          {[1, 2, 3, 4, 5].map(n => (
            <ReportSection key={n} content={reportSections[n] ?? ""} />
          ))}
        </div>
      </div>

      {/* Right: Interactive Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Header + tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <span className="text-slate-600 text-sm font-semibold mr-3">Interactive Tools</span>
          <button
            onClick={() => setMode("report")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              mode === "report" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Chat with Report
          </button>
          <button
            onClick={() => setMode("agents")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              mode === "agents" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Agent 1:1
          </button>
        </div>

        {/* Report chat */}
        {mode === "report" && (
          <>
            <div className="flex-1 overflow-y-auto light-scroll px-4 py-4 flex flex-col gap-4">
              {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
              <div ref={chatEndRef} />
            </div>
            <div className="px-4 pt-2 flex-shrink-0">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Suggested</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 transition-colors duration-150"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Ask the report anything…"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-900 disabled:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Agent list */}
        {mode === "agents" && (
          <div className="flex-1 overflow-y-auto light-scroll px-4 py-4">
            <p className="text-slate-400 text-sm mb-4">Select an agent to open a 1-on-1 conversation.</p>
            <div className="grid grid-cols-1 gap-3">
              {simulationAgents.map(agent => (
                <SimulationAgentCard
                  key={agent.id}
                  agent={agent}
                  persona={PERSONA_AVATARS[agent.persona_id] ? { avatar_url: PERSONA_AVATARS[agent.persona_id] } as never : undefined}
                  onClick={() => setChatPersonaId(agent.persona_id)}
                  showChatButton
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {chatPersonaId && (
      <PersonaChatModal personaId={chatPersonaId} onClose={() => setChatPersonaId(null)} />
    )}
    </>
  );
}
