/**
 * MOCK data for Lane 4 UI development. Typed against the LOCKED cross-lane types
 * so Lane 5 can swap real `enrichCompany` / `getCompetitors` / `getHistory`
 * results in with zero UI changes. Nothing here hits a network or costs tokens.
 */
import type {
  CompanyReport,
  Competitor,
  Enrichment,
  InvestorSignal,
  SearchRecord,
} from "@lib/types";

/** Ordered enrichment pipeline steps — drives the loading state's live log. */
export const ENRICH_STEPS = [
  "Resolving entity",
  "Web search",
  "Extracting profile",
  "Writing to graph",
  "Traversing neighborhood",
  "Ranking competitors",
] as const;

const tsenta: Enrichment = {
  name: "Tsenta",
  domain: "tsenta.ai",
  description:
    "Serves and autoscales open-weight models on a shared GPU pool, with per-request cold starts under 400 ms.",
  stage: "seed",
  foundedDate: "2024",
  founders: [
    { name: "Nadia To46", role: "co-founder & CEO" },
    { name: "Owen Fry", role: "co-founder & CTO" },
  ],
  funds: ["Y Combinator", "Conviction", "Elad Gil"],
  tech: ["TypeScript", "Rust", "Postgres", "Kubernetes", "CUDA"],
  markets: ["AI infrastructure", "developer tools", "model serving"],
  traction: "1,240 developers on the waitlist; 40 teams in private beta.",
  sources: ["https://www.ycombinator.com/companies/tsenta", "https://tsenta.ai"],
};

const competitors: Competitor[] = [
  {
    name: "Baseten",
    sharedEdges: 5,
    sharedFunds: ["Y Combinator"],
    sharedTech: ["Rust", "Kubernetes"],
    sharedMarkets: ["AI infrastructure", "model serving"],
    reason: "shares 1 investor, 2 tech, 2 markets",
  },
  {
    name: "Modal",
    sharedEdges: 5,
    sharedFunds: [],
    sharedTech: ["Rust", "Kubernetes", "CUDA"],
    sharedMarkets: ["AI infrastructure", "developer tools"],
    reason: "shares 3 tech, 2 markets",
  },
  {
    name: "Replicate",
    sharedEdges: 4,
    sharedFunds: ["Y Combinator"],
    sharedTech: ["CUDA"],
    sharedMarkets: ["AI infrastructure", "model serving"],
    reason: "shares 1 investor, 1 tech, 2 markets",
  },
  {
    name: "Beam",
    sharedEdges: 3,
    sharedFunds: [],
    sharedTech: ["Rust", "CUDA"],
    sharedMarkets: ["model serving"],
    reason: "shares 2 tech, 1 market",
  },
  {
    name: "Fireworks AI",
    sharedEdges: 3,
    sharedFunds: ["Conviction"],
    sharedTech: ["CUDA"],
    sharedMarkets: ["AI infrastructure"],
    reason: "shares 1 investor, 1 tech, 1 market",
  },
];

const investorSignal: InvestorSignal = {
  fund: "Y Combinator",
  coFunded: ["Baseten", "Replicate", "Weights & Biases", "Helicone"],
};

const TSENTA_REPORT: CompanyReport = {
  enrichment: tsenta,
  competitors,
  investorSignal,
};

/** A couple of pre-run searches for the history view. */
export const MOCK_HISTORY: SearchRecord[] = [
  {
    id: "srch_a1b2c9f3",
    company_name: "Tsenta",
    result_json: tsenta,
    created_at: "2026-07-07T09:14:22Z",
  },
  {
    id: "srch_7d21e004",
    company_name: "Baseten",
    result_json: {
      name: "Baseten",
      domain: "baseten.co",
      description:
        "Deploys and scales ML models behind production APIs with autoscaling GPU inference.",
      stage: "series-c",
      foundedDate: "2019",
      founders: [{ name: "Tuhin Srivastava", role: "co-founder & CEO" }],
      funds: ["Y Combinator", "IVP", "Spark Capital"],
      tech: ["Python", "Rust", "Kubernetes"],
      markets: ["AI infrastructure", "model serving"],
      traction: null,
      sources: ["https://baseten.co"],
    },
    created_at: "2026-07-06T18:02:41Z",
  },
  {
    id: "srch_33f5aa10",
    company_name: "Modal",
    result_json: {
      name: "Modal",
      domain: "modal.com",
      description:
        "Runs code and ML workloads in the cloud with sub-second container starts and serverless GPUs.",
      stage: "series-a",
      foundedDate: "2021",
      founders: [{ name: "Erik Bernhardsson", role: "co-founder & CEO" }],
      funds: ["Amplify Partners", "Redpoint"],
      tech: ["Rust", "Kubernetes", "CUDA"],
      markets: ["AI infrastructure", "developer tools"],
      traction: null,
      sources: ["https://modal.com"],
    },
    created_at: "2026-07-05T11:47:08Z",
  },
];

/**
 * Curated reports keyed by lowercased name; unknown names fall back to a
 * relabeled Tsenta report so the results view is always demo-rich. MOCK only.
 */
const KNOWN: Record<string, CompanyReport> = {
  tsenta: TSENTA_REPORT,
};

export function getMockReport(name: string): CompanyReport {
  const key = name.trim().toLowerCase();
  const known = KNOWN[key];
  if (known) return known;
  // Relabel the demo report to whatever was typed, keeping the graph intact.
  return {
    ...TSENTA_REPORT,
    enrichment: { ...TSENTA_REPORT.enrichment, name: name.trim() || "Unknown" },
  };
}

/** Simulated enrichment latency (ms) — paced so the loading log reads on screen. */
export const MOCK_ENRICH_MS = ENRICH_STEPS.length * 480;

/** Resolves a mock report after a realistic delay. No network, no token spend. */
export function mockEnrich(name: string): Promise<CompanyReport> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMockReport(name)), MOCK_ENRICH_MS);
  });
}
