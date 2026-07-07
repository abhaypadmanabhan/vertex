# Vertex — Agent Bible (Phase 1 parallel build)

You are ONE lane in a 5-agent parallel build. Read this whole file before touching code.
The orchestrator (main session) locked the contracts and stubs on `dev`; you fill your lane.

---

## 1. The mission & the moat

Type any company (even one launched days ago) → enrich it live → write it into a **shared
Neo4j graph** → traverse the graph to surface competitors + investor signals **by structure**,
not by LLM guess. The graph beat is the whole win. Protect it:

- **Every entity write goes through `shared/normalizer.ts`.** Seed and live enrichment MUST
  produce identical node keys, or shared edges vanish and the competitor list is empty.
- **Every enrichment payload matches `shared/enrichment-schema.ts`.** It is the contract from
  model output → cache → graph write → UI. Do not drift field names.

If your work would change either locked file, STOP and ping the orchestrator. Do not edit them.

---

## 2. Live resources (already provisioned)

- **ButterBase app**: `app_ukesbu2ssy8a`
  - API base: `https://api.butterbase.ai/v1/app_ukesbu2ssy8a`
  - Frontend URL (after deploy): `https://vertex.butterbase.dev`
  - MCP tools: `mcp__butterbase__*` (schema, auth, functions, storage, deploy…). Load via ToolSearch.
- **Neo4j Aura**: MCP `mcp__neo4j__read_neo4j_cypher` / `mcp__neo4j__write_neo4j_cypher`.
  Graph is currently EMPTY. `get_neo4j_schema` REQUIRES an explicit `sample_size` arg or it errors.
- **RocketRide**: MCP only exposes `RocketRide_Document_Processor(filepath)` — a local-file doc
  processor. There is NO pipe build/deploy tool. Do not waste time chasing a `.pipe` cloud endpoint.
  Enrichment runs via the **ButterBase model gateway** (see Lane 3).

---

## 3. Repo layout & STRICT lane ownership (prevents merge conflicts)

Edit ONLY files in your lane's directories. Do not touch another lane's dirs or the locked files.

```
shared/                 LOCKED (orchestrator only) — normalizer.ts, enrichment-schema.ts
lib/config.ts           LOCKED-ish (orchestrator) — app ids
lib/types.ts            LOCKED (orchestrator) — cross-lane types (append-only if truly needed)
lib/db.ts               Lane 1 (Backend)     — fill stubs
lib/graph.ts            Lane 2 (Graph)       — fill stubs
lib/enrichment.ts       Lane 3 (Enrichment)  — fill stubs
backend/                Lane 1 — schema-as-code, auth notes, RLS config, migration SQL
graph/                  Lane 2 — seed.ts, upsert.ts, queries.ts (Cypher)
enrichment/             Lane 3 — model-gateway function, prompt, RocketRide probe
app/  components/        Lane 4 — Next.js frontend + design system + brand assets
  app/globals.css, tailwind.config, components/ui/*   Lane 4 owns theme
lib/client.ts           Lane 5 — ButterBase fetch wrapper + Neo4j driver singleton
lib/api/                Lane 5 — route handlers / server actions wiring lanes together
README.md               Lane 5 (final)
package.json            APPEND deps only; never rewrite. If two lanes add deps, merge is trivial.
```

Shared `package.json`: add your dependencies, never delete others'. Lane 4 (padzy-os scaffold)
will add next/react/tailwind — additive.

---

## 4. Branch / merge protocol

- You are in a git worktree on branch `lane/<name>` cut from `dev`.
- `cd` into your worktree path (given in your prompt). Work ONLY there. Never touch the main repo.
- Commit small, message-clear. Reference issue numbers (e.g. `#5`).
- When done: ensure `npm run typecheck` passes for the files you touched, commit, and STOP.
  Tell the user your lane is done. The orchestrator verifies and merges to `dev`. Do NOT merge yourself.
- Do NOT push to `origin/main`. Prod push is the user's final step.

---

## 5. Global rules (non-negotiable)

- **Superpowers skill on every task.** UI tasks also use `frontend-design` + shadcn MCP + `/padzy-os`.
- **No token-spend / live paid API call without explicit user go-ahead.** This includes the first
  live enrichment call and any E2E run. Flag the cost, wait for "go".
- **Diagnose before fixing.** One step, verify, proceed. No two blind attempts in a row.
- **Verify in the real artifact** — a live Cypher result, a real API response, a rendered page.
  Offline/on-paper "should work" is not proof.
- Idempotent scripts (seed/migrations safe to re-run).
- Keep secrets out of git. Use `.env` (already gitignored); template in `.env.example`.

---

## 6. Definition of done (per lane) — see your task file in `tasks/lane-<n>.md`

Each lane has a task file with issue list + acceptance checks. Hit every check, prove it, then stop.
```
