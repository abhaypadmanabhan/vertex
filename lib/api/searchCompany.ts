/**
 * OWNER: Lane 5 (Integration). Orchestration seam the UI calls — composes the
 * other four lanes' stubs into one CompanyReport. Pre-merge, each stub throws;
 * every stage below degrades to a safe fallback instead of crashing the demo.
 */
import { enrichCompany } from "../enrichment";
import { getCompetitors, getInvestorSignal, upsertCompany } from "../graph";
import { saveSearch } from "../db";
import { type CompanyReport, type Competitor, type InvestorSignal } from "../types";
import { parseEnrichment, type Enrichment } from "@shared/enrichment-schema";

/** Runs `fn`; on failure, logs and returns `fallback` instead of throwing. */
async function attempt<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[searchCompany] ${label} failed, using fallback: ${reason}`);
    return fallback;
  }
}

/** A bare-minimum Enrichment for `name` — used when live enrichment fails. */
function fallbackEnrichment(name: string): Enrichment {
  return parseEnrichment({ name });
}

/**
 * Enrich `name`, persist it into the graph, surface competitors + investor
 * signal, and log the search — then return the full report. Never throws:
 * any stage that fails degrades to an empty/default value.
 */
export async function searchCompany(name: string, jwt: string): Promise<CompanyReport> {
  const enrichment = await attempt(
    "enrichCompany",
    () => enrichCompany(name),
    fallbackEnrichment(name),
  );

  await attempt("upsertCompany", () => upsertCompany(enrichment), undefined);

  const [competitors, investorSignal] = await Promise.all([
    attempt<Competitor[]>("getCompetitors", () => getCompetitors(name), []),
    attempt<InvestorSignal | null>("getInvestorSignal", () => getInvestorSignal(name), null),
  ]);

  await attempt("saveSearch", () => saveSearch(jwt, name, enrichment), "");

  return { enrichment, competitors, investorSignal };
}
