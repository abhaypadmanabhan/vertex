/**
 * OWNER: Lane 5 (Integration). Shared low-level clients other lanes build on:
 * a typed ButterBase REST wrapper and a Neo4j driver singleton. Do not put
 * business logic here — that belongs in db.ts / graph.ts / enrichment.ts.
 */
import neo4j, { type Driver } from "neo4j-driver";
import {
  BUTTERBASE_API_URL,
  NEO4J_PASSWORD,
  NEO4J_URI,
  NEO4J_USER,
} from "./config";

// ---------------------------------------------------------------------------
// ButterBase REST wrapper
// ---------------------------------------------------------------------------

export class ButterBaseError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ButterBaseError";
  }
}

export interface ButterBaseRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** Per-user JWT — required for RLS-scoped calls (searches, saved_reports). */
  jwt?: string;
  /** Server-side API key — for admin/service calls with no end user in context. */
  apiKey?: string;
  body?: unknown;
  /** Extra query params appended to the path. */
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: ButterBaseRequestOptions["query"]): string {
  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    `${BUTTERBASE_API_URL}/`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Typed fetch wrapper against the ButterBase REST API. Throws ButterBaseError on non-2xx. */
export async function butterbaseFetch<T>(
  path: string,
  opts: ButterBaseRequestOptions = {},
): Promise<T> {
  const { method = "GET", jwt, apiKey, body, query } = opts;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  else if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const parsed: unknown = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : `ButterBase request failed: ${method} ${path} (${res.status})`;
    throw new ButterBaseError(message, res.status, parsed);
  }

  return parsed as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------------------------------------------------------------------------
// Neo4j driver singleton (server-side only)
// ---------------------------------------------------------------------------

let driverSingleton: Driver | null = null;

/** Lazily-created, process-wide Neo4j driver. Reused across calls; never per-request. */
export function getNeo4jDriver(): Driver {
  if (!driverSingleton) {
    if (!NEO4J_URI) {
      throw new Error(
        "NEO4J_URI is not set — copy .env.example to .env and fill Neo4j Aura creds.",
      );
    }
    driverSingleton = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
    );
  }
  return driverSingleton;
}

/** Close the driver singleton. Call on process shutdown (scripts, tests) — not per-request. */
export async function closeNeo4jDriver(): Promise<void> {
  if (driverSingleton) {
    await driverSingleton.close();
    driverSingleton = null;
  }
}
