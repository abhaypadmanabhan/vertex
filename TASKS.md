# Vertex — Tasks

## Phase 1 — DONE ✅ (5-lane parallel build merged to main)
Neo4j seeded + competitor/investor traversal live · enrich fn (EXA→Kimi K2.5 instant) live ·
frontend built + deployed to https://vertex.butterbase.dev · GitHub pushed · submitted to
HackwithBay 3.0. Issues #1–17, #20, #22, #24, #25 closed. RocketRide pipe (#9/#10/#11)
superseded by EXA+Kimi BYOK.

## Phase 2 — Live wiring (issues #26–31, label `phase-2-live`) — DONE ✅
Deployed UI now runs on LIVE enrichment + graph (mock removed).
- [x] #26 `report` fn: EXA→Kimi enrich (inlined) → upsert + competitors + investor via
      **Neo4j Aura HTTP Query API** (sandbox has no npm driver). Self-contained; sibling
      fn-to-fn calls aren't routable from the sandbox, so enrichment is inlined.
- [x] #27 App CORS: allows https://vertex.butterbase.dev + http://localhost:3000.
- [x] #28 `search-experience.tsx` fetches `/fn/report` (abortable, run-id guard, error state);
      `lib/report.ts` browser client; mock enrichment path removed.
- [x] #29 funds=NAMES, 4 results, 800-char excerpts; dropped livecrawl (14.4s→8.7s).
- [x] #30 Rebuilt static export + redeployed to butterbase.dev. Verified live from deployed origin.
- [~] #31 Resubmit NOT needed — same URL serves the live build, app_id already attached (scored live).
- Security fix: `report` 502s no longer leak upstream error detail (logged server-side only).
      Accepted demo trade-offs: `report` is public (`auth:none`, no rate-limit) + web content is
      trusted into the graph — inherent to a static frontend; mitigate post-demo.

## Still open (pre-P2)
- [ ] #18 auth screens wiring · #19 per-user history wiring · #21 E2E · #23 Daytona bonus.

## Live resources
- ButterBase app `app_ukesbu2ssy8a` · api `https://api.butterbase.ai/v1/app_ukesbu2ssy8a`
- Deployed: https://vertex.butterbase.dev · Repo: https://github.com/abhaypadmanabhan/vertex
- enrich fn: `.../fn/enrich` (secrets KIMI_API_KEY, EXA_API_KEY set)
- Contracts LOCKED: `shared/enrichment-schema.ts`, `shared/normalizer.ts`. Bible: `AGENTS.md`.
