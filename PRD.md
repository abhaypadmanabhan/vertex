# Vertex — PRD (Lean, 2.5hr Hackathon Build)

## One-line
Type any company name, even one that launched three days ago, and Vertex enriches it live, writes it into a shared knowledge graph, and uses graph traversal to surface competitors and investor signals that flat retrieval would miss.

## Why this wins
A flat LLM can already summarize a known company. Vertex does two things it structurally cannot:
1. **Enrichment beat:** builds a real, structured profile of an obscure/days-old company instead of saying "not enough data."
2. **Graph beat:** from that company's neighborhood in a shared Neo4j graph, it computes competitors and investor-cluster signals by structure (shared investors, shared tech, shared market), ranked by edge overlap — not guessed.

The hero demo: search an unknown YC startup. Watch it get enriched, added to the graph, and instantly connected to peers already in the graph.

## Mandatory stack (all load-bearing)
- **ButterBase** — app spine: Postgres (users, search history, saved reports, cached enrichment JSON), JWT auth, model gateway for the enrichment LLM calls, and frontend deployment to a live URL. This is the backbone; nearly everything non-graph lives here.
- **Neo4j (shared global graph)** — the company/fund/person/tech graph. One shared graph, not per-user. The agent writes enriched entities here and traverses with Cypher + one graph algorithm (competitor ranking by shared-edge count).
- **RocketRide Cloud** — the enrichment pipeline deployed as ONE live `.pipe` endpoint (company name in → web-search + LLM-extract → structured JSON out). Called by the app. Deployed to their cloud, not local.

## Deferred (explicitly OUT for the 2.5hr build; note in README as roadmap)
- Cognee (Neo4j-backed ingestion) — would replace hand-written graph writes later.
- Daytona (agent runs graph algo in sandbox) — bonus if time remains after core is demo-able.
- Payment (ButterBase Stripe Connect) — talking point only; free-tier-then-paid model described, not built.
- Identity resolution beyond simple name+domain normalization.
- Seeded graph is IN (small seed) because it makes the demo look alive; see Phase 1.

## Architecture (data flow)
1. User signs in (ButterBase auth).
2. User searches a company name.
3. App calls the **RocketRide enrichment endpoint** → returns structured company JSON (what they do, founders, funding, investors, tech stack, traction, market).
4. App caches that JSON in **ButterBase** (search history + cache).
5. App writes company + related nodes/edges into **Neo4j** (Company, Fund, Person, Tech, Market; edges FUNDED_BY, USES, FOUNDED_BY, IN_MARKET).
6. App runs a **Cypher traversal** to find competitors: companies sharing investors/tech/market with the target, ranked by number of shared edges.
7. UI renders the structured report + a competitor list (ranked, with "why" each surfaced) + a simple graph viz.

## Graph model
Nodes: `Company {name, domain, description, stage, foundedDate}`, `Fund {name}`, `Person {name, role}`, `Tech {name}`, `Market {name}`.
Edges: `(Company)-[:FUNDED_BY]->(Fund)`, `(Company)-[:FOUNDED_BY]->(Person)`, `(Company)-[:USES]->(Tech)`, `(Company)-[:IN_MARKET]->(Market)`.

Competitor query (the graph beat), conceptually:
Find companies that share Fund/Tech/Market edges with the target, count shared neighbors, return top N ordered by shared-edge count, excluding the target itself.

Identity on write: normalize company name (lowercase, trim, strip suffixes like Inc/Ltd) + domain match to avoid duplicate nodes. Good enough for demo.

## Data sources for enrichment
Public and safe only. Web search + company/about pages via the RocketRide pipeline's search node (or Exa/Firecrawl if wired into the pipeline). Funding/investor data from public sources. NO LinkedIn personal-connection scraping. Company/job/funding public data only.

## Auth model
Shared global graph (everyone reads/writes the same Neo4j). ButterBase auth scopes ONLY per-user app data: their search history and saved reports. RLS on those tables via ButterBase's user-isolation policy.

## Build phases (each is a GitHub issue cluster)

### Phase 0 — Connectivity (do first, ~15 min)
- Verify ButterBase MCP connected (list_apps works).
- Verify Neo4j MCP connected (run trivial Cypher).
- Verify RocketRide MCP connected.
- Create ButterBase app, note app_id + API base URL.

### Phase 1 — Backend spine (ButterBase)
- Define + apply schema: `users` handled by ButterBase auth; `searches` (user_id, company_name, result_json, created_at); `saved_reports` (user_id, company_name, created_at).
- Enable RLS / user-isolation on `searches` and `saved_reports`.
- Configure email/password auth.
- Seed Neo4j with ~5 known companies + their funds/tech/markets so the graph looks alive on demo. (Small hardcoded Cypher seed script.)

### Phase 2 — Enrichment pipeline (RocketRide)
- Build ONE `.pipe`: source (company name) → web-search node → LLM-extract node (structured JSON matching the graph model fields) → output.
- Deploy to RocketRide Cloud. Get the live endpoint URL.
- Test-call it once with a known company (COSTS TOKENS — get explicit go-ahead before running).
- FALLBACK if RocketRide fights you: temporarily call enrichment via ButterBase model gateway so the app works end-to-end, then swap the endpoint in once the pipe deploys. This keeps RocketRide load-bearing without letting it block the demo.

### Phase 3 — Graph write + traverse (Neo4j)
- Function/module: given enrichment JSON, upsert Company + related nodes/edges into Neo4j with name/domain normalization.
- Cypher: competitor query (shared-edge ranking), return top 5 with shared-edge reasons.
- Cypher: investor-cluster signal (other companies funded by the same lead fund).

### Phase 4 — Frontend (Next.js/React + shadcn, PADZY OS theme)
- Search box → loading state → results view.
- Results: structured report card (from enrichment JSON) + ranked competitor list (with "shares X investors, Y tech" reasons) + simple graph viz (can be a basic node-link render; do not over-invest).
- Auth screens (sign in / sign up) via ButterBase.
- Search history (per-user).

### Phase 5 — Deploy + polish
- Deploy frontend via ButterBase frontend deployment → live URL.
- End-to-end test on an obscure company (Tsenta). (COSTS TOKENS — explicit go-ahead first.)
- README: what it is, stack, the graph beat, deferred roadmap (Cognee/Daytona/payment).

### Phase 6 — Bonus (only if core is done and demo-able)
- Daytona: move the competitor-ranking computation into a Daytona sandbox as an "agent runs code" step.

## Design track (PARALLEL, non-blocking)
- Logo + design language generated separately (GPT Images 2.0 + PADZY OS skill). Do NOT let this block Phases 0–5. Use placeholder styling first; drop in real design when ready.

## Demo script (what you'll show)
1. Sign in.
2. Search a company nobody knows (Tsenta). It enriches live → structured profile appears.
3. Point out: it's now in the graph, connected to peers.
4. Show the ranked competitor list with the "why" (shared investors/tech) — "this is the graph computing, not the LLM guessing."
5. Show the investor-cluster signal.
6. One line on the roadmap (Cognee ingestion, Daytona sandbox, monetization).

## Hard constraints (per builder rules)
- No live paid API call or token-spending test run without explicit go-ahead. Flag cost before any such run.
- Diagnose before fixing.
- One step at a time with a verification gate before proceeding.
- Use the superpowers skill on every Claude Code task. On any UI/UX task, also use the frontend-design skill and the shadcn MCP.
