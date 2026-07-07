/**
 * Deployed as the ButterBase function "enrich" (mcp__butterbase__deploy_function).
 * This file is the source of truth for what's live — redeploy after edits.
 *
 * Runs in ButterBase's isolated function sandbox: only Web APIs + ctx are available,
 * no npm imports. So the field hint below is a hand-kept copy of
 * shared/enrichment-schema.ts::ENRICHMENT_FIELD_HINT — keep the two in sync.
 *
 * Model: perplexity/sonar — the only catalog model that does real live web search
 * (plain chat models like claude/gpt only have training-data knowledge, no browsing).
 * Schema validation happens on the caller side (lib/enrichment.ts::parseEnrichment);
 * this function only does best-effort JSON extraction.
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

const SYSTEM_PROMPT = `You are a company research extractor. Given a company name, use web search to find current public information about it, then respond with ONLY a single JSON object — no markdown fences, no commentary — matching exactly this shape:

${FIELD_HINT}

Rules:
- "name" is required; use the company's canonical display name.
- Use null for any field you cannot find (not empty string, not "unknown").
- founders/funds/tech/markets are arrays; use [] if none found.
- "sources" must list the public URLs you actually used.
- Public sources only. Do not fabricate facts — prefer null/[] over guessing.`;

function stripCodeFence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}

export default async function handler(req: Request, ctx: any): Promise<Response> {
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = body?.name?.trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "body.name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { BUTTERBASE_APP_ID, BUTTERBASE_API_URL, BUTTERBASE_API_KEY } = ctx.env;

  const aiRes = await fetch(`${BUTTERBASE_API_URL}/v1/${BUTTERBASE_APP_ID}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BUTTERBASE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "perplexity/sonar",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: name },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error("ai gateway error", aiRes.status, errText);
    return new Response(JSON.stringify({ error: "ai gateway error", status: aiRes.status, detail: errText }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const aiJson = await aiRes.json();
  const content: string | undefined = aiJson?.choices?.[0]?.message?.content;
  if (!content) {
    console.error("ai gateway returned no content", JSON.stringify(aiJson));
    return new Response(JSON.stringify({ error: "ai gateway returned no content" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  let extracted: unknown;
  try {
    extracted = JSON.parse(stripCodeFence(content));
  } catch (e) {
    console.error("failed to parse model output as JSON", content);
    return new Response(JSON.stringify({ error: "model output was not valid JSON", raw: content }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(extracted), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
