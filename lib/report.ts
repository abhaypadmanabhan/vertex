/**
 * Browser client for the live `report` function — the static frontend's single
 * entry point to the backend. POSTs a company name to the ButterBase `report`
 * fn, which runs enrich → graph upsert → competitor/investor traversal server-
 * side and returns a CompanyReport (already matching @lib/types, no transform).
 *
 * Intentionally standalone (no import from lib/client.ts): that module pulls in
 * neo4j-driver, which must never be bundled into the static browser build.
 */
import type { CompanyReport } from "@lib/types";
import { BUTTERBASE_API_URL } from "@lib/config";

export class ReportError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ReportError";
  }
}

/**
 * Fetch the live company report for `name`. Throws ReportError on any non-2xx
 * (the fn returns `{ error, detail? }` bodies) or network failure. Pass a
 * signal to cancel a superseded in-flight request.
 */
export async function fetchCompanyReport(name: string, signal?: AbortSignal): Promise<CompanyReport> {
  let res: Response;
  try {
    res = await fetch(`${BUTTERBASE_API_URL}/fn/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ReportError("Couldn’t reach the enrichment service. Check your connection and try again.", 0);
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: string; detail?: string };
      detail = body?.error ?? body?.detail ?? "";
    } catch {
      /* non-JSON error body */
    }
    throw new ReportError(detail || `Enrichment failed (${res.status}).`, res.status);
  }

  return (await res.json()) as CompanyReport;
}
