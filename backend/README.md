# Backend spine (Lane 1) — ButterBase

App: `app_ukesbu2ssy8a` · API base: `https://api.butterbase.ai/v1/app_ukesbu2ssy8a`
Auth base: `https://api.butterbase.ai/auth/app_ukesbu2ssy8a`

## Tables

### `searches`
| column        | type        | notes                                   |
|---------------|-------------|------------------------------------------|
| id            | uuid        | PK, `gen_random_uuid()`                   |
| user_id       | uuid        | not null, auto-populated by RLS trigger   |
| company_name  | text        | not null                                  |
| result_json   | jsonb       | not null — full `Enrichment` object (see `shared/enrichment-schema.ts`) |
| created_at    | timestamptz | default `now()`                           |

Index: `searches_user_id_idx` on `user_id`.

### `saved_reports`
| column        | type        | notes                                   |
|---------------|-------------|------------------------------------------|
| id            | uuid        | PK, `gen_random_uuid()`                   |
| user_id       | uuid        | not null, auto-populated by RLS trigger   |
| company_name  | text        | not null                                  |
| created_at    | timestamptz | default `now()`                           |

Index: `saved_reports_user_id_idx` on `user_id`.

## RLS (user isolation)

Both tables have `create_user_isolation` applied on `user_id`:
- `butterbase_user` role: can only `SELECT`/`INSERT`/`UPDATE`/`DELETE` rows where `user_id = current_user_id()`.
- `user_id` auto-populates on INSERT via trigger — clients never send it.
- `butterbase_service` (platform API key) bypasses RLS automatically.

**Verified**: inserted a row as user A, confirmed user B's `GET /searches` (and `/saved_reports`) returns `[]`, and user A's own `GET` returns the row. See commit history / session log for the raw request/response pairs.

## Auth (email/password)

Email/password signup+signin is built into ButterBase — no explicit "enable" toggle needed. Verified live round-trip:

```bash
# Signup
curl -X POST https://api.butterbase.ai/auth/app_ukesbu2ssy8a/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyP@ssw0rd1","display_name":"Jane"}'
# -> 201 { user: { id, email, email_verified: false, display_name } }

# Login
curl -X POST https://api.butterbase.ai/auth/app_ukesbu2ssy8a/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyP@ssw0rd1"}'
# -> 200 { access_token, refresh_token, expires_in, token_type: "Bearer", user }
```

`access_token` is the end-user JWT — send as `Authorization: Bearer {access_token}` on every
`lib/db.ts` call so RLS scopes the request to that user.

Password rules: min 8 chars, upper + lower + number + special char.

## Data API examples

```bash
# Create a search (user_id auto-populated from JWT)
curl -X POST https://api.butterbase.ai/v1/app_ukesbu2ssy8a/searches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"company_name":"Acme Inc","result_json":{"name":"Acme Inc", "domain":null,"description":"","stage":null,"foundedDate":null,"founders":[],"funds":[],"tech":[],"markets":[],"traction":null,"sources":[]}}'

# List own search history, newest first
curl "https://api.butterbase.ai/v1/app_ukesbu2ssy8a/searches?order=created_at.desc" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Save a report
curl -X POST https://api.butterbase.ai/v1/app_ukesbu2ssy8a/saved_reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"company_name":"Acme Inc"}'
```

## `lib/db.ts`

`saveSearch(jwt, companyName, result)`, `getHistory(jwt)`, `saveReport(jwt, companyName)` wrap the
above three calls with the caller's JWT. No service key involved — RLS does the isolation.
