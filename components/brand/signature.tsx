import { cn } from "@/components/lib/utils";

/**
 * Vertex signature mark — an editorial corner bracket (a "frame/handle", padzy
 * bracket motif). Deliberately NOT a graph node or geometric apex: the product
 * IS a graph, so a node logo would be the cliché. Placeholder until the final
 * logo image is dropped in. Inherits `currentColor`.
 */
export function Signature({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 16"
      fill="none"
      aria-hidden
      className={cn("h-4 w-auto", className)}
    >
      <path
        d="M13 1H1v14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <path d="M5.5 8.5h7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
