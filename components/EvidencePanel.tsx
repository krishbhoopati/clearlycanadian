import type { Evidence } from "@/lib/types";

interface Props {
  items: Evidence[];
}

export default function EvidencePanel({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Evidence ({items.length})
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="bg-white border border-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">{item.text}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            {item.relevanceScore !== undefined && (
              <p className="text-xs text-gray-400 mt-1">
                Relevance: {Math.round(item.relevanceScore * 100)}%
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
