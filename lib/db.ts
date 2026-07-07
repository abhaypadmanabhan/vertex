/**
 * OWNER: Lane 1 (Backend / ButterBase). Fill these stubs.
 * Talks to ButterBase REST (searches + saved_reports tables) with the caller's
 * end-user JWT for RLS isolation. Do NOT change signatures.
 */
import { type Enrichment } from "@shared/enrichment-schema";
import { type SearchRecord } from "./types";

/** Persist a completed search for the current user. Returns the new row id. */
export async function saveSearch(
  _jwt: string,
  _companyName: string,
  _result: Enrichment,
): Promise<string> {
  throw new Error("saveSearch not implemented — Lane 1 (Backend) owns this stub.");
}

/** The current user's search history, newest first. */
export async function getHistory(_jwt: string): Promise<SearchRecord[]> {
  throw new Error("getHistory not implemented — Lane 1 (Backend) owns this stub.");
}

/** Save a report to the user's saved_reports. */
export async function saveReport(_jwt: string, _companyName: string): Promise<void> {
  throw new Error("saveReport not implemented — Lane 1 (Backend) owns this stub.");
}
