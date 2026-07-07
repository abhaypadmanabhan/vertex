/**
 * Runtime config. app_id + api_url are PUBLIC (auth is per-user JWT, not these).
 * Secrets (Neo4j password, ButterBase API key) come from env — never commit them.
 */
export const BUTTERBASE_APP_ID = "app_ukesbu2ssy8a";
export const BUTTERBASE_API_URL =
  process.env.NEXT_PUBLIC_BUTTERBASE_API_URL ??
  "https://api.butterbase.ai/v1/app_ukesbu2ssy8a";

/** Neo4j — server-side only. Set in .env (see .env.example). */
export const NEO4J_URI = process.env.NEO4J_URI ?? "";
export const NEO4J_USER = process.env.NEO4J_USER ?? "neo4j";
export const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD ?? "";
