import { cn } from "@/components/lib/utils";
import { Signature } from "@/components/brand/signature";

/**
 * Vertex wordmark. Placeholder lockup (display type + bracket mark) until the
 * final GPT-generated logo is returned — swap the <Signature/> for an <img> then.
 * `mark` shows the accent bracket for hero/brand contexts; nav keeps it ink.
 */
export function Wordmark({
  className,
  mark = true,
  size = "md",
}: {
  className?: string;
  mark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const type = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Signature
        className={cn(
          size === "lg" ? "h-6" : "h-4",
          mark ? "text-accent" : "text-ink",
        )}
      />
      <span
        className={cn(
          "font-display font-semibold tracking-[-0.02em] text-ink",
          type,
        )}
      >
        Vertex
      </span>
    </span>
  );
}
