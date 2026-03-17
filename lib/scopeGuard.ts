import type { ParsedQuery } from "./types";

/**
 * Returns true when the query has zero domain signal — no market, no
 * generation/customerType, and no topic. parseQuery() sets confidence = 1/3
 * per detected dimension, so confidence === 0 means all three are absent.
 *
 * Out-of-scope: "astronauts", "cats", unrelated questions.
 * Borderline (confidence = 1/3, topic-only): still in scope — simulation runs.
 */
export function isOutOfScope(parsed: ParsedQuery): boolean {
  return parsed.confidence === 0;
}
