/**
 * Deployed as the ButterBase function "enrich" (mcp__butterbase__deploy_function).
 * This file is the source of truth for what's live — redeploy after edits.
 *
 * Runs in ButterBase's isolated function sandbox: only Web APIs + ctx are available,
 * no npm imports. So the field hint below is a hand-kept copy of
 * shared/enrichment-schema.ts::ENRICHMENT_FIELD_HINT — keep the two in sync.
 *
 * Flow (BYOK — no ButterBase model tokens used):
 *   1. EXA (`https://api.exa.ai/search`) does the live web search + page-text fetch.
 *   2. Kimi K2.5 (`https://api.moonshot.ai/v1/chat/completions`, OpenAI-compatible)
 *      extracts a single JSON object matching the schema from that context.
 * Splitting browse (EXA) from extract (Kimi) is why obscure/days-old companies work —
 * Kimi alone has only training-data knowledge and cannot browse.
 *
 * Secrets come from ctx.env (set via deploy envVars or manage_function update_env):
 *   EXA_API_KEY, KIMI_API_KEY. Optional: KIMI_MODEL (default "kimi-k2.5").
 * Schema validation happens caller-side (lib/enrichment.ts::parseEnrichment).
 */

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

interface ExaResult {
  title?: string;
  url?: string;
  text?: string;
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
      // Index-only (no livecrawl): EXA's index already covers days-old companies,
      // and livecrawl adds ~3s/call. 800-char excerpts keep Kimi's input small.
      contents: { text: { maxCharacters: 800 } },
    }),
  });
  if (!res.ok) {
    throw new Error(`exa search error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { results?: ExaResult[] };
  const results = json.results ?? [];
  const urls = results.map((r) => r.url).filter((u): u is string => !!u);
  const context = results
    .map((r, i) => `[${i + 1}] ${r.title ?? ""} (${r.url ?? ""})\n${(r.text ?? "").trim()}`)
    .join("\n\n");
  return { context, urls };
}

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

  const EXA_API_KEY = ctx.env?.EXA_API_KEY;
  const KIMI_API_KEY = ctx.env?.KIMI_API_KEY;
  const KIMI_MODEL = ctx.env?.KIMI_MODEL ?? "kimi-k2.5";
  if (!EXA_API_KEY) return json({ error: "EXA_API_KEY not configured" }, 500);
  if (!KIMI_API_KEY) return json({ error: "KIMI_API_KEY not configured" }, 500);

  // 1. Live web search (EXA).
  let search: { context: string; urls: string[] };
  try {
    search = await exaSearch(name, EXA_API_KEY);
  } catch (e: any) {
    console.error("exa search failed", e?.message);
    return json({ error: "web search failed", detail: String(e?.message ?? e) }, 502);
  }

  // 2. Structured extraction (Kimi K2.5, OpenAI-compatible).
  const aiRes = await fetch("https://api.moonshot.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KIMI_API_KEY}` },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Company: ${name}\n\nSEARCH CONTEXT:\n${search.context || "(no results found)"}`,
        },
      ],
      // Kimi K2.5 defaults to thinking mode (slow, reasoning_content eats the
      // token budget → empty content / timeouts). Extraction needs no reasoning,
      // so run instant mode: thinking disabled, temp 0.6 (1.0 is thinking-only).
      thinking: { type: "disabled" },
      max_tokens: 2000,
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error("kimi error", aiRes.status, errText);
    return json({ error: "kimi extract error", status: aiRes.status, detail: errText }, 502);
  }

  const aiJson = await aiRes.json();
  const content: string | undefined = aiJson?.choices?.[0]?.message?.content;
  if (!content) {
    console.error("kimi returned no content", JSON.stringify(aiJson));
    return json({ error: "kimi returned no content" }, 502);
  }

  let extracted: any;
  try {
    extracted = JSON.parse(stripCodeFence(content));
  } catch {
    console.error("kimi output not valid JSON", content);
    return json({ error: "model output was not valid JSON", raw: content }, 502);
  }

  // Fall back to EXA's URLs if the model didn't populate sources.
  if (!Array.isArray(extracted.sources) || extracted.sources.length === 0) {
    extracted.sources = search.urls;
  }

  return json(extracted, 200);
}
