import type { QueryResult } from "@/lib/types";

interface Props {
  result: QueryResult;
}

export default function ResponseCard({ result }: Props) {
  const scorePercent = Math.round(result.score * 100);
  const scoreColor =
    scorePercent >= 70 ? "bg-green-100 text-green-800" :
    scorePercent >= 40 ? "bg-yellow-100 text-yellow-800" :
    "bg-red-100 text-red-800";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          Intent: {result.parsedIntent}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${scoreColor}`}>
          Score: {scorePercent}%
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
      <p className="text-xs text-gray-400 mt-3">{result.evidence.length} evidence item(s) consulted</p>
    </div>
  );
}
