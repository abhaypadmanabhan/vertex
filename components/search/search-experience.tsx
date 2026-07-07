"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CompanyReport } from "@lib/types";
import { mockEnrich } from "@/components/mock-data";
import { SearchPanel } from "@/components/search/search-panel";
import { LoadingState } from "@/components/search/loading-state";
import { ResultsView } from "@/components/report/results-view";

type Phase = "idle" | "loading" | "results";

/**
 * Search → loading → results state machine (#16). Uses MOCK enrichment so it
 * never blocks on other lanes; Lane 5 swaps `mockEnrich` for `enrichCompany`
 * + `getCompetitors` + `getInvestorSignal`. Supports deep-linking via `?q=`.
 */
export function SearchExperience() {
  const params = useSearchParams();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<CompanyReport | null>(null);
  const runIdRef = useRef(0);
  const autoRef = useRef<string | null>(null);

  const run = useCallback((name: string) => {
    const id = ++runIdRef.current;
    setQuery(name);
    setReport(null);
    setPhase("loading");
    mockEnrich(name).then((r) => {
      if (runIdRef.current === id) {
        setReport(r);
        setPhase("results");
      }
    });
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++;
    setReport(null);
    setQuery("");
    setPhase("idle");
  }, []);

  // Deep-link: `/?q=Name` (e.g. from history) auto-runs once, then cleans the URL.
  useEffect(() => {
    const q = params.get("q");
    if (q && autoRef.current !== q) {
      autoRef.current = q;
      run(q);
      router.replace("/", { scroll: false });
    }
  }, [params, run, router]);

  if (phase === "loading") return <LoadingState query={query} />;
  if (phase === "results" && report)
    return <ResultsView report={report} onReset={reset} />;
  return <SearchPanel onSearch={run} />;
}
