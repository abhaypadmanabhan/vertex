import type { Config } from "tailwindcss";

/**
 * Vertex theme (padzy-os, cool-dark "intelligence terminal").
 * Colors are RGB channel triplets in CSS vars (see app/globals.css) so Tailwind
 * opacity modifiers work: `bg-accent/10`, `text-ink/60`, etc.
 * One accent (signal amber) — reserved for active / progress / the single CTA.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "rgb(var(--ground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        // Hairline structure (padzy exposes 1px rules instead of shadowed cards).
        line: "rgb(var(--ink) / 0.10)",
        "line-strong": "rgb(var(--ink) / 0.16)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
      },
      letterSpacing: {
        kicker: "0.14em",
        display: "-0.02em",
      },
      keyframes: {
        // Signature motions (motion.md) — transform/opacity only.
        "hairline-in": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "type-settle": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "node-pop": {
          from: { transform: "scale(0.6)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "accent-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "hairline-in": "hairline-in 200ms cubic-bezier(0.2,0,0,1) both",
        "type-settle": "type-settle 320ms cubic-bezier(0.2,0,0,1) both",
        "node-pop": "node-pop 120ms cubic-bezier(0.2,0,0,1) both",
        "accent-pulse": "accent-pulse 1.4s cubic-bezier(0.2,0,0,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
