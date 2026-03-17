"use client";

import { useEffect, useState } from "react";
import type { Persona } from "@/lib/types";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function PersonaSelector({ value, onChange }: Props) {
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data: { personas: Persona[] }) => setPersonas(data.personas))
      .catch(console.error);
  }, []);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Persona</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">— Select a persona —</option>
        {personas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.region}
          </option>
        ))}
      </select>
    </div>
  );
}
