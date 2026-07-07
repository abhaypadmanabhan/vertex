/**
 * Upsert an Enrichment into the shared graph. Query construction is pure
 * (buildUpsertQuery) so it can be verified without a live driver session;
 * upsertCompanyToGraph is the thin execution wrapper the app calls.
 *
 * Every list write uses `CALL { WITH c ... UNWIND ... RETURN count(*) }`
 * instead of a bare `WITH c UNWIND ...`: an UNWIND over an empty array drops
 * the row entirely, which would silently skip every later MERGE block (and
 * the final RETURN) whenever a company has zero founders/tech/markets. The
 * CALL subquery isolates each list so an empty one just returns count 0.
 */
import {
  normalizeCompanyName,
  normalizeDomain,
  normalizeFund,
  normalizePerson,
  normalizeTech,
  normalizeMarket,
} from "@shared/normalizer";
import { type Enrichment } from "@shared/enrichment-schema";
import { getSession } from "./driver";

export const UPSERT_COMPANY_QUERY = `
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

export interface UpsertParams {
  companyKey: string;
  name: string;
  domain: string;
  description: string;
  stage: string | null;
  foundedDate: string | null;
  traction: string | null;
  funds: { key: string; name: string; isLead: boolean }[];
  founders: { key: string; name: string; role: string }[];
  tech: { key: string; name: string }[];
  markets: { key: string; name: string }[];
}

/** Pure: Enrichment -> normalized Cypher params. No I/O, no DB required. */
export function buildUpsertQuery(e: Enrichment): { query: string; params: UpsertParams } {
  const params: UpsertParams = {
    companyKey: normalizeCompanyName(e.name),
    name: e.name,
    domain: normalizeDomain(e.domain),
    description: e.description,
    stage: e.stage,
    foundedDate: e.foundedDate,
    traction: e.traction,
    funds: e.funds.map((raw, i) => ({
      key: normalizeFund(raw),
      name: raw,
      isLead: i === 0,
    })),
    founders: e.founders.map((f) => ({
      key: normalizePerson(f.name),
      name: f.name,
      role: f.role,
    })),
    tech: e.tech.map((raw) => ({ key: normalizeTech(raw), name: raw })),
    markets: e.markets.map((raw) => ({ key: normalizeMarket(raw), name: raw })),
  };
  return { query: UPSERT_COMPANY_QUERY, params };
}

/** Execute the upsert against the live graph. Idempotent — safe to re-run. */
export async function upsertCompanyToGraph(e: Enrichment): Promise<void> {
  const { query, params } = buildUpsertQuery(e);
  const session = getSession();
  try {
    await session.run(query, params as unknown as Record<string, unknown>);
  } finally {
    await session.close();
  }
}
