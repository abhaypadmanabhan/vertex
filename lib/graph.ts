/**
 * OWNER: Lane 2 (Graph / Neo4j). Fill these stubs — this is the moat.
 * All writes MUST go through the shared normalizer so seed + live enrichment
 * converge on identical node keys. Do NOT change signatures.
 */
import { type Enrichment } from "@shared/enrichment-schema";
import { type Competitor, type InvestorSignal } from "./types";
import { upsertCompanyToGraph } from "../graph/upsert";
import { queryCompetitors, queryInvestorSignal } from "../graph/queries";

/** Upsert Company + Fund/Person/Tech/Market nodes and edges from an Enrichment. */
export async function upsertCompany(e: Enrichment): Promise<void> {
  await upsertCompanyToGraph(e);
}

function reasonFor(sharedFunds: string[], sharedTech: string[], sharedMarkets: string[]): string {
  const parts: string[] = [];
  if (sharedFunds.length) parts.push(`${sharedFunds.length} investor${sharedFunds.length > 1 ? "s" : ""}`);
  if (sharedTech.length) parts.push(`${sharedTech.length} tech`);
  if (sharedMarkets.length) parts.push(`${sharedMarkets.length} market${sharedMarkets.length > 1 ? "s" : ""}`);
  return parts.length ? `shares ${parts.join(", ")}` : "no shared neighbours";
}

/** Competitors of `companyName`, ranked by shared-edge count, top `limit`. */
export async function getCompetitors(companyName: string, limit = 5): Promise<Competitor[]> {
  const rows = await queryCompetitors(companyName, limit);
  return rows.map((r) => ({
    name: r.name,
    sharedEdges: r.sharedEdges,
    sharedFunds: r.sharedFunds,
    sharedTech: r.sharedTech,
    sharedMarkets: r.sharedMarkets,
    reason: reasonFor(r.sharedFunds, r.sharedTech, r.sharedMarkets),
  }));
}

/** Investor-cluster signal: other companies funded by the target's lead fund. */
export async function getInvestorSignal(companyName: string): Promise<InvestorSignal | null> {
  const row = await queryInvestorSignal(companyName);
  if (!row) return null;
  return { fund: row.fund, coFunded: row.coFunded };
}
