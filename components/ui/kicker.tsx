import { cn } from "@/components/lib/utils";
import { pad2 } from "@/components/lib/format";

/**
 * Numbered editorial kicker (padzy invariant #2): `01 / OVERVIEW`.
 * `index` is only passed where the sections form a real, ordered sequence.
 */
export function Kicker({
  index,
  children,
  className,
}: {
  index?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("kicker inline-flex items-center gap-2", className)}>
      {typeof index === "number" && (
        <>
          <span className="text-accent">{pad2(index)}</span>
          <span aria-hidden className="text-muted/50">
            /
          </span>
        </>
      )}
      <span>{children}</span>
    </span>
  );
}
