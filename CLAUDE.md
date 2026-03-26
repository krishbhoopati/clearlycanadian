# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run ts:check     # TypeScript type-check without emitting
npm run seed         # Write seed data to data/processed/ via ts-node
npm run normalize    # Process raw research files from data/raw/ into evidence.json
```

## Architecture

This is a **zero-API-cost consumer simulation app** for Canadian retail research. All responses are generated from local JSON data using deterministic logic — no Anthropic/OpenAI calls anywhere.

### Two modes

- **Ask the Lab** (`POST /api/ask-lab`): query-style interface — user asks a research question, gets a scored summary + evidence list
- **Persona Chat** (`POST /api/persona-chat`): conversational interface with a simulated Canadian consumer persona

### Data pipeline (server-side only)

```
queryParser → retrieval → aggregator → scorer → responseComposer
                  ↓
         personaResolver + scenarioResolver → simulationEngine → chatMemory
```

All pipeline modules live in `lib/`. `lib/types.ts` is the single source of truth for all TypeScript interfaces — import from there, never redefine types locally.

`lib/dataLoader.ts` reads `data/processed/*.json` at runtime with an in-process cache. It returns empty arrays gracefully if files are missing, so the app runs even before seed data exists.

### Data files

- `data/processed/personas.json` — 3 seeded Canadian consumer archetypes
- `data/processed/scenarios.json` — 2 seeded research scenarios
- `data/processed/evidence.json` — 5 seeded evidence items
- `data/raw/` — gitignored; drop source research files here before running `npm run normalize`

### Chat sessions

`lib/chatMemory.ts` uses an in-memory `Map` — sessions reset on server restart. This is intentional for local dev; no database is needed.

### Next.js config

Uses `next.config.mjs` (not `.ts`) — Next.js 14 does not support TypeScript config files.

### Scripts

`scripts/` uses `tsconfig.scripts.json` (CommonJS/node moduleResolution) so ts-node can run them independently of Next.js's bundler config. The main `tsconfig.json` explicitly excludes `scripts/`.

### Path alias

`@/*` maps to the project root. Use `@/lib/types`, `@/components/...`, etc. in all imports.

### Knowledge graph — dynamic node injection

**CRITICAL**: `graphLinks` in `data/simulation/mapleSimulationData.ts` is loaded at D3 init time. Any link whose `source` or `target` ID does not exist in `graphNodes` will cause a runtime crash: `Error: node not found: <id>`.

- Never add links to `graphLinks` for nodes that don't exist in `graphNodes`.
- Nodes injected dynamically at runtime (via `pendingNodes` prop on `PersistentGraphPanel`) must also have their links passed via `pendingLinks` — **not** pre-loaded in the static `graphLinks` array.
- The `pendingNodes`/`pendingLinks` pipeline: component calls `onGraphEvent(nodes, links)` → `handleGraphEvent` in `app/simulation/page.tsx` accumulates into `discoveredNodes`/`discoveredLinks` state → passed to `PersistentGraphPanel` which injects them into D3 at runtime.
