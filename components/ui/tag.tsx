import { cn } from "@/components/lib/utils";

/**
 * Dense caps chip for edge values (funds / tech / markets).
 * `active` marks a shared/overlapping value — the one place accent appears in a list.
 */
export function Tag({
  children,
  active = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] tracking-[0.04em]",
        active
          ? "border-accent/40 text-accent"
          : "border-line-strong text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
