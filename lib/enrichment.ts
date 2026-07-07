/**
 * OWNER: Lane 3 (Enrichment). Fill this stub.
 * Contract: company name in → validated Enrichment out (via parseEnrichment).
 * Primary impl = ButterBase model-gateway LLM call (web-search + extract).
 * Do NOT change the signature — Lane 5 wiring + Lane 4 UI depend on it.
 */
import { type Enrichment, parseEnrichment } from "@shared/enrichment-schema";
import { BUTTERBASE_API_URL } from "@lib/config";

/** Enrich a company by name. MUST return output validated by parseEnrichment(). */
export async function enrichCompany(name: string): Promise<Enrichment> {
  const res = await fetch(`${BUTTERBASE_API_URL}/fn/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error(`enrich function returned ${res.status}: ${await res.text()}`);
  }

  const raw = await res.json();
  return parseEnrichment(raw);
}
