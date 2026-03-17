// scripts/debug-query.ts
// Usage: npx ts-node --project tsconfig.scripts.json scripts/debug-query.ts "your query here"
import { parseQuery } from "../lib/queryParser";
import { retrieveEvidence } from "../lib/retrieval";
import { aggregate } from "../lib/aggregator";
import { score } from "../lib/scorer";

const queries = process.argv.slice(2);

if (queries.length === 0) {
  console.error("Usage: npx ts-node --project tsconfig.scripts.json scripts/debug-query.ts <query> [query2] ...");
  process.exit(1);
}

for (const rawQuery of queries) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`QUERY: "${rawQuery}"`);
  console.log("=".repeat(60));

  const parsed = parseQuery(rawQuery);
  console.log("\n=== PARSED QUERY ===");
  console.log(JSON.stringify(parsed, null, 2));

  const evidence = retrieveEvidence(parsed, { topN: 5 });
  console.log(`\n=== EVIDENCE (${evidence.length}) ===`);
  for (const e of evidence) {
    console.log(`  [${e.category}] relevance=${e.relevanceScore}  ${e.id}`);
    console.log(`    "${e.text.slice(0, 100)}..."`);
  }

  const aggregated = aggregate(evidence, parsed);
  const categoryCount = Object.keys(aggregated.byCategory).length;
  console.log(`\n=== AGGREGATED === ${aggregated.totalCount} items across ${categoryCount} categories`);

  const scoreResult = score(evidence, parsed);
  console.log("\n=== SCORE ===");
  console.log(JSON.stringify(scoreResult, null, 2));
}
