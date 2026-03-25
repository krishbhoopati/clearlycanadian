"use client";

import type { SimStage } from "@/lib/types";

const STAGES: { n: SimStage; label: string }[] = [
  { n: 1, label: "Knowledge Graph" },
  { n: 2, label: "Environment" },
  { n: 3, label: "Social Simulation" },
  { n: 4, label: "Report" },
  { n: 5, label: "Deep Interaction" },
];

interface Props {
  currentStage: SimStage;
  onStageClick?: (s: SimStage) => void;
}

export default function SimulationStepper({ currentStage, onStageClick }: Props) {
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto">
      {STAGES.map((s, i) => {
        const done = s.n < currentStage;
        const active = s.n === currentStage;
        return (
          <div key={s.n} className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => onStageClick?.(s.n)}
              disabled={s.n > currentStage}
              className="flex flex-col items-center gap-1 group flex-shrink-0 disabled:cursor-default"
            >
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-1 ring-offset-transparent"
                    : "border border-white/20 text-white/30 bg-white/5",
                ].join(" ")}
              >
                {done ? "✓" : s.n}
              </div>
              <span
                className={[
                  "text-xs font-medium whitespace-nowrap hidden sm:block transition-colors duration-300",
                  done ? "text-white/60" : active ? "text-white" : "text-white/25",
                ].join(" ")}
              >
                {s.label}
              </span>
            </button>
            {i < STAGES.length - 1 && (
              <div
                className={[
                  "flex-1 h-px mx-2 transition-colors duration-500",
                  done ? "bg-emerald-400" : "bg-white/10",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
