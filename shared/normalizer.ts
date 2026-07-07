/**
 * ============================================================================
 * LOCKED CONTRACT — Entity normalizer. DO NOT edit rules without orchestrator
 * sign-off. Seed AND live enrichment MUST both write nodes through these
 * functions, or shared edges never line up and the competitor graph is empty.
 * The alias map is what makes "YC" and "Y Combinator" collapse to one Fund
 * node — that collapse IS the moat. Grow the alias map, never rename keys.
 * ============================================================================
 */

/** Legal suffixes stripped from company names before keying. */
const LEGAL_SUFFIXES = [
  "inc", "inc.", "llc", "l.l.c", "ltd", "ltd.", "limited", "corp", "corp.",
  "corporation", "co", "co.", "company", "gmbh", "plc", "sa", "s.a", "ag",
  "bv", "b.v", "oy", "ab", "pte", "pvt", "pvt.", "srl", "sarl",
];

/** Canonical alias map. LEFT (any variant, already normalized) → RIGHT (canonical, already normalized). */
const ALIASES: Record<string, string> = {
  // ---- Funds / investors ----
  "yc": "y combinator",
  "ycombinator": "y combinator",
  "a16z": "andreessen horowitz",
  "andreessen": "andreessen horowitz",
  "sequoia capital": "sequoia",
  "gv": "google ventures",
  "google gv": "google ventures",
  "founders fund": "founders fund",
  // ---- Tech ----
  "gcp": "google cloud",
  "google cloud platform": "google cloud",
  "aws": "amazon web services",
  "postgres": "postgresql",
  "node": "node.js",
  "nodejs": "node.js",
  "js": "javascript",
  "ts": "typescript",
  "k8s": "kubernetes",
  "pg": "postgresql",
  // ---- Markets ----
  "ai": "artificial intelligence",
  "ml": "machine learning",
  "fintech": "financial technology",
  "devtools": "developer tools",
  "dev tools": "developer tools",
};

/** Lowercase, trim, collapse internal whitespace, strip most punctuation (keep + . for now then remove). */
function baseClean(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[’'`]/g, "")            // curly/straight apostrophes
    .replace(/[^a-z0-9.\s&+-]/g, " ") // drop other punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function applyAlias(key: string): string {
  return ALIASES[key] ?? key;
}

/** Company name → stable node key. Strips legal suffixes + punctuation. */
export function normalizeCompanyName(raw: string): string {
  let s = baseClean(raw).replace(/[.,]/g, "").trim();
  const parts = s.split(" ").filter(Boolean);
  while (parts.length > 1 && LEGAL_SUFFIXES.includes(parts[parts.length - 1]!)) {
    parts.pop();
  }
  s = parts.join(" ");
  return applyAlias(s);
}

/** Domain → stable key: strip protocol, www, path, lowercase. Empty string if falsy. */
export function normalizeDomain(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

/** Generic entity (fund / tech / market) → stable node key, alias-collapsed.
 * Keeps internal dots (node.js) but strips trailing/leading dots. */
export function normalizeEntity(raw: string): string {
  const cleaned = baseClean(raw).replace(/^\.+|\.+$/g, "").trim();
  return applyAlias(cleaned);
}

export const normalizeFund = normalizeEntity;
export const normalizeTech = normalizeEntity;
export const normalizeMarket = normalizeEntity;

/** Person name → stable key (name only; roles are edge properties, not identity). */
export function normalizePerson(raw: string): string {
  return baseClean(raw).replace(/[.]/g, "").trim();
}
