import type { Competitor } from "@lib/types";
import { cn } from "@/components/lib/utils";
import { pad2 } from "@/components/lib/format";
import { Tag } from "@/components/ui/tag";

function SharedTags({ label, items, active }: { label: string; items: string[]; active?: boolean }) {
  if (items.length === 0) return null;
  return (
    <>
      {items.map((t) => (
        <Tag key={`${label}-${t}`} active={active}>
          {t}
        </Tag>
      ))}
    </>
  );
}

/**
 * Ranked competitor list (#17). Each row shows the STRUCTURAL "why" — the shared
 * investors / tech / markets that surfaced it — not an LLM guess. Ordered by
 * shared-edge count; the overlap bar reads relative to the strongest match.
 */
export function CompetitorList({ items }: { items: Competitor[] }) {
  if (items.length === 0) {
    return (
      <div className="py-2">
        <div className="kicker">No competitors yet</div>
        <p className="mt-2 max-w-[48ch] text-[14px] text-muted">
          Nothing in the graph shares an investor, tech, or market with this
          company yet. As more companies are enriched, peers appear here.
        </p>
      </div>
    );
  }

  const max = Math.max(...items.map((c) => c.sharedEdges), 1);

  return (
    <ul>
      {items.map((c, i) => (
        <li
          key={c.name}
          className="relative border-t border-line py-4 first:border-t-0"
        >
          {i === 0 && (
            <span aria-hidden className="absolute -left-4 top-4 h-5 w-0.5 bg-accent" />
          )}
          <div className="flex items-start justify-between gap-6">
            <div className="flex min-w-0 gap-4">
              <span className="mt-0.5 w-6 shrink-0 font-mono text-[13px] tabular-nums text-muted">
                {pad2(i + 1)}
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-ink">{c.name}</div>
                <div className="mt-1 font-mono text-[12px] text-muted">
                  {c.reason}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <SharedTags label="fund" items={c.sharedFunds} active />
                  <SharedTags label="tech" items={c.sharedTech} />
                  <SharedTags label="market" items={c.sharedMarkets} />
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="kicker">Shared</div>
              <div className="mt-1 font-mono text-[20px] leading-none tabular-nums text-ink">
                {c.sharedEdges}
              </div>
              <div className="mt-2 ml-auto h-1 w-16 overflow-hidden rounded-full bg-surface">
                <div
                  className={cn("h-full rounded-full", i === 0 ? "bg-accent" : "bg-ink/35")}
                  style={{ width: `${(c.sharedEdges / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
