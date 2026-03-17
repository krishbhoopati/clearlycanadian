/**
 * buildSeedData.ts
 * Writes sample seed data to data/processed/.
 * Run with: npm run seed
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(__dirname, "..", "data", "processed");

function write(filename: string, data: unknown): void {
  const filepath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[buildSeedData] Wrote ${filepath}`);
}

// Re-export the same seed data that ships with the repo
// Extend this script to pull from a real data source
write("personas.json", require("../data/processed/personas.json"));
write("scenarios.json", require("../data/processed/scenarios.json"));
write("evidence.json", require("../data/processed/evidence.json"));

console.log("[buildSeedData] Done.");
