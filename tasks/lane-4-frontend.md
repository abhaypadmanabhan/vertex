# Lane 4 — Frontend + Design/Branding (Claude Code + /padzy-os)

Owns: `app/`, `components/`, theme (`app/globals.css`, tailwind config), brand assets.
You are a Claude Code agent because `/padzy-os` is wired to you. Use it for ALL UI + branding.

## Ground rules
- Scaffold a Next.js (App Router) + TypeScript + Tailwind + shadcn app IN THIS REPO ROOT.
  APPEND to the existing `package.json` (next/react/tailwind/shadcn) — do NOT rewrite it. Keep the
  existing `tsconfig.json` paths (`@shared/*`, `@lib/*`).
- Code the UI against the LOCKED types in `lib/types.ts` (`CompanyReport`, `Competitor`,
  `InvestorSignal`, `SearchRecord`) and the stub functions in `lib/*` — they throw for now; use
  MOCK data so you never block on other lanes. Lane 5 swaps real data in at integration.
- Do NOT touch `shared/*`, `lib/db.ts`, `lib/graph.ts`, `lib/enrichment.ts`, `backend/`, `graph/`,
  `enrichment/`.

## Design / branding flow (#24 logo + design language)
1. Run `/padzy-os`. Derive a SaaS-grade brand direction for "Vertex" — **no nodes, no geometric
   graph clichés**; a clean, credible product-company logo + design language.
2. Produce **GPT Images 2.0-optimized prompts** for the logo/brand imagery and OUTPUT THEM TO THE USER.
   Then STOP and wait — the user generates images externally and pastes them back.
3. When the user returns images, wire them in and continue the UI. (#25 apply design system.)

## Issues (#16 #17 #18 #19)
- **#16** Search box → loading state → results view scaffold.
- **#17** Results: structured report card (from Enrichment) + ranked competitor list (each showing the
  "why": shares X investors, Y tech) + a simple node-link graph viz (do NOT over-invest).
- **#18** Auth screens: sign in / sign up (wire to ButterBase auth — Lane 1 provides the endpoints;
  use mock until merged).
- **#19** Per-user search history view.

## Prove it (acceptance)
- `npm run dev` renders: auth screens, search → loading → results with report card + ranked
  competitors (with reasons) + graph viz + history. Screenshot each with `/run` or browser tools.
- `npm run typecheck` clean.
- GPT Images 2.0 prompts delivered to the user; design applied once images returned.

Superpowers + frontend-design + shadcn MCP + /padzy-os on every UI step. Then STOP and report.
