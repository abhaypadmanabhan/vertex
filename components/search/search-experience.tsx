"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, ArrowLeft } from "lucide-react";
import type { CompanyReport } from "@lib/types";
import { fetchCompanyReport } from "@lib/report";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { SearchPanel } from "@/components/search/search-panel";
import { LoadingState } from "@/components/search/loading-state";
import { ResultsView } from "@/components/report/results-view";

type Phase = "idle" | "loading" | "results" | "error";

/**
 * Search → loading → results state machine (#16, #28). Calls the live `report`
 * function (enrich → graph → competitors, server-side) via fetchCompanyReport.
 * A run-id guard drops superseded results, an AbortController cancels the stale
 * in-flight request, and failures surface a retryable error state. Deep-links
 * via `?q=`.
 */
export function SearchExperience() {
  const params = useSearchParams();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const autoRef = useRef<string | null>(null);

  const run = useCallback((name: string) => {
    const id = ++runIdRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setQuery(name);
    setReport(null);
    setError(null);
    setPhase("loading");

    fetchCompanyReport(name, controller.signal)
      .then((r) => {
        if (runIdRef.current !== id) return;
        setReport(r);
        setPhase("results");
      })
      .catch((err) => {
        if (runIdRef.current !== id) return; // superseded
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("error");
      });
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++;
    abortRef.current?.abort();
    setReport(null);
    setError(null);
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
  if (phase === "error")
    return (
      <ErrorState query={query} message={error} onRetry={() => run(query)} onReset={reset} />
    );
  return <SearchPanel onSearch={run} />;
}

/** Retryable failure state — keeps the same editorial register as the rest of the app. */
function ErrorState({
  query,
  message,
  onRetry,
  onReset,
}: {
  query: string;
  message: string | null;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="max-w-[680px]">
      <Kicker>Enrichment failed</Kicker>
      <h2 className="mt-5 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.01em]">
        {query}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        {message ?? "Something went wrong while enriching this company."}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button onClick={onRetry} size="lg">
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
          Try again
        </Button>
        <Button onClick={onReset} variant="ghost" size="lg">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          New search
        </Button>
      </div>
    </div>
  );
}
