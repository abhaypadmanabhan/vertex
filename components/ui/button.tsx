import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/lib/utils";

/**
 * Padzy button. One accent CTA per view (primary). Sharp corners, no shadow.
 * Amber accent is light, so the primary label sits in `ground` for contrast.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium " +
    "transition-[opacity,transform,border-color,color] duration-[120ms] ease-out " +
    "focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] " +
    "select-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-ground hover:opacity-90",
        secondary:
          "border border-line-strong text-ink hover:border-ink/45 bg-transparent",
        ghost: "text-muted hover:text-ink bg-transparent",
      },
      size: {
        sm: "h-7 px-3 text-[13px]",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
