/**
 * OWNER: Lane 2 (Graph / Neo4j). Fill these stubs — this is the moat.
 * All writes MUST go through the shared normalizer so seed + live enrichment
 * converge on identical node keys. Do NOT change signatures.
 */
import { type Enrichment } from "@shared/enrichment-schema";
import { type Competitor, type InvestorSignal } from "./types";

/** Upsert Company + Fund/Person/Tech/Market nodes and edges from an Enrichment. */
export async function upsertCompany(_e: Enrichment): Promise<void> {
  throw new Error("upsertCompany not implemented — Lane 2 (Graph) owns this stub.");
}

/** Competitors of `companyName`, ranked by shared-edge count, top `limit`. */
export async function getCompetitors(_companyName: string, _limit = 5): Promise<Competitor[]> {
  throw new Error("getCompetitors not implemented — Lane 2 (Graph) owns this stub.");
}

/** Investor-cluster signal: other companies funded by the target's lead fund. */
export async function getInvestorSignal(_companyName: string): Promise<InvestorSignal | null> {
  throw new Error("getInvestorSignal not implemented — Lane 2 (Graph) owns this stub.");
}
