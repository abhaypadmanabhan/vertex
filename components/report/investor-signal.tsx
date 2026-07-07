import type { InvestorSignal } from "@lib/types";
import { Tag } from "@/components/ui/tag";

/** Investor-cluster signal (#17): peers funded by the target's lead investor. */
export function InvestorSignalView({ signal }: { signal: InvestorSignal | null }) {
  if (!signal || signal.coFunded.length === 0) {
    return (
      <div className="py-1">
        <div className="kicker">No cluster</div>
        <p className="mt-2 max-w-[48ch] text-[14px] text-muted">
          The lead investor has no other portfolio companies in the graph yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="max-w-[60ch] text-[14px] leading-relaxed text-muted">
        Also backed by{" "}
        <span className="font-mono text-accent">{signal.fund}</span>, the lead
        investor —{" "}
        <span className="font-mono tabular-nums text-ink">
          {signal.coFunded.length}
        </span>{" "}
        portfolio peers in the graph:
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {signal.coFunded.map((c) => (
          <Tag key={c}>{c}</Tag>
        ))}
      </div>
    </div>
  );
}
