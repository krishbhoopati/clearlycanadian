"use client";

import { useState } from "react";
import type { SimulationResponse, AskLabResponse } from "@/lib/types";
import PersonaSelector from "./PersonaSelector";
import ScenarioSelector from "./ScenarioSelector";
import ResponseCard from "./ResponseCard";
import EvidencePanel from "./EvidencePanel";

export default function AskLabPanel() {
  const [query, setQuery] = useState("");
  const [personaId, setPersonaId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskLabResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ask-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_question: query, personaId: personaId || undefined, scenarioId: scenarioId || undefined }),
      });
      const data = await res.json() as SimulationResponse<AskLabResponse>;
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">
        Ask a research question about Canadian consumers. Results are generated from structured evidence using local logic — no AI API required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Query</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="e.g. How are Canadian grocery shoppers responding to inflation?"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PersonaSelector value={personaId} onChange={setPersonaId} />
          <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching…" : "Ask the Lab"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <ResponseCard result={result} />
          <EvidencePanel items={result.evidence_items} />
        </div>
      )}
    </div>
  );
}
