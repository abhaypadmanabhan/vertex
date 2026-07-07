# Vertex — Build Tracker

Hackathon build. Graph beat = the moat. Two contracts protect the win: **locked enrichment JSON schema** + **shared entity normalizer**.

## Phase 0 — Connectivity (GATE) ✅ DONE
- [x] ButterBase set up (app_id + API base URL noted by user)
- [x] Neo4j MCP connected — Aura `neo4j+s://b11934a6...` (mcp-neo4j-cypher, read-write)
- [x] RocketRide MCP connected — Cloud `https://api.rocketride.ai` (rocketride-mcp v1.3.0)
- [ ] **RESTART session** so all 3 MCP toolsets load in-session
- [ ] Verify live: Neo4j `RETURN 1`, RocketRide `status`, ButterBase `list_apps`

## Phase 0.5 — Contracts (NEW, do before any code)
- [ ] Lock enrichment JSON schema (RocketRide out → ButterBase cache → Neo4j write all bind to it)
- [ ] Build entity normalizer (lowercase/trim/strip suffixes + alias map for funds/tech/markets)
- [ ] Seed + enrichment MUST share the normalizer (else no shared edges = no competitors)

## Phase 1 — Backend spine (ButterBase)
- [ ] Schema: `searches` (user_id, company_name, result_json, created_at), `saved_reports`
- [ ] RLS / user-isolation on both tables
- [ ] Email/password auth
- [ ] Seed Neo4j ~5 known companies + funds/tech/markets (via normalizer). Pick overlapping investors/tech so obscure targets connect.

## Phase 2 — Enrichment pipeline (RocketRide)
- [ ] ONE `.pipe`: name in → web-search → LLM-extract (matches schema) → JSON out
- [ ] Deploy to Cloud, get live endpoint
- [ ] Test-call once (COSTS TOKENS — explicit go-ahead first)
- [ ] FALLBACK ready: ButterBase model gateway enrichment if Cloud fights us

## Phase 3 — Graph write + traverse (Neo4j)
- [ ] Upsert Company + nodes/edges from JSON (via normalizer)
- [ ] Competitor Cypher: shared-edge ranking, top 5 + reasons
- [ ] Investor-cluster Cypher: co-funded by same lead fund

## Phase 4 — Frontend (Next.js + shadcn, PADZY OS theme)
- [ ] Search → loading → results card + ranked competitors (with "why") + simple graph viz
- [ ] Auth screens
- [ ] Per-user search history

## Phase 5 — Deploy + polish
- [ ] Deploy frontend (ButterBase) → live URL
- [ ] E2E on obscure company (Tsenta) (COSTS TOKENS — go-ahead first)
- [ ] README: what/stack/graph beat/deferred roadmap

## Phase 6 — Bonus (only if demo-able)
- [ ] Daytona: competitor-rank compute in sandbox

## Deferred (roadmap only)
- Cognee (auto-ingestion) — kills schema control, worsens naming risk. Wires to same Aura later.
- Daytona, Stripe payment, deep identity resolution.

## Rules
- No token-spend / live paid call without explicit go-ahead.
- Diagnose before fix. One step, verify, proceed.
- Superpowers every task; frontend-design + shadcn on UI.
