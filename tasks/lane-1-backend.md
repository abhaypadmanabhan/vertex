# Lane 1 — Backend spine (ButterBase)

Owns: ButterBase schema, auth, RLS, and `lib/db.ts`. Dirs: `backend/`, `lib/db.ts`.
App: `app_ukesbu2ssy8a` · API `https://api.butterbase.ai/v1/app_ukesbu2ssy8a`.

## Issues
- **#5** Define + apply schema via `mcp__butterbase__manage_schema`:
  - `searches` (id, user_id, company_name text, result_json jsonb, created_at timestamptz default now())
  - `saved_reports` (id, user_id, company_name text, created_at timestamptz default now())
  - `result_json` must hold the full `shared/enrichment-schema.ts` Enrichment object.
- **#6** RLS / user-isolation on BOTH tables (`mcp__butterbase__manage_app` action `secure` or
  `manage_rls`): each user reads/writes only their own rows (`user_id`).
- **#7** Email/password auth (`mcp__butterbase__manage_auth_config`). Enable signup + signin.
- Fill **`lib/db.ts`** stubs: `saveSearch`, `getHistory`, `saveReport` — real ButterBase REST
  calls using the end-user JWT. Keep signatures exactly as stubbed.

## Prove it (acceptance)
- `manage_schema` list shows both tables with correct columns.
- Insert a row as user A, confirm user B cannot read it (RLS holds) — show the check.
- A signup + signin round-trip returns a JWT.
- `npm run typecheck` clean for `lib/db.ts`.
- Write `backend/README.md`: table shapes, auth setup, curl examples.

Do not touch `shared/*`, `lib/graph.ts`, `lib/enrichment.ts`, `app/`, `components/`.
No token-spend without go-ahead. Superpowers skill on. Then STOP and report.
