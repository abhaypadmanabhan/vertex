# Vertex — Tasks

Local checklist view of GitHub issues, grouped by phase.

## Phase 0 — Connectivity
- [ ] #1 Verify ButterBase MCP connected
- [ ] #2 Verify Neo4j MCP connected
- [ ] #3 Verify RocketRide MCP connected
- [ ] #4 Create ButterBase app, note app_id + API base URL (blocked-by #1)

## Phase 1 — Backend spine (ButterBase)
- [ ] #5 Define and apply schema: searches, saved_reports (blocked-by #4)
- [ ] #6 Enable RLS / user-isolation on searches and saved_reports (blocked-by #5)
- [ ] #7 Configure email/password auth (blocked-by #4)
- [ ] #8 Seed Neo4j with ~5 known companies + funds/tech/markets (blocked-by #2)

## Phase 2 — Enrichment pipeline (RocketRide)
- [ ] #9 Build enrichment .pipe: web-search node + LLM-extract node
- [ ] #10 Deploy enrichment pipe to RocketRide Cloud, get live endpoint (blocked-by #9)
- [ ] #11 Test-call enrichment endpoint once with a known company — COSTS TOKENS (blocked-by #10)
- [ ] #12 Fallback: enrichment via ButterBase model gateway (blocked-by #4)

## Phase 3 — Graph write + traverse (Neo4j)
- [ ] #13 Upsert function: enrichment JSON to Neo4j nodes/edges (blocked-by #9, #8)
- [ ] #14 Cypher: competitor query (shared-edge ranking) (blocked-by #13)
- [ ] #15 Cypher: investor-cluster signal query (blocked-by #13)

## Phase 4 — Frontend (Next.js + shadcn, PADZY OS theme)
- [ ] #16 Frontend: search box, loading state, results view scaffold
- [ ] #17 Frontend: report card + ranked competitor list + graph viz (blocked-by #16, #14)
- [ ] #18 Frontend: auth screens (sign in / sign up) (blocked-by #7)
- [ ] #19 Frontend: per-user search history (blocked-by #6, #18)

## Phase 5 — Deploy + polish
- [ ] #20 Deploy frontend via ButterBase to live URL (blocked-by #17, #19)
- [ ] #21 E2E test on obscure company (Tsenta) — COSTS TOKENS (blocked-by #20)
- [ ] #22 README: what it is, stack, graph beat, deferred roadmap

## Phase 6 — Bonus
- [ ] #23 Daytona: run competitor-ranking compute in sandbox (blocked-by #14, #20; only if core is demo-able)

## Design track (parallel, non-blocking)
- [ ] #24 Design: generate logo + design language (PADZY OS)
- [ ] #25 Design: apply design system to frontend (blocked-by #24, #16)
