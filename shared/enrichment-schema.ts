/**
 * ============================================================================
 * LOCKED CONTRACT — Enrichment JSON schema.  DO NOT edit field names/shape
 * without orchestrator sign-off. Every lane binds to this:
 *   RocketRide / model-gateway OUTPUT  →  ButterBase cache  →  Neo4j write  →  UI render.
 * A drift here breaks the graph beat (shared edges vanish → no competitors).
 * ============================================================================
 */
import { z } from "zod";

/** A founder / key person. role is free-text (e.g. "CEO", "co-founder & CTO"). */
export const PersonSchema = z.object({
  name: z.string().min(1),
  role: z.string().default(""),
});

/**
 * The single structured profile the enrichment step must return.
 * String-array fields (funds/tech/markets) become graph edges — they MUST be
 * passed through the shared normalizer before writing so seed + live enrichment
 * converge on identical node keys.
 */
export const EnrichmentSchema = z.object({
  /** Display name, as found. Normalizer derives the node key from this. */
  name: z.string().min(1),
  /** Primary domain, e.g. "acme.com". null if unknown. */
  domain: z.string().nullable().default(null),
  /** One–three sentence plain description of what the company does. */
  description: z.string().default(""),
  /** Funding stage: "pre-seed" | "seed" | "series-a" ... | null. Free-text ok. */
  stage: z.string().nullable().default(null),
  /** Founded date or year as a string, e.g. "2024" or "2024-03". null if unknown. */
  foundedDate: z.string().nullable().default(null),
  /** Founders / key people → (Company)-[:FOUNDED_BY]->(Person). */
  founders: z.array(PersonSchema).default([]),
  /** Investor / fund names → (Company)-[:FUNDED_BY]->(Fund). First entry treated as lead. */
  funds: z.array(z.string()).default([]),
  /** Tech stack → (Company)-[:USES]->(Tech). */
  tech: z.array(z.string()).default([]),
  /** Markets / sectors → (Company)-[:IN_MARKET]->(Market). */
  markets: z.array(z.string()).default([]),
  /** Free-text traction summary (users, revenue, growth). null if unknown. */
  traction: z.string().nullable().default(null),
  /** Source URLs used for enrichment (public only). */
  sources: z.array(z.string()).default([]),
});

export type Person = z.infer<typeof PersonSchema>;
export type Enrichment = z.infer<typeof EnrichmentSchema>;

/** Parse+validate unknown model output into a well-formed Enrichment (throws on bad shape). */
export function parseEnrichment(raw: unknown): Enrichment {
  return EnrichmentSchema.parse(raw);
}

/** JSON-schema-ish field list for prompting the extractor LLM (kept in sync with the zod schema). */
export const ENRICHMENT_FIELD_HINT = `{
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
