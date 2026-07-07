import * as React from "react";
import { cn } from "@/components/lib/utils";

/** Field label — small caps mono meta above the input (padzy forms). */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
