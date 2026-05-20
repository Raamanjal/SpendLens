# What this PR does

Adds the Round 2 re-audit flow to SpendLens. Each audit now stores the user's email, original stack input, original audit result, and the pricing snapshot used at the time. A new pricing-change detector can re-run stored audits against the current pricing table, email affected users, and send them to a before/after diff page.

The feature keeps the Round 1 audit experience intact while making completed audits live when pricing changes.

## Why

Round 1 only answered "is my stack overpriced right now?" Round 2 answers "did that answer change after vendors changed prices?" That matters because AI tool pricing is moving quickly, and a stale audit can become actively misleading.

The main assumption I made: the email should be captured with the audit itself so the re-audit job does not depend on a later lead-capture step.

## How it works

- `/api/audit` now validates email and stores it with `input`, `result`, `summary`, and `pricing_snapshot`.
- `src/lib/pricingSnapshot.ts` freezes the current pricing table and compares a stored snapshot to current pricing for only the plans used in an audit.
- `/api/detect-changes` loads stored audits, re-runs the audit engine, groups affected audits by email, and sends one consolidated Resend email per user.
- `/audit/[id]/reaudit` loads the stored audit, re-runs it with current pricing, and shows old vs new recommendations side by side.

## What I cut

- I did not build unsubscribe links because the core email/diff flow mattered more in the 36-hour window.
- I did not build the public weekly market-change page because it is listed as bonus.
- I did not build an admin dashboard because the manual `/api/detect-changes` endpoint is enough for the required scheduled/manual trigger.

## How to test it manually

1. Add these Supabase columns to `audits`: `user_email text`, `pricing_snapshot jsonb`.
2. Set `DETECT_CHANGES_SECRET` in the deployment environment.
3. Submit a new audit with an email address.
4. Confirm the audit row contains `input`, `result`, `user_email`, and `pricing_snapshot`.
5. Temporarily change one plan price in `src/lib/pricingData.ts`, for example Cursor Business.
6. Call `POST /api/detect-changes` with header `x-detect-secret`.
7. Check the inbox for the pricing-change email.
8. Click through to `/audit/[id]/reaudit` and verify the old vs new diff appears.

## What's tested

- Pricing snapshots include the current pricing table.
- Changes are detected only for plans used by the stored audit.
- Unused plan changes are ignored.
- Re-audit diff data is built from stored and current results.

## Open questions / risks

- The detector scans the latest 500 audits; pagination would be needed after launch.
- Email deliverability depends on the configured Resend sender/domain.
- The current detector is manual/endpoint driven; a cron can call the same endpoint later.
