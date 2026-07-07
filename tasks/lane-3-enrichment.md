# Lane 3 — Enrichment service

Owns: `enrichment/` + `lib/enrichment.ts`. Contract out = `shared/enrichment-schema.ts` (Enrichment).

## Reality check (verified against docs.butterbase.ai + docs.rocketride.org)
Two viable enrichment paths. Build the ButterBase one FIRST (unblocked, in-session), then add the
RocketRide pipe if the user provides an API key.

- **Primary = ButterBase model gateway** (docs confirm: OpenAI-compatible gateway to Claude/GPT).
  `mcp__butterbase__manage_ai` to configure the model, then `deploy_function` a serverless `enrich`.
  No external key needed — uses the vertex app. Unblocked now.
- **RocketRide pipe = REAL but needs your API key + the npm SDK (NOT the connected MCP).** The
  connected `RocketRide_Document_Processor` MCP tool is only a thin `upload` wrapper. The real path:
  `npm install rocketride`; env `ROCKETRIDE_APIKEY=<user key>` + `ROCKETRIDE_URI=wss://api.rocketride.ai`;
  build `enrichment/pipeline.pipe` (JSON: `components` array — a web-search node → an LLM-extract node;
  get exact provider node names from https://docs.rocketride.org/nodes); invoke via TS SDK:
  `const c = new RocketRideClient({auth: process.env.ROCKETRIDE_APIKEY!, uri:'https://cloud.rocketride.ai'});
  await c.connect(); const {token} = await c.use({filepath:'./enrichment/pipeline.pipe'});
  const r = await c.send(token, name);` (or CLI `rocketride start --pipeline ./enrichment/pipeline.pipe`).

## Issues
- **#12 (primary)** ButterBase model-gateway enrichment:
  - Configure model (`manage_ai`), deploy a ButterBase function `enrich` (`deploy_function`) taking
    `{ name }`, prompting the model to web-search + extract, returning JSON matching `ENRICHMENT_FIELD_HINT`
    verbatim. Validate with `parseEnrichment()` before returning. Public sources only.
- Fill **`lib/enrichment.ts:enrichCompany(name)`** — call the deployed function (or the RocketRide pipe
  if wired), `parseEnrichment` the result, return `Enrichment`. Keep the signature exact.
- **#9/#10 (RocketRide pipe)** Author `enrichment/pipeline.pipe` (web-search → llm-extract, provider
  names from /nodes) so output matches the schema. **Requires the user's RocketRide API key — ASK for
  it; if not provided, build the .pipe file + wiring but leave the live run for later.** Document in
  `enrichment/README.md`. Do not rabbit-hole past ~30 min.

## Prove it (acceptance)
- The `enrich` function is deployed and callable. Show the deploy result.
- **Before any live LLM call, flag the token cost and WAIT for explicit user go-ahead.** Then one
  call with a KNOWN company (e.g. "Stripe") → output parses cleanly against the schema. Show it.
- `npm run typecheck` clean for `lib/enrichment.ts`.

Do not touch `shared/*`, `lib/db.ts`, `lib/graph.ts`, `app/`, `components/`.
Superpowers skill on. Then STOP and report.
