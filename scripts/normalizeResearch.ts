/**
 * normalizeResearch.ts
 * Reads raw research files from data/raw/ and normalizes them into
 * the Evidence[] format, writing to data/processed/evidence.json.
 *
 * Run with: npm run normalize
 *
 * Currently a stub — extend with real parsing logic as raw data is added.
 */
import fs from "fs";
import path from "path";
import type { Evidence } from "../lib/types";

const RAW_DIR = path.join(__dirname, "..", "data", "raw");
const OUT_FILE = path.join(__dirname, "..", "data", "processed", "evidence.json");

function processRawFiles(): Evidence[] {
  const files = fs.readdirSync(RAW_DIR).filter((f) => f !== ".gitkeep");

  if (files.length === 0) {
    console.warn("[normalizeResearch] No raw files found in data/raw/. Nothing to process.");
    return [];
  }

  const results: Evidence[] = [];

  for (const file of files) {
    const filepath = path.join(RAW_DIR, file);
    console.log(`[normalizeResearch] Processing: ${file}`);

    // TODO: implement real parsing logic based on file format
    // For now, just log that the file was found
    console.log(`  -> ${filepath} (stub: not yet parsed)`);
  }

  return results;
}

const evidence = processRawFiles();

if (evidence.length > 0) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(evidence, null, 2), "utf-8");
  console.log(`[normalizeResearch] Wrote ${evidence.length} items to ${OUT_FILE}`);
} else {
  console.log("[normalizeResearch] No new evidence written.");
}
