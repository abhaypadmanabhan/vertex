# Vertex — Tasks

## Phase 1 — DONE ✅ (5-lane parallel build merged to main)
Neo4j seeded + competitor/investor traversal live · enrich fn (EXA→Kimi K2.5 instant) live ·
frontend built + deployed to https://vertex.butterbase.dev · GitHub pushed · submitted to
HackwithBay 3.0. Issues #1–17, #20, #22, #24, #25 closed. RocketRide pipe (#9/#10/#11)
superseded by EXA+Kimi BYOK.

## Phase 2 — Live wiring (issues #26–31, label `phase-2-live`)
Deployed UI runs on MOCK data; wire it to live enrichment + graph.
- [ ] #26 Server `report` fn: enrich→upsert→competitors→investor via **Neo4j Aura HTTP Query API**
      (sandbox has no npm driver). NEEDS Neo4j creds as fn secrets — ask user.
- [ ] #27 App CORS: allow https://vertex.butterbase.dev + localhost.
- [ ] #28 Wire `search-experience.tsx` (mockEnrich → fetch `/fn/report`); remove mock.
- [ ] #29 Optimize Kimi + EXA (<8s; fund NAMES not amounts; tighter prompt; surgical search).
- [ ] #30 Rebuild static export + redeploy to butterbase.dev; verify live browser search.
- [ ] #31 Resubmit hackathon entry (version bump).

## Still open (pre-P2)
- [ ] #18 auth screens wiring · #19 per-user history wiring · #21 E2E · #23 Daytona bonus.

## Live resources
- ButterBase app `app_ukesbu2ssy8a` · api `https://api.butterbase.ai/v1/app_ukesbu2ssy8a`
- Deployed: https://vertex.butterbase.dev · Repo: https://github.com/abhaypadmanabhan/vertex
- enrich fn: `.../fn/enrich` (secrets KIMI_API_KEY, EXA_API_KEY set)
- Contracts LOCKED: `shared/enrichment-schema.ts`, `shared/normalizer.ts`. Bible: `AGENTS.md`.
