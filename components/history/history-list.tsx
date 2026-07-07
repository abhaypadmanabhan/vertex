import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SearchRecord } from "@lib/types";
import { formatDateData } from "@/components/lib/format";
import { Button } from "@/components/ui/button";

/** Per-user search history (#19). Rows re-run the search via `/?q=`. */
export function HistoryList({ records }: { records: SearchRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="max-w-[52ch] py-4">
        <div className="kicker">No searches yet</div>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Companies you enrich are saved here, newest first, scoped to your
          account.
        </p>
        <Link href="/" className="mt-5 inline-block">
          <Button size="sm">Run a search</Button>
        </Link>
      </div>
    );
  }

  return (
    <ul>
      {records.map((r) => (
        <li key={r.id}>
          <Link
            href={`/?q=${encodeURIComponent(r.company_name)}`}
            className="group relative flex items-center gap-4 border-t border-line py-4 first:border-t-0 sm:gap-6"
          >
            <span
              aria-hidden
              className="absolute -left-4 top-4 h-5 w-0.5 bg-accent opacity-0 transition-opacity group-hover:opacity-100"
            />
            <time className="w-24 shrink-0 font-mono text-[12px] tabular-nums text-muted">
              {formatDateData(r.created_at)}
            </time>
            <span className="min-w-0 flex-1 truncate text-[15px] text-ink">
              {r.company_name}
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-muted sm:inline">
              {r.result_json.stage ?? "—"}
            </span>
            <span className="hidden max-w-[40%] truncate font-mono text-[12px] text-muted md:inline">
              {r.result_json.markets.slice(0, 2).join(" · ")}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent"
              strokeWidth={1.5}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
