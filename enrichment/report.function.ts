/**
 * Deployed as the ButterBase function "report" (mcp__butterbase__deploy_function).
 * This file is the source of truth for what's live — redeploy after edits.
 *
 * The static frontend has no server, so this ONE server-side function runs the
 * whole pipeline the mock used to fake:
 *   1. enrich   — EXA web search → Kimi K2.5 (instant) extract, inlined here.
 *   2. upsert   — write the profile into the shared Neo4j graph.
 *   3. traverse — competitor ranking (shared-edge count) + investor-cluster signal.
 * and returns a CompanyReport ({ enrichment, competitors[], investorSignal|null })
 * exactly matching lib/types.ts, so the UI renders it with zero transforms.
 *
 * Enrichment is INLINED (not an HTTP call to the sibling `enrich` fn): the sandbox
 * egress can't route to this app's own /fn/ gateway, and inlining also drops a full
 * round-trip. The EXA→Kimi block is kept byte-for-byte in sync with
 * enrichment/enrich.function.ts (the standalone endpoint) — edit both together.
 *
 * Runs in ButterBase's isolated sandbox: only Web APIs + ctx. No npm, so there is
 * no Neo4j driver — the graph is reached over the Aura HTTP Query API (basic auth).
 * The normalizer / upsert / read-query logic is a hand-kept inline port of the
 * LOCKED contracts (shared/normalizer.ts, graph/upsert.ts, graph/queries.ts).
 * Keep the ported rules byte-identical to those files or seed + live writes stop
 * converging on the same node keys and the competitor graph goes empty.
 *
 * Secrets (ctx.env, set via deploy envVars / manage_function update_env):
 *   NEO4J_QUERY_URL  — https://<dbid>.databases.neo4j.io/db/<db>/query/v2
 *   NEO4J_USER, NEO4J_PASSWORD
 *   EXA_API_KEY, KIMI_API_KEY. Optional: KIMI_MODEL (default "kimi-k2.5").
 */

// ─────────────────────────── normalizer (LOCKED port) ───────────────────────
const LEGAL_SUFFIXES = [
  "inc", "inc.", "llc", "l.l.c", "ltd", "ltd.", "limited", "corp", "corp.",
  "corporation", "co", "co.", "company", "gmbh", "plc", "sa", "s.a", "ag",
  "bv", "b.v", "oy", "ab", "pte", "pvt", "pvt.", "srl", "sarl",
];

const ALIASES: Record<string, string> = {
  "yc": "y combinator",
  "ycombinator": "y combinator",
  "a16z": "andreessen horowitz",
  "andreessen": "andreessen horowitz",
  "sequoia capital": "sequoia",
  "gv": "google ventures",
  "google gv": "google ventures",
  "founders fund": "founders fund",
  "gcp": "google cloud",
  "google cloud platform": "google cloud",
  "aws": "amazon web services",
  "postgres": "postgresql",
  "node": "node.js",
  "nodejs": "node.js",
  "js": "javascript",
  "ts": "typescript",
  "k8s": "kubernetes",
  "pg": "postgresql",
  "ai": "artificial intelligence",
  "ml": "machine learning",
  "fintech": "financial technology",
  "devtools": "developer tools",
  "dev tools": "developer tools",
};

function baseClean(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9.\s&+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyAlias(key: string): string {
  return ALIASES[key] ?? key;
}

function normalizeCompanyName(raw: string): string {
  let s = baseClean(raw).replace(/[.,]/g, "").trim();
  const parts = s.split(" ").filter(Boolean);
  while (parts.length > 1 && LEGAL_SUFFIXES.includes(parts[parts.length - 1]!)) {
    parts.pop();
  }
  s = parts.join(" ");
  return applyAlias(s);
}

function normalizeDomain(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

function normalizeEntity(raw: string): string {
  const cleaned = baseClean(raw).replace(/^\.+|\.+$/g, "").trim();
  return applyAlias(cleaned);
}
const normalizeFund = normalizeEntity;
const normalizeTech = normalizeEntity;
const normalizeMarket = normalizeEntity;

function normalizePerson(raw: string): string {
  return baseClean(raw).replace(/[.]/g, "").trim();
}

// ─────────────────────────── Cypher (LOCKED port) ───────────────────────────
const UPSERT_COMPANY_QUERY = `
MERGE (c:Company {key: $companyKey})
SET c.name = $name,
    c.domain = $domain,
    c.description = $description,
    c.stage = $stage,
    c.foundedDate = $foundedDate,
    c.traction = $traction

WITH c
CALL {
  WITH c
  UNWIND $funds AS fund
  MERGE (f:Fund {key: fund.key})
  ON CREATE SET f.name = fund.name
  MERGE (c)-[r:FUNDED_BY]->(f)
  SET r.isLead = fund.isLead
  RETURN count(*) AS fundsWritten
}
WITH c
CALL {
  WITH c
  UNWIND $founders AS founder
  MERGE (p:Person {key: founder.key})
  ON CREATE SET p.name = founder.name
  MERGE (c)-[fr:FOUNDED_BY]->(p)
  SET fr.role = founder.role
  RETURN count(*) AS foundersWritten
}
WITH c
CALL {
  WITH c
  UNWIND $tech AS t
  MERGE (te:Tech {key: t.key})
  ON CREATE SET te.name = t.name
  MERGE (c)-[:USES]->(te)
  RETURN count(*) AS techWritten
}
WITH c
CALL {
  WITH c
  UNWIND $markets AS m
  MERGE (ma:Market {key: m.key})
  ON CREATE SET ma.name = m.name
  MERGE (c)-[:IN_MARKET]->(ma)
  RETURN count(*) AS marketsWritten
}
RETURN c.key AS key
`;

const COMPETITORS_QUERY = `
MATCH (target:Company {key: $key})
MATCH (target)-[:FUNDED_BY|USES|IN_MARKET]->(shared)<-[:FUNDED_BY|USES|IN_MARKET]-(other:Company)
WHERE other <> target
WITH other,
     collect(DISTINCT CASE WHEN shared:Fund THEN shared.name END) AS fundsRaw,
     collect(DISTINCT CASE WHEN shared:Tech THEN shared.name END) AS techRaw,
     collect(DISTINCT CASE WHEN shared:Market THEN shared.name END) AS marketsRaw
WITH other,
     [x IN fundsRaw WHERE x IS NOT NULL] AS sharedFunds,
     [x IN techRaw WHERE x IS NOT NULL] AS sharedTech,
     [x IN marketsRaw WHERE x IS NOT NULL] AS sharedMarkets
WITH other, sharedFunds, sharedTech, sharedMarkets,
     size(sharedFunds) + size(sharedTech) + size(sharedMarkets) AS sharedEdges
ORDER BY sharedEdges DESC
LIMIT toInteger($limit)
RETURN other.name AS name, sharedEdges, sharedFunds, sharedTech, sharedMarkets
`;

const INVESTOR_SIGNAL_QUERY = `
MATCH (target:Company {key: $key})-[r:FUNDED_BY {isLead: true}]->(fund:Fund)
WITH fund
LIMIT 1
MATCH (other:Company)-[:FUNDED_BY]->(fund)
WHERE other.key <> $key
RETURN fund.name AS fund, collect(DISTINCT other.name) AS coFunded
`;

// ─────────────────────────── types ──────────────────────────────────────────
interface Person { name: string; role: string }
interface Enrichment {
  name: string;
  domain: string | null;
  description: string;
  stage: string | null;
  foundedDate: string | null;
  founders: Person[];
  funds: string[];
  tech: string[];
  markets: string[];
  traction: string | null;
  sources: string[];
}
interface Competitor {
  name: string;
  sharedEdges: number;
  sharedFunds: string[];
  sharedTech: string[];
  sharedMarkets: string[];
  reason: string;
}
interface InvestorSignal { fund: string; coFunded: string[] }
interface CompanyReport {
  enrichment: Enrichment;
  competitors: Competitor[];
  investorSignal: InvestorSignal | null;
}

const COMPETITOR_LIMIT = 5;

// ─────────────────────── enrichment (in sync with enrich.function.ts) ────────
const FIELD_HINT = `{
  "name": string,
  "domain": string | null,
  "description": string,
  "stage": string | null,
  "foundedDate": string | null,
  "founders": [{ "name": string, "role": string }],
  "funds": string[],
  "tech": string[],
  "markets": string[],
  "traction": string | null,
  "sources": string[]
}`;

const SYSTEM_PROMPT = `You are a company research extractor. You are given a company name and SEARCH CONTEXT (web excerpts + their source URLs). Using ONLY that context, respond with ONLY a single JSON object — no markdown fences, no commentary — matching exactly this shape:

${FIELD_HINT}

Rules:
- "name" is required; use the company's canonical display name.
- Use null for any field the context does not support (not empty string, not "unknown").
- founders/funds/tech/markets are arrays; use [] if none found.
- "funds" holds investor / fund NAMES only (e.g. "Sequoia", "Y Combinator") — never dollar amounts, round sizes, or dates.
- "sources" must list the source URLs from the context you actually relied on.
- Do not fabricate. Prefer null/[] over guessing.`;

function stripCodeFence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}

/** EXA web search → compact context string + the source URLs it came from. */
async function exaSearch(name: string, apiKey: string): Promise<{ context: string; urls: string[] }> {
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      query: `${name} company — what they do, founders, funding, investors, tech stack, market`,
      type: "auto",
      numResults: 4,
      // Index-only (no livecrawl): index covers days-old cos; livecrawl adds ~3s/call.
      contents: { text: { maxCharacters: 800 } },
    }),
  });
  if (!res.ok) throw new Error(`exa search error ${res.status}: ${await res.text()}`);
  const json: any = await res.json();
  const results: any[] = json.results ?? [];
  const urls: string[] = results.map((r) => r.url).filter((u: any) => !!u);
  const context = results
    .map((r, i) => `[${i + 1}] ${r.title ?? ""} (${r.url ?? ""})\n${(r.text ?? "").trim()}`)
    .join("\n\n");
  return { context, urls };
}

/** EXA search → Kimi K2.5 (instant) extract → validated Enrichment. */
async function enrichCompany(name: string, exaKey: string, kimiKey: string, kimiModel: string): Promise<Enrichment> {
  const search = await exaSearch(name, exaKey);
  const aiRes = await fetch("https://api.moonshot.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${kimiKey}` },
    body: JSON.stringify({
      model: kimiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Company: ${name}\n\nSEARCH CONTEXT:\n${search.context || "(no results found)"}` },
      ],
      // Instant mode: thinking disabled (thinking empties content/times out), temp 0.6.
      thinking: { type: "disabled" },
      max_tokens: 2000,
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });
  if (!aiRes.ok) throw new Error(`kimi extract error ${aiRes.status}: ${await aiRes.text()}`);
  const aiJson: any = await aiRes.json();
  const content: string | undefined = aiJson?.choices?.[0]?.message?.content;
  if (!content) throw new Error("kimi returned no content");
  const parsed = coerceEnrichment(JSON.parse(stripCodeFence(content)));
  if (!parsed.sources.length) parsed.sources = search.urls;
  if (!parsed.name) parsed.name = name;
  return parsed;
}

// ─────────────────────────── helpers ────────────────────────────────────────
/** Coerce raw model output into a well-formed Enrichment (mirrors the zod defaults). */
function coerceEnrichment(raw: any): Enrichment {
  const arr = (v: any): any[] => (Array.isArray(v) ? v : []);
  return {
    name: String(raw?.name ?? "").trim(),
    domain: raw?.domain ?? null,
    description: typeof raw?.description === "string" ? raw.description : "",
    stage: raw?.stage ?? null,
    foundedDate: raw?.foundedDate ?? null,
    founders: arr(raw?.founders)
      .filter((f) => f && typeof f.name === "string" && f.name.trim())
      .map((f) => ({ name: String(f.name), role: typeof f.role === "string" ? f.role : "" })),
    funds: arr(raw?.funds).filter((x) => typeof x === "string" && x.trim()),
    tech: arr(raw?.tech).filter((x) => typeof x === "string" && x.trim()),
    markets: arr(raw?.markets).filter((x) => typeof x === "string" && x.trim()),
    traction: raw?.traction ?? null,
    sources: arr(raw?.sources).filter((x) => typeof x === "string" && x.trim()),
  };
}

/** Enrichment → normalized upsert params (port of buildUpsertQuery). */
function buildUpsertParams(e: Enrichment) {
  return {
    companyKey: normalizeCompanyName(e.name),
    name: e.name,
    domain: normalizeDomain(e.domain),
    description: e.description,
    stage: e.stage,
    foundedDate: e.foundedDate,
    traction: e.traction,
    funds: e.funds.map((raw, i) => ({ key: normalizeFund(raw), name: raw, isLead: i === 0 })),
    founders: e.founders.map((f) => ({ key: normalizePerson(f.name), name: f.name, role: f.role })),
    tech: e.tech.map((raw) => ({ key: normalizeTech(raw), name: raw })),
    markets: e.markets.map((raw) => ({ key: normalizeMarket(raw), name: raw })),
  };
}

/** "shares 1 investor, 2 tech, 2 markets" — only the non-empty parts. */
function buildReason(funds: string[], tech: string[], markets: string[]): string {
  const parts: string[] = [];
  if (funds.length) parts.push(`${funds.length} investor${funds.length > 1 ? "s" : ""}`);
  if (tech.length) parts.push(`${tech.length} tech`);
  if (markets.length) parts.push(`${markets.length} market${markets.length > 1 ? "s" : ""}`);
  return parts.length ? `shares ${parts.join(", ")}` : "shares graph neighbours";
}

interface Neo4jRow { [field: string]: any }

/** POST one Cypher statement to the Aura HTTP Query API; return rows as field→value objects. */
async function runCypher(
  url: string,
  auth: string,
  statement: string,
  parameters: Record<string, unknown>
): Promise<Neo4jRow[]> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ statement, parameters }),
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`neo4j non-JSON response ${res.status}: ${text.slice(0, 300)}`);
  }
  if (json?.errors?.length) {
    throw new Error(`neo4j error: ${json.errors[0].code} ${json.errors[0].message}`);
  }
  if (!res.ok) {
    throw new Error(`neo4j http ${res.status}: ${text.slice(0, 300)}`);
  }
  const fields: string[] = json?.data?.fields ?? [];
  const values: any[][] = json?.data?.values ?? [];
  return values.map((row) => {
    const obj: Neo4jRow = {};
    fields.forEach((f, i) => (obj[f] = row[i]));
    return obj;
  });
}

// ─────────────────────────── handler ────────────────────────────────────────
export default async function handler(req: Request, ctx: any): Promise<Response> {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  const name = body?.name?.trim();
  if (!name) return json({ error: "body.name is required" }, 400);

  const NEO4J_QUERY_URL = ctx.env?.NEO4J_QUERY_URL;
  const NEO4J_USER = ctx.env?.NEO4J_USER;
  const NEO4J_PASSWORD = ctx.env?.NEO4J_PASSWORD;
  const EXA_API_KEY = ctx.env?.EXA_API_KEY;
  const KIMI_API_KEY = ctx.env?.KIMI_API_KEY;
  const KIMI_MODEL = ctx.env?.KIMI_MODEL ?? "kimi-k2.5";
  if (!NEO4J_QUERY_URL || !NEO4J_USER || !NEO4J_PASSWORD) {
    return json({ error: "Neo4j query credentials not configured" }, 500);
  }
  if (!EXA_API_KEY || !KIMI_API_KEY) {
    return json({ error: "enrichment credentials not configured" }, 500);
  }
  const auth = `Basic ${btoa(`${NEO4J_USER}:${NEO4J_PASSWORD}`)}`;

  // 1. Enrich (EXA web search → Kimi K2.5 extract, inlined).
  let enrichment: Enrichment;
  try {
    enrichment = await enrichCompany(name, EXA_API_KEY, KIMI_API_KEY, KIMI_MODEL);
  } catch (e: any) {
    console.error("enrich error", e?.message);
    return json({ error: "enrichment failed", detail: String(e?.message ?? e) }, 502);
  }

  // 2. Upsert into the shared graph (idempotent).
  const key = normalizeCompanyName(enrichment.name);
  try {
    await runCypher(NEO4J_QUERY_URL, auth, UPSERT_COMPANY_QUERY, buildUpsertParams(enrichment));
  } catch (e: any) {
    console.error("graph upsert failed", e?.message);
    return json({ error: "graph upsert failed", detail: String(e?.message ?? e) }, 502);
  }

  // 3. Traverse — competitors + investor signal. A read failure degrades
  //    gracefully (still return the enrichment) rather than 502 the whole report.
  let competitors: Competitor[] = [];
  let investorSignal: InvestorSignal | null = null;
  try {
    const [compRows, invRows] = await Promise.all([
      runCypher(NEO4J_QUERY_URL, auth, COMPETITORS_QUERY, { key, limit: COMPETITOR_LIMIT }),
      runCypher(NEO4J_QUERY_URL, auth, INVESTOR_SIGNAL_QUERY, { key }),
    ]);
    competitors = compRows.map((r) => {
      const sharedFunds: string[] = r.sharedFunds ?? [];
      const sharedTech: string[] = r.sharedTech ?? [];
      const sharedMarkets: string[] = r.sharedMarkets ?? [];
      return {
        name: r.name,
        sharedEdges: Number(r.sharedEdges ?? 0),
        sharedFunds,
        sharedTech,
        sharedMarkets,
        reason: buildReason(sharedFunds, sharedTech, sharedMarkets),
      };
    });
    const inv = invRows[0];
    if (inv && Array.isArray(inv.coFunded) && inv.coFunded.length > 0) {
      investorSignal = { fund: inv.fund, coFunded: inv.coFunded };
    }
  } catch (e: any) {
    console.error("graph traversal failed (degrading)", e?.message);
  }

  const report: CompanyReport = { enrichment, competitors, investorSignal };
  return json(report, 200);
}
