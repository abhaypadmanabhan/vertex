import type { Enrichment } from "@lib/types";
import { Kicker } from "@/components/ui/kicker";
import { Tag } from "@/components/ui/tag";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0">
      <div className="kicker">{label}</div>
      <div className="mt-1.5 font-mono text-[15px] tabular-nums text-ink">
        {value}
      </div>
    </div>
  );
}

function TagRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <Kicker>{label}</Kicker>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </div>
  );
}

/** Structured report from the enrichment JSON (#17). */
export function ReportCard({ e }: { e: Enrichment }) {
  const dash = (v: string | null) => (v && v.length ? v : "—");
  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-[1fr_190px]">
      <div>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink/90">
          {e.description || "No description available."}
        </p>

        {e.traction && (
          <div className="mt-6">
            <Kicker>Traction</Kicker>
            <p className="mt-2 max-w-[56ch] text-[14px] leading-relaxed text-muted">
              {e.traction}
            </p>
          </div>
        )}

        {e.founders.length > 0 && (
          <div className="mt-6">
            <Kicker>Founders</Kicker>
            <ul className="mt-3">
              {e.founders.map((f) => (
                <li
                  key={f.name}
                  className="flex items-baseline justify-between gap-4 border-t border-line py-2.5"
                >
                  <span className="text-[14px] text-ink">{f.name}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                    {f.role || "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {e.funds.length > 0 && (
          <div className="mt-6">
            <Kicker>Investors</Kicker>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {e.funds.map((f, i) => (
                <Tag key={f} active={i === 0}>
                  {f}
                  {i === 0 && (
                    <span className="ml-1.5 text-[9px] uppercase tracking-[0.1em] text-accent/70">
                      lead
                    </span>
                  )}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <TagRow label="Tech" items={e.tech} />
        <TagRow label="Markets" items={e.markets} />

        {e.sources.length > 0 && (
          <div className="mt-6">
            <Kicker>Sources</Kicker>
            <ul className="mt-2 space-y-1">
              {e.sources.map((s) => (
                <li key={s}>
                  <a
                    href={s}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[12px] text-muted underline decoration-line-strong underline-offset-2 transition-colors hover:text-accent"
                  >
                    {s.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside>
        <Stat label="Founded" value={dash(e.foundedDate)} />
        <Stat label="Stage" value={dash(e.stage)} />
        <Stat
          label="Domain"
          value={
            e.domain ? (
              <a
                href={`https://${e.domain}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                {e.domain}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Stat label="Investors" value={e.funds.length} />
        <Stat label="Tech" value={e.tech.length} />
        <Stat label="Markets" value={e.markets.length} />
      </aside>
    </div>
  );
}
