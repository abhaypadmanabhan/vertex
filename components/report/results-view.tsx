"use client";

import { useState } from "react";
import { ArrowLeft, Bookmark, Check } from "lucide-react";
import type { CompanyReport } from "@lib/types";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { ReportCard } from "@/components/report/report-card";
import { CompetitorList } from "@/components/report/competitor-list";
import { InvestorSignalView } from "@/components/report/investor-signal";
import { GraphViz } from "@/components/report/graph-viz";

/** Full results view (#17): report card + ranked competitors + signal + graph. */
export function ResultsView({
  report,
  onReset,
}: {
  report: CompanyReport;
  onReset: () => void;
}) {
  const { enrichment: e } = report;
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-14 animate-type-settle">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Kicker>Report</Kicker>
          <h1 className="mt-4 font-display text-[clamp(34px,5vw,56px)] font-semibold leading-[1] tracking-[-0.02em]">
            {e.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-muted">
            {e.domain && (
              <a
                href={`https://${e.domain}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                {e.domain}
              </a>
            )}
            {e.stage && (
              <>
                <span aria-hidden>·</span>
                <span className="uppercase tracking-[0.1em]">{e.stage}</span>
              </>
            )}
            {e.foundedDate && (
              <>
                <span aria-hidden>·</span>
                <span>est {e.foundedDate}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSaved(true)}
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
                Save
              </>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={onReset}>
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            New search
          </Button>
        </div>
      </header>

      <Section index={1} label="Overview" active>
        <ReportCard e={e} />
      </Section>

      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[1.4fr_1fr]">
        <Section
          index={2}
          label="Competitors"
          meta={`${report.competitors.length} ranked`}
        >
          <CompetitorList items={report.competitors} />
        </Section>
        <Section index={3} label="Graph">
          <GraphViz report={report} />
        </Section>
      </div>

      <Section index={4} label="Investor signal">
        <InvestorSignalView signal={report.investorSignal} />
      </Section>
    </div>
  );
}
