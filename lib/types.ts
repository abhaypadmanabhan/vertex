/**
 * LOCKED cross-lane data-access types. The frontend (Lane 4) codes against
 * these; graph (Lane 2), backend (Lane 1), enrichment (Lane 3) implement the
 * functions in db.ts / graph.ts / enrichment.ts that return them.
 * Adding fields is fine; renaming/removing needs orchestrator sign-off.
 */
import type { Enrichment } from "@shared/enrichment-schema";

export type { Enrichment };

/** One ranked competitor surfaced by the graph traversal. */
export interface Competitor {
  name: string;                 // display name (denormalized for UI)
  sharedEdges: number;          // total shared neighbours (rank key)
  sharedFunds: string[];        // which investors overlap
  sharedTech: string[];         // which tech overlaps
  sharedMarkets: string[];      // which markets overlap
  /** Human "why surfaced" line, e.g. "shares 2 investors, 1 market". */
  reason: string;
}

/** Investor-cluster signal: other companies funded by the target's lead fund. */
export interface InvestorSignal {
  fund: string;                 // the lead fund
  coFunded: string[];           // other company names funded by that fund
}

/** A persisted search row (ButterBase `searches` table). */
export interface SearchRecord {
  id: string;
  company_name: string;
  result_json: Enrichment;
  created_at: string;
}

/** The full result object the results page renders. */
export interface CompanyReport {
  enrichment: Enrichment;
  competitors: Competitor[];
  investorSignal: InvestorSignal | null;
}
