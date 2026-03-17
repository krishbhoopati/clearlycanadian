"use client";

import { useState } from "react";
import AskLabPanel from "@/components/AskLabPanel";
import PersonaChatPanel from "@/components/PersonaChatPanel";

type Tab = "ask-lab" | "persona-chat";

const TABS: { id: Tab; label: string }[] = [
  { id: "ask-lab", label: "Ask the Lab" },
  { id: "persona-chat", label: "Persona Chat" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("ask-lab");

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ask-lab" && <AskLabPanel />}
      {activeTab === "persona-chat" && <PersonaChatPanel />}
    </div>
  );
}
