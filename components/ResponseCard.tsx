import type { AskLabResponse } from "@/lib/types";

interface Props {
  result: AskLabResponse;
}

export default function ResponseCard({ result }: Props) {
  if (result.consulted_personas.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-600 uppercase tracking-wide font-semibold">Out of scope</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Confidence: 0%
          </span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{result.overall_summary}</p>

        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 leading-relaxed">
          {result.strategic_takeaway}
        </p>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Try instead</p>
          <ul className="space-y-1">
            <li className="text-sm text-gray-600">• U.S. Gen Z + Zero Sugar</li>
            <li className="text-sm text-gray-600">• Canada Millennials + sustainability</li>
            <li className="text-sm text-gray-600">• Existing customers + nostalgia campaign</li>
          </ul>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round(result.confidence * 100);
  const scoreColor =
    scorePercent >= 70 ? "bg-green-100 text-green-800" :
    scorePercent >= 40 ? "bg-yellow-100 text-yellow-800" :
    "bg-red-100 text-red-800";

  return (
    <div className="space-y-4">
      {/* Persona pills + confidence — compact header row */}
      <div className="flex items-center flex-wrap gap-2">
        {result.consulted_personas.map((p) => (
          <span
            key={p.persona_id}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
          >
            {p.persona_name}
          </span>
        ))}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor}`}>
          {scorePercent}% confidence
        </span>
      </div>

      {/* Main narrative */}
      <p className="text-sm text-gray-800 leading-relaxed">{result.overall_summary}</p>

      {/* Strategic takeaway */}
      {result.strategic_takeaway && (
        <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2 leading-relaxed">
          {result.strategic_takeaway}
        </p>
      )}

      {/* Drivers + barriers as compact inline lists */}
      {(result.top_drivers.length > 0 || result.top_barriers.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-700">
          {result.top_drivers.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Drivers</p>
              <ul className="space-y-0.5">
                {result.top_drivers.map((d, i) => (
                  <li key={i} className="text-sm text-gray-600">+ {d}</li>
                ))}
              </ul>
            </div>
          )}
          {result.top_barriers.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Barriers</p>
              <ul className="space-y-0.5">
                {result.top_barriers.map((b, i) => (
                  <li key={i} className="text-sm text-gray-600">– {b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
