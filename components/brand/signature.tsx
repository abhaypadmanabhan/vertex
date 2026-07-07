import { cn } from "@/components/lib/utils";

/**
 * Vertex mark — two interlocking right-angle brackets forming an offset frame
 * (an "aperture" that reads as focus/framing, not a graph node). Reproduced as
 * vector from the returned logo so it stays crisp and inherits `currentColor`.
 */
export function Signature({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={cn("h-4 w-auto", className)}
    >
      {/* Upper-left bracket. */}
      <path
        d="M26 70V26H70"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="square"
      />
      {/* Lower-right bracket, offset to interlock. */}
      <path
        d="M74 30V74H30"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="square"
      />
    </svg>
  );
}
