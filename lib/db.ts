/**
 * OWNER: Lane 1 (Backend / ButterBase). Fill these stubs.
 * Talks to ButterBase REST (searches + saved_reports tables) with the caller's
 * end-user JWT for RLS isolation. Do NOT change signatures.
 */
import { type Enrichment } from "@shared/enrichment-schema";
import { type SearchRecord } from "./types";
import { BUTTERBASE_API_URL } from "./config";

async function butterbaseFetch(jwt: string, path: string, init?: RequestInit) {
  const res = await fetch(`${BUTTERBASE_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`ButterBase ${init?.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res;
}

/** Persist a completed search for the current user. Returns the new row id. */
export async function saveSearch(
  jwt: string,
  companyName: string,
  result: Enrichment,
): Promise<string> {
  const res = await butterbaseFetch(jwt, "/searches", {
    method: "POST",
    body: JSON.stringify({ company_name: companyName, result_json: result }),
  });
  const row = (await res.json()) as { id: string };
  return row.id;
}

/** The current user's search history, newest first. */
export async function getHistory(jwt: string): Promise<SearchRecord[]> {
  const res = await butterbaseFetch(jwt, "/searches?order=created_at.desc");
  return (await res.json()) as SearchRecord[];
}

/** Save a report to the user's saved_reports. */
export async function saveReport(jwt: string, companyName: string): Promise<void> {
  await butterbaseFetch(jwt, "/saved_reports", {
    method: "POST",
    body: JSON.stringify({ company_name: companyName }),
  });
}
