// scripts/debugRetrieval.ts
import { retrieveForPersona } from "../lib/retrieval";

const CASES = [
  { personaId: "persona-us-genz",           scenarioId: "scenario-zero-sugar-reaction", label: "US Gen Z + Zero Sugar" },
  { personaId: "persona-existing-nostalgia", scenarioId: "scenario-nostalgia-ad",        label: "Nostalgia Loyalist + Nostalgia Ad" },
  { personaId: "persona-health-conscious",   scenarioId: "scenario-price-reaction",       label: "Health-Conscious + Price Reaction" },
];

for (const c of CASES) {
  const r = retrieveForPersona(c.personaId, c.scenarioId);
  console.log(`\n=== ${c.label} ===`);
  console.log(`Persona: ${r.persona.name}`);
  console.log(`Scenario: ${r.scenario?.name ?? "(none)"}`);
  console.log(`Behavior facts (${r.relevant_behavior_facts.length}):`);
  for (const f of r.relevant_behavior_facts) {
    console.log(`  [${f.category}] conf=${f.confidence}  ${f.id}`);
    console.log(`    "${f.statement.slice(0, 80)}..."`);
  }
  console.log(`Brand facts (${r.relevant_brand_facts.length}):`);
  for (const f of r.relevant_brand_facts) {
    console.log(`  [${f.category}] conf=${f.confidence}  ${f.id}`);
  }
}
