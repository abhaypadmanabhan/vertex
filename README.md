# Vertex

Type any company name — even one that launched three days ago — and Vertex enriches it live,
writes it into a shared knowledge graph, and traverses that graph to surface competitors and
investor signals that flat retrieval would miss.

## Why it's different

A flat LLM can summarize a company it already knows about. Vertex does two things that
structurally can't be faked:

1. **Enrichment beat** — builds a real, structured profile of an obscure/days-old company
   instead of saying "not enough data."
2. **Graph beat** — from that company's neighborhood in a shared Neo4j graph, computes
   competitors and investor-cluster signals by structure (shared investors, shared tech, shared
   market), ranked by edge overlap — not guessed by an LLM.

## Stack

| Layer | Tech | Role |
|---|---|---|
| App spine | **ButterBase** | Postgres (search history, saved reports), JWT auth, model gateway, frontend hosting |
| Graph | **Neo4j (Aura, shared)** | Company/Fund/Person/Tech/Market nodes; Cypher traversal for competitor ranking + investor-cluster signal |
| Enrichment | **RocketRide** (via npm SDK + API key) with **ButterBase model gateway** as the primary/fallback path | company name in → web-search + LLM-extract → structured JSON out |
| Frontend | **Next.js + shadcn/ui**, PADZY OS design system | search box → results view → competitor list + graph viz |

Every entity write goes through `shared/normalizer.ts` (seed and live enrichment must produce
identical node keys) and every enrichment payload matches `shared/enrichment-schema.ts` — see
`AGENTS.md` for the full contract.

## Architecture (data flow)

1. User signs in (ButterBase auth).
2. User searches a company name.
3. `lib/api/searchCompany` calls `enrichCompany` → structured company JSON (what they do,
   founders, funding, investors, tech stack, traction, market).
4. Result is upserted into Neo4j (`upsertCompany`) as Company/Fund/Person/Tech/Market
   nodes and edges, and persisted to ButterBase (`saveSearch`) for per-user history.
5. `getCompetitors` + `getInvestorSignal` traverse the graph for companies sharing
   investors/tech/market, ranked by shared-edge count, plus the investor-cluster signal.
6. UI renders the structured report + ranked competitor list (with a "why" per match) + a
   simple graph viz.

## Local setup

```bash
npm install
cp .env.example .env       # fill NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD / BUTTERBASE_API_KEY
npm run typecheck
npm run seed                # populate Neo4j with the demo seed set
```

## Deploy (Phase 5, #20 — runs after Lane 4 merges, not yet executed)

ButterBase frontend hosting, via the `manage_frontend` / `create_frontend_deployment` MCP tools
against `app_ukesbu2ssy8a`. Two supported paths — pick based on how Lane 4's Next.js app builds:

- **Static export** (`next build && next export`, output in `out/`): use the zip-upload path —
  `create_frontend_deployment({ app_id, framework: "nextjs-static" })` → upload the zipped
  `out/` to the returned URL → `manage_frontend({ action: "start_deployment", deployment_id })`.
- **Source-based build** (server does the build, needed if the app uses SSR/edge features):
  `manage_frontend({ action: "create_from_source" })` → upload a source zip → `manage_frontend({
  action: "start_from_source", deployment_id, lockfile_hash, build_command, output_dir })`.

Either way, set any frontend env vars first with `manage_frontend({ action: "set_env" })`
(`NEXT_PUBLIC_BUTTERBASE_API_URL` at minimum). Live URL after deploy: `https://vertex.butterbase.dev`.

## E2E test plan (Phase 5, #21 — COSTS TOKENS, needs explicit go-ahead before running)

1. Sign in through the deployed frontend.
2. Search **"Tsenta"** — an obscure company chosen so the demo proves live enrichment, not a
   cached/known answer.
3. Confirm: structured profile renders, the company lands in Neo4j (spot-check via
   `read_neo4j_cypher`), competitor list shows shared-edge reasons, investor-cluster signal
   renders (or empty-state if no shared fund yet), and the search appears in per-user history.
4. Note pass/fail per step; do not re-run beyond what's needed to confirm behavior once.

## Roadmap (explicitly deferred for this build)

- **Cognee** — would replace the hand-written Neo4j upsert with managed graph ingestion.
- **Daytona** (#23, bonus) — move competitor-ranking compute into a sandboxed agent run.
- **Payment** (ButterBase Stripe Connect) — free-tier-then-paid model, talking point only.
- **Identity resolution** beyond simple name + domain normalization.
