/**
 * Seeds ~5 well-known companies with deliberately overlapping investors/
 * tech/markets so an obscure target actually connects to something. Some
 * raw values below use alias variants on purpose (YC, a16z, Sequoia Capital,
 * Postgres, GV, DevTools, K8s) to prove the normalizer's alias collapse is
 * doing real work, not just lowercasing.
 *
 * Runs through the SAME upsertCompany() path as live enrichment — no
 * separate seed-only write logic. Safe to re-run (MERGE-based, idempotent).
 */
import { type Enrichment } from "@shared/enrichment-schema";
import { upsertCompany } from "../lib/graph";
import { getSession, closeDriver } from "./driver";

export const SEED_COMPANIES: Enrichment[] = [
  {
    name: "Stripe",
    domain: "stripe.com",
    description: "Payments infrastructure for the internet.",
    stage: "series-h",
    foundedDate: "2010",
    founders: [
      { name: "Patrick Collison", role: "CEO" },
      { name: "John Collison", role: "President" },
    ],
    funds: ["Sequoia Capital", "YC"],
    tech: ["Ruby", "Postgres"],
    markets: ["Fintech", "DevTools"],
    traction: "Processes hundreds of billions in payment volume annually.",
    sources: ["https://stripe.com/about"],
  },
  {
    name: "Airbnb",
    domain: "airbnb.com",
    description: "Marketplace for short-term lodging and experiences.",
    stage: "public",
    foundedDate: "2008",
    founders: [{ name: "Brian Chesky", role: "CEO" }],
    funds: ["Y Combinator", "Sequoia"],
    tech: ["React", "PostgreSQL"],
    markets: ["Travel", "Marketplace"],
    traction: "Millions of active listings worldwide.",
    sources: ["https://news.airbnb.com/about-us/"],
  },
  {
    name: "Plaid",
    domain: "plaid.com",
    description: "API infrastructure connecting apps to users' bank accounts.",
    stage: "series-d",
    foundedDate: "2013",
    founders: [{ name: "Zach Perret", role: "CEO" }],
    funds: ["YC", "a16z"],
    tech: ["Python", "pg"],
    markets: ["Fintech", "Dev Tools"],
    traction: "Connects to thousands of financial institutions.",
    sources: ["https://plaid.com/about/"],
  },
  {
    name: "Coinbase",
    domain: "coinbase.com",
    description: "Platform for buying, selling, and storing crypto assets.",
    stage: "public",
    foundedDate: "2012",
    founders: [{ name: "Brian Armstrong", role: "CEO" }],
    funds: ["Andreessen Horowitz", "Y Combinator"],
    tech: ["Ruby", "K8s"],
    markets: ["Fintech", "Crypto"],
    traction: "Tens of millions of verified users.",
    sources: ["https://www.coinbase.com/about"],
  },
  {
    name: "Vercel",
    domain: "vercel.com",
    description: "Frontend cloud for building and deploying web apps.",
    stage: "series-d",
    foundedDate: "2015",
    founders: [{ name: "Guillermo Rauch", role: "CEO" }],
    funds: ["a16z", "GV"],
    tech: ["Node", "React"],
    markets: ["Dev Tools", "Cloud"],
    traction: "Hosts millions of production frontend deployments.",
    sources: ["https://vercel.com/about"],
  },
];

async function countsByLabel(): Promise<Record<string, number>> {
  const session = getSession();
  try {
    const result = await session.run(
      "MATCH (n) UNWIND labels(n) AS label RETURN label, count(*) AS count ORDER BY label"
    );
    const counts: Record<string, number> = {};
    for (const record of result.records) {
      const raw = record.get("count");
      counts[record.get("label") as string] = typeof raw === "number" ? raw : raw.toNumber();
    }
    return counts;
  } finally {
    await session.close();
  }
}

async function main(): Promise<void> {
  for (const company of SEED_COMPANIES) {
    await upsertCompany(company);
  }
  const counts = await countsByLabel();
  console.log("Node counts by label:", counts);
  await closeDriver();
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
