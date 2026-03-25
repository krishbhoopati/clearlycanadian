"use client";

import { useEffect, useRef, useState } from "react";
import { simulationAgents, followUpResponses, reportSections } from "@/data/simulation/mapleSimulationData";
import SimulationAgentCard from "./SimulationAgentCard";

interface Props {
  onPersonaChat: (personaId: string) => void;
}

type Mode = "report" | "agents";

interface Message {
  role: "user" | "agent";
  text: string;
}

const SUGGESTED_QUESTIONS = Object.keys(followUpResponses);

const INITIAL_MESSAGE: Message = {
  role: "agent",
  text: "Hi — I'm your Report Agent. I have full context of the CC Maple Zero swarm simulation: 1,247 agents across 6 demographic segments, 1,847 interaction events, and 3 report sections covering sentiment, channel strategy, and recommendations.\n\nAsk me anything about the findings, or pick a suggested question below.",
};

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

function ChatMessage({ msg }: { msg: Message }) {
  const isAgent = msg.role === "agent";
  const lines = msg.text.split("\n");

  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isAgent
          ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
          : "bg-slate-800 text-white rounded-tr-sm"
      }`}>
        {lines.map((line, i) => {
          if (line.startsWith("**") && line.endsWith("**")) {
            return <strong key={i} className={`block mb-1 font-semibold ${isAgent ? "text-slate-800" : "text-white"}`}>{line.slice(2, -2)}</strong>;
          }
          if (line.trim() === "") return <div key={i} className="h-1.5" />;
          const parts = line.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="mb-1 last:mb-0">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function Stage6DeepInteraction({ onPersonaChat }: Props) {
  const [mode, setMode] = useState<Mode>("report");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSuggestedQuestion(key: string) {
    const response = followUpResponses[key];
    setMessages((prev) => [
      ...prev,
      { role: "user", text: key },
      { role: "agent", text: response },
    ]);
  }

  function handleSend() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    // Check if it matches a known response
    const matchedKey = SUGGESTED_QUESTIONS.find((k) => k.toLowerCase() === q.toLowerCase());
    const response = matchedKey
      ? followUpResponses[matchedKey]
      : "That's a great question. Based on the simulation data, the swarm of 1,247 agents consistently signals strong positive intent for CC Maple Zero — particularly in the bartender, Gen Z, and sober-curious segments. For more specific scenarios, try one of the suggested questions below.";
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "agent", text: response },
    ]);
  }

  return (
    <div className="grid grid-cols-[55fr_45fr] gap-4 h-[calc(100vh-130px)]">
      {/* Left: Full Report */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-slate-600 text-sm font-semibold">CC Maple Zero Sugar — Swarm Intelligence Report</span>
        </div>
        <div className="flex-1 overflow-y-auto light-scroll px-5 py-4">
          {[1, 2, 3, 4, 5].map((n) => (
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
              mode === "report"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Chat with Report
          </button>
          <button
            onClick={() => setMode("agents")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              mode === "agents"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Agent 1:1
          </button>
        </div>

        {mode === "report" && (
          <>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto light-scroll px-4 py-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested questions */}
            <div className="px-4 pt-2 flex-shrink-0">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Suggested</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SUGGESTED_QUESTIONS.map((q) => (
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

            {/* Input */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
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

        {mode === "agents" && (
          <div className="flex-1 overflow-y-auto light-scroll px-4 py-4">
            <p className="text-slate-400 text-sm mb-4">Select an agent to open a 1-on-1 conversation.</p>
            <div className="grid grid-cols-1 gap-3">
              {simulationAgents.map((agent) => (
                <SimulationAgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => onPersonaChat(agent.persona_id)}
                  showChatButton
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
