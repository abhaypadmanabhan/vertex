/**
 * OWNER: Lane 3 (Enrichment). Fill this stub.
 * Contract: company name in → validated Enrichment out (via parseEnrichment).
 * Primary impl = ButterBase model-gateway LLM call (web-search + extract).
 * Do NOT change the signature — Lane 5 wiring + Lane 4 UI depend on it.
 */
import { type Enrichment } from "@shared/enrichment-schema";

/** Enrich a company by name. MUST return output validated by parseEnrichment(). */
export async function enrichCompany(_name: string): Promise<Enrichment> {
  throw new Error("enrichCompany not implemented — Lane 3 (Enrichment) owns this stub.");
}
