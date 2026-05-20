# Supabase migrations (manual)

SpendLens migrations are applied by hand in the Supabase SQL Editor because this repo is not linked to the Supabase CLI.

## Round 2 - pricing snapshot and audit email

1. Open Supabase and select the SpendLens project.
2. Open SQL Editor, then create a new query.
3. Paste and run `migrations/001_add_pricing_snapshot.sql`.
4. In Table Editor, confirm the `audits` table has:
   - `pricing_snapshot` with type `jsonb`, nullable
   - `user_email` with type `text`, nullable

Existing audit rows stay null until re-run. New audits get an email and pricing snapshot from the API.
