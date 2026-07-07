"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check } from "lucide-react";
import type { CompanyReport } from "@lib/types";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { ReportCard } from "@/components/report/report-card";
import { CompetitorList } from "@/components/report/competitor-list";
import { InvestorSignalView } from "@/components/report/investor-signal";
import { GraphViz } from "@/components/report/graph-viz";
import { formatStamp, reportId } from "@/components/lib/format";

function Signal({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="border-t border-line px-4 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0 sm:first:pl-0">
      <div className="kicker">{label}</div>
      <div className="mt-1.5 truncate font-mono text-[17px] tabular-nums text-ink">
        {value}
      </div>
      {sub && <div className="mt-0.5 truncate font-mono text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

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
  const [stamp] = useState(() => formatStamp(new Date().toISOString()));

  // Derived signals — all computed from the locked schema, nothing fabricated.
  const top = report.competitors[0];
  const edgesMapped = report.competitors.reduce((s, c) => s + c.sharedEdges, 0);
  const lead = e.funds[0] ?? "—";
  const peers = report.investorSignal?.coFunded.length ?? 0;
  const id = reportId(e.name);

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

      {/* Derived signal strip — real counts from the graph traversal. */}
      <div className="grid grid-cols-2 border border-line sm:flex sm:border-0 sm:border-t">
        <Signal label="Competitors" value={report.competitors.length} />
        <Signal label="Edges mapped" value={edgesMapped} />
        <Signal
          label="Top match"
          value={top ? top.sharedEdges : "—"}
          sub={top?.name}
        />
        <Signal label="Lead investor" value={lead} />
        <Signal label="Co-funded peers" value={peers} />
      </div>

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

      {/* Report meta + export. */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <div className="flex flex-wrap gap-x-8 gap-y-1 font-mono text-[11px] text-muted">
          <span>
            <span className="text-muted/60">REPORT ID </span>
            {id}
          </span>
          <span>
            <span className="text-muted/60">GENERATED </span>
            {stamp}
          </span>
        </div>
        <Button size="sm" onClick={() => window.print()}>
          Export report
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
