# Lane 3 — Enrichment service

Owns: `enrichment/` + `lib/enrichment.ts`. Contract out = `shared/enrichment-schema.ts` (Enrichment).

## Reality check (important)
RocketRide MCP only exposes `RocketRide_Document_Processor(filepath)` — a local-file doc processor,
NO pipe build/deploy. So the PRD's ".pipe cloud endpoint" is out. **Primary enrichment = ButterBase
model gateway** (`mcp__butterbase__manage_ai` — configure a model, then invoke it from a ButterBase
function). This is issue #12 promoted to primary; #9/#10 become a short documented probe.

## Issues
- **#12 (primary)** Build enrichment via ButterBase model gateway:
  - Configure model access (`manage_ai`), deploy a ButterBase function `enrich` (`deploy_function`)
    that takes `{ name }`, prompts the model to web-search + extract, and returns JSON matching
    `ENRICHMENT_FIELD_HINT`. Use the field hint verbatim in the prompt.
  - Validate output with `parseEnrichment()` before returning (throw on bad shape). Public sources only.
- Fill **`lib/enrichment.ts:enrichCompany(name)`** — call the deployed function, `parseEnrichment` the
  result, return `Enrichment`. Keep the signature exact.
- **#9/#10 (probe, ~15 min max)** Try `RocketRide_Document_Processor` on a sample company doc; note in
  `enrichment/README.md` whether it can serve as a web-fetch/extract sub-step. If not, document as
  deferred. Do not rabbit-hole.

## Prove it (acceptance)
- The `enrich` function is deployed and callable. Show the deploy result.
- **Before any live LLM call, flag the token cost and WAIT for explicit user go-ahead.** Then one
  call with a KNOWN company (e.g. "Stripe") → output parses cleanly against the schema. Show it.
- `npm run typecheck` clean for `lib/enrichment.ts`.

Do not touch `shared/*`, `lib/db.ts`, `lib/graph.ts`, `app/`, `components/`.
Superpowers skill on. Then STOP and report.
