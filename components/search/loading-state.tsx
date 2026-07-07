"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/lib/utils";
import { Kicker } from "@/components/ui/kicker";
import { ENRICH_STEPS, MOCK_ENRICH_MS } from "@/components/mock-data";

const STEP_MS = MOCK_ENRICH_MS / ENRICH_STEPS.length;

/**
 * Enrichment loading state (#16). An editorial live log, not a spinner:
 * each pipeline step advances through pending → active → done. No shimmer.
 */
export function LoadingState({ query }: { query: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, ENRICH_STEPS.length));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [query]);

  const pct = Math.round((Math.min(step, ENRICH_STEPS.length) / ENRICH_STEPS.length) * 100);

  return (
    <div className="max-w-[680px]">
      <Kicker>Enriching</Kicker>
      <h2 className="mt-5 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.01em]">
        {query}
      </h2>
      <p className="mt-3 text-[15px] text-muted">
        Reading public sources and traversing the shared graph.
      </p>

      {/* Progress pill — surface track, accent fill. */}
      <div className="mt-9 flex items-center gap-4">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-[400ms] ease-[cubic-bezier(0.2,0,0,1)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[12px] tabular-nums text-muted">
          {String(pct).padStart(3, " ")}%
        </span>
      </div>

      {/* Step log. */}
      <ol className="mt-8 space-y-0">
        {ENRICH_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={label}
              className="flex items-center gap-3 border-t border-line py-3 first:border-t-0"
            >
              <span
                aria-hidden
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  done && "bg-accent",
                  active && "bg-accent animate-accent-pulse",
                  !done && !active && "bg-line-strong",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[13px]",
                  done || active ? "text-ink" : "text-muted/60",
                )}
              >
                {label}
              </span>
              <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                {done ? "done" : active ? "running" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
