import { cn } from "@/components/lib/utils";

/** 1px structural rule. `draw` animates the editorial scaleX entrance once. */
export function Hairline({
  className,
  draw = false,
  strong = false,
}: {
  className?: string;
  draw?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      role="separator"
      className={cn(
        "h-px w-full",
        strong ? "bg-line-strong" : "bg-line",
        draw && "animate-hairline-in origin-left",
        className,
      )}
    />
  );
}
