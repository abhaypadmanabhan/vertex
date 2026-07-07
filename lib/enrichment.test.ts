import { test } from "node:test";
import assert from "node:assert/strict";
import { enrichCompany } from "./enrichment";

const VALID_RAW = {
  name: "Stripe",
  domain: "stripe.com",
  description: "Payments infrastructure for the internet.",
  stage: "series-h",
  foundedDate: "2010",
  founders: [{ name: "Patrick Collison", role: "CEO" }],
  funds: ["Sequoia"],
  tech: ["Ruby"],
  markets: ["Fintech"],
  traction: "Processes billions in payments annually.",
  sources: ["https://stripe.com/about"],
};

function withMockFetch<T>(impl: typeof fetch, fn: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return fn().finally(() => {
    globalThis.fetch = original;
  });
}

test("enrichCompany posts {name} to the deployed enrich fn and returns a validated Enrichment", async () => {
  let capturedUrl = "";
  let capturedBody = "";
  await withMockFetch(
    (async (url: string, init: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = String(init.body);
      return new Response(JSON.stringify(VALID_RAW), { status: 200 });
    }) as typeof fetch,
    async () => {
      const result = await enrichCompany("Stripe");
      assert.equal(result.name, "Stripe");
      assert.equal(result.domain, "stripe.com");
      assert.deepEqual(result.funds, ["Sequoia"]);
    }
  );
  assert.match(capturedUrl, /\/fn\/enrich$/);
  assert.deepEqual(JSON.parse(capturedBody), { name: "Stripe" });
});

test("enrichCompany throws when the deployed fn responds non-2xx", async () => {
  await withMockFetch(
    (async () => new Response("boom", { status: 500 })) as typeof fetch,
    async () => {
      await assert.rejects(() => enrichCompany("Stripe"));
    }
  );
});

test("enrichCompany throws when the fn's JSON fails schema validation", async () => {
  await withMockFetch(
    (async () => new Response(JSON.stringify({ domain: "stripe.com" }), { status: 200 })) as typeof fetch,
    async () => {
      // missing required "name" field
      await assert.rejects(() => enrichCompany("Stripe"));
    }
  );
});
