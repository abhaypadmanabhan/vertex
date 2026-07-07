# Lane 2 — Graph (Neo4j) — THE MOAT

Owns: `graph/` + `lib/graph.ts`. Neo4j via `mcp__neo4j__write_neo4j_cypher` / `read_neo4j_cypher`.
Graph model (PRD): Company, Fund, Person, Tech, Market + edges FUNDED_BY, FOUNDED_BY, USES, IN_MARKET.
**Every write goes through `shared/normalizer.ts`.** This is what makes shared edges line up.

## Issues
- **#8** Seed ~5 well-known companies + their funds/tech/markets. Hand-pick OVERLAPPING investors/
  tech/markets so an obscure target will actually connect (e.g. multiple companies share
  "y combinator", "postgresql", "developer tools"). Write `graph/seed.ts` (idempotent MERGE, keys
  from the normalizer). Also keep the seed data as typed `Enrichment[]` so it flows through the
  SAME `upsertCompany` path as live enrichment.
- **#13** `graph/upsert.ts` + `lib/graph.ts:upsertCompany(e)` — MERGE Company by normalized name(+domain),
  MERGE each Fund/Person/Tech/Market by normalized key, MERGE edges. Idempotent.
- **#14** `graph/queries.ts` + `lib/graph.ts:getCompetitors(name, limit)` — Cypher: companies sharing
  Fund/Tech/Market neighbours with the target, ranked by shared-neighbour count, top N, EXCLUDING the
  target. Return `Competitor[]` with `sharedFunds/sharedTech/sharedMarkets` + a `reason` string.
- **#15** `lib/graph.ts:getInvestorSignal(name)` — other companies funded by the target's lead fund
  (funds[0]). Return `InvestorSignal | null`.

## Prove it (acceptance)
- Run `graph/seed.ts` twice → node counts identical (idempotent). Show counts by label.
- Upsert a 6th test company that shares ≥2 investors/tech with the seed; `getCompetitors` returns it
  ranked #1 with correct shared-edge reasons. Show the actual Cypher result.
- `getInvestorSignal` returns co-funded companies for a shared lead fund.
- `npm run typecheck` clean.

Do not touch `shared/*`, `lib/db.ts`, `lib/enrichment.ts`, `app/`, `components/`.
Superpowers skill on. Then STOP and report.
