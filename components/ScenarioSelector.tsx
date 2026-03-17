"use client";

import { useEffect, useState } from "react";
import type { Scenario } from "@/lib/types";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function ScenarioSelector({ value, onChange }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((data: { scenarios: Scenario[] }) => setScenarios(data.scenarios))
      .catch(console.error);
  }, []);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Scenario (optional)</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">— No scenario —</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
