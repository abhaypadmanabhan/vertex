import { cn } from "@/components/lib/utils";
import { Kicker } from "@/components/ui/kicker";

/**
 * The core structural unit: a numbered kicker, a hairline, then content.
 * Padzy exposes labeled regions with hairlines instead of shadowed cards.
 * `active` shows the 2px leading accent tick (invariant #4).
 */
export function Section({
  index,
  label,
  meta,
  active = false,
  children,
  className,
}: {
  index?: number;
  label: string;
  meta?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative", className)}>
      {active && (
        <span
          aria-hidden
          className="absolute -left-4 top-1 h-4 w-0.5 bg-accent"
        />
      )}
      <div className="flex items-baseline justify-between gap-4">
        <Kicker index={index}>{label}</Kicker>
        {meta && (
          <span className="font-mono text-[11px] tabular-nums text-muted">
            {meta}
          </span>
        )}
      </div>
      <div className="mt-3 h-px w-full bg-line" />
      <div className="mt-5">{children}</div>
    </section>
  );
}
