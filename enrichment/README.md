# Lane 3 — Enrichment

Two enrichment paths. **Primary (live, deployed) = ButterBase model gateway.** RocketRide is
secondary — built but NOT live-run (see gaps below).

## Primary: ButterBase model gateway — LIVE

- `enrichment/enrich.function.ts` — source of the deployed ButterBase function `enrich`
  (redeploy with `mcp__butterbase__deploy_function` after editing this file — the platform
  stores compiled code, not this file).
- Deployed: `POST https://api.butterbase.ai/v1/app_ukesbu2ssy8a/fn/enrich` (`auth: none`,
  body `{ "name": "<company>" }`).
- Model: `perplexity/sonar` — the only catalog model that does real live web search (plain
  chat models like `anthropic/claude-*` / `openai/gpt-*` on this gateway only have training-data
  knowledge, no browsing tool). ~$1/M input+output tokens.
- `lib/enrichment.ts::enrichCompany(name)` calls this function, then `parseEnrichment()`s the
  response. Function does best-effort JSON extraction only; schema validation is the caller's job.
- **Status: deployed and wired, but the one live test call (`{"name":"Stripe"}`) hit
  `402 insufficient_credits`** — the ButterBase account's Launch plan dashboard shows 5 USD AI
  credits included, but the AI gateway's own credit check saw `available_usd: 0`. No cost was
  incurred (gateway blocks before calling the model). Looks like a credit-provisioning sync lag
  since the subscription started the same day. User chose to wait and retry rather than top up.
  **Re-run when ready:** `mcp__butterbase__invoke_function` with `function_name: "enrich"`,
  `body: { "name": "Stripe" }` — or call `enrichCompany("Stripe")` from app code.

## Secondary: RocketRide pipe — NOT live-run (built, unverified)

Per the lane task's reality check: the connected `RocketRide_Document_Processor` MCP tool is only
a file-upload wrapper, not a pipe runner. The real path is the `rocketride` npm SDK + a `.pipe`
JSON file, run via `RocketRideClient` or `rocketride start --pipeline`.

`enrichment/pipeline.pipe` — two components, node names/config confirmed against
https://docs.rocketride.org/nodes:

1. `search_exa` (id `search`) — Exa web search. Needs an Exa API key, either in
   `config.apikey` or env `ROCKETRIDE_EXA_KEY`. Output lanes: `answers` (pretty JSON),
   `text` (plain text), `questions` (passthrough).
2. `llm_anthropic` (id `extract`) — feeds the search's `text` output into its `questions` input
   lane as one long question asking for JSON extraction. Needs an Anthropic API key
   (`sk-ant-...`) in `config.apikey`.

**Gaps — confirm before the first real run:**
- **No Exa key or Anthropic key provided** (only `ROCKETRIDE_APIKEY` was given). Both are
  separate per-provider keys the RocketRide nodes need on top of the platform key — ask for them
  or swap nodes for ones you already hold keys for (`tool_tavily` needs a Tavily key instead of
  Exa; `llm_openai` needs an OpenAI key instead of Anthropic).
- `llm_anthropic`'s docs list no dedicated structured-output-schema field — extraction into the
  `Enrichment` shape has to happen entirely through prompt wording in the question text, same
  as the ButterBase function. The exact question string isn't written into `pipeline.pipe` yet
  (needs the field hint from `shared/enrichment-schema.ts::ENRICHMENT_FIELD_HINT` appended at
  send-time, or baked into a wrapping node — RocketRide's docs didn't show a text-template/concat
  node, so this needs one more docs pass before first run).
- The `input: [{ "lane": "questions", "from": "$input" }]` on the `search` component and the
  `{ "sourceLane": "text" }` field on `extract`'s input are **my best guess**, not confirmed by
  the fetched docs (the schema page didn't document how the SDK's `send(token, name)` payload
  binds to a starting node, or whether `input` entries can select a specific output lane by name).
  **Validate against `/pipeline-reference` and a real `rocketride start --pipeline` dry run before
  trusting this file.**

**Wiring, once keys + the above are confirmed:**
```bash
npm install rocketride
# env: ROCKETRIDE_APIKEY=<provided>, ROCKETRIDE_URI=wss://api.rocketride.ai
```
```ts
const c = new RocketRideClient({ auth: process.env.ROCKETRIDE_APIKEY!, uri: "https://cloud.rocketride.ai" });
await c.connect();
const { token } = await c.use({ filepath: "./enrichment/pipeline.pipe" });
const r = await c.send(token, name);
```

Did not spend more than the ~30 min budget chasing exact wiring semantics past this point —
flagging the gaps above instead of guessing further.
