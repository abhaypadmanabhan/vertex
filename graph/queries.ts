/**
 * Read-side Cypher: competitor ranking (shared-edge count) + investor-cluster
 * signal (lead-fund co-investment). Query text is exported as constants so
 * it can be verified directly (e.g. via the neo4j MCP tools) without going
 * through the app's driver session.
 */
import { normalizeCompanyName } from "@shared/normalizer";
import { getSession } from "./driver";

export const COMPETITORS_QUERY = `
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

export const INVESTOR_SIGNAL_QUERY = `
MATCH (target:Company {key: $key})-[r:FUNDED_BY {isLead: true}]->(fund:Fund)
WITH fund
LIMIT 1
MATCH (other:Company)-[:FUNDED_BY]->(fund)
WHERE other.key <> $key
RETURN fund.name AS fund, collect(DISTINCT other.name) AS coFunded
`;

export interface CompetitorRow {
  name: string;
  sharedEdges: number;
  sharedFunds: string[];
  sharedTech: string[];
  sharedMarkets: string[];
}

export function buildCompetitorsQuery(
  companyName: string,
  limit: number
): { query: string; params: { key: string; limit: number } } {
  return {
    query: COMPETITORS_QUERY,
    params: { key: normalizeCompanyName(companyName), limit },
  };
}

export async function queryCompetitors(companyName: string, limit: number): Promise<CompetitorRow[]> {
  const { query, params } = buildCompetitorsQuery(companyName, limit);
  const session = getSession();
  try {
    const result = await session.run(query, { key: params.key, limit: params.limit });
    return result.records.map((r) => ({
      name: r.get("name") as string,
      sharedEdges: typeof r.get("sharedEdges") === "number" ? r.get("sharedEdges") : r.get("sharedEdges").toNumber(),
      sharedFunds: r.get("sharedFunds") as string[],
      sharedTech: r.get("sharedTech") as string[],
      sharedMarkets: r.get("sharedMarkets") as string[],
    }));
  } finally {
    await session.close();
  }
}

export interface InvestorSignalRow {
  fund: string;
  coFunded: string[];
}

export function buildInvestorSignalQuery(companyName: string): { query: string; params: { key: string } } {
  return { query: INVESTOR_SIGNAL_QUERY, params: { key: normalizeCompanyName(companyName) } };
}

export async function queryInvestorSignal(companyName: string): Promise<InvestorSignalRow | null> {
  const { query, params } = buildInvestorSignalQuery(companyName);
  const session = getSession();
  try {
    const result = await session.run(query, params);
    const first = result.records[0];
    if (!first) return null;
    return { fund: first.get("fund") as string, coFunded: first.get("coFunded") as string[] };
  } finally {
    await session.close();
  }
}
