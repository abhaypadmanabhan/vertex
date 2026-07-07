# Lane 5 — Integration, data layer, deploy, docs

Owns: `lib/client.ts`, `lib/api/`, deploy config, `README.md`. You build the SEAMS that connect the
other four lanes, so the frontend (Lane 4) can swap mock → real data at merge time.

## Work (can start immediately — depends on running services, not other lanes' code)
- **`lib/client.ts`** — a typed ButterBase REST wrapper (base URL from `lib/config.ts`, JWT header,
  error handling) + a Neo4j driver singleton (server-side, env creds). Everyone's real impls will use it.
- **`lib/api/`** — the orchestration layer the UI calls, e.g. a `searchCompany(name, jwt)` that:
  1) `enrichCompany` (Lane 3) → 2) `upsertCompany` (Lane 2) → 3) `getCompetitors` + `getInvestorSignal`
  (Lane 2) → 4) `saveSearch` (Lane 1) → returns a `CompanyReport`. Code against the stub signatures;
  they light up as lanes merge. Add graceful fallbacks so the demo degrades, never crashes.
- Keep it typechecking against the current stubs (they throw at runtime — that's expected pre-merge).

## Deferred until other lanes merge (do the prep now, execute at integration)
- **#20** Deploy frontend via ButterBase (`create_frontend_deployment` / `manage_frontend`) → live URL
  `https://vertex.butterbase.dev`. Prep the build/deploy steps; run after Lane 4 merges.
- **#21** E2E on an obscure company (Tsenta). **COSTS TOKENS — explicit user go-ahead first.**
- **#22** `README.md`: what it is, stack, the graph beat, deferred roadmap (Cognee/Daytona/payment).
- **#23 (bonus)** Daytona: move competitor-rank compute into a sandbox — only if core is demo-able.

## Prove it (acceptance)
- `lib/client.ts` + `lib/api/searchCompany` typecheck clean and compose the four lanes correctly.
- Deploy + E2E + README done at integration phase (with go-ahead for the token-spend steps).

Do not touch `shared/*`, `lib/db.ts`, `lib/graph.ts`, `lib/enrichment.ts`, `app/`, `components/`,
`backend/`, `graph/`, `enrichment/`. Superpowers on. Then STOP and report.
