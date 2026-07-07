import * as React from "react";
import { cn } from "@/components/lib/utils";

/**
 * Padzy input. Hairline box, sharp corners. Pointer focus: border→accent (no glow).
 * Keyboard focus falls back to the global :focus-visible accent outline.
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-9 w-full rounded border border-line-strong bg-transparent px-3 text-sm text-ink",
      "placeholder:text-muted/70 transition-colors duration-[120ms]",
      "hover:border-ink/30 focus:border-accent focus:outline-none focus-visible:outline-2",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
