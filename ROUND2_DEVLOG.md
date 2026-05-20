# Round 2 Devlog — SpendLens

Credex Round 2 — Web Development Intern Assignment. Real-time engineering log of my 36 hours. Honest > polished.

---

## 2026-05-20 10:00 — Start
**What I did:**
- Received Round 2 intern assignment brief.
- Spent 30 minutes reading the requirements carefully: persistent audits, change detection engine, consolidated emails via Resend, and side-by-side re-audit diff page.
- Checked the original repo rules: same tech stack, no new libraries beyond Resend, and strict conventional commits.

---

## 2026-05-20 10:30 — Architecture Inspection
**What I did:**
- Explored the Round 1 project layout and files.
- Skimmed `/src/app/api/audit`, `/src/app/api/lead`, and `src/lib/supabase.ts`.
- Noticed that while Round 1 saved audit results, it did not capture user emails directly on the audit row, nor did it freeze the pricing catalog at audit time.

---

## 2026-05-20 11:30 — Database Schema & Migration Design
**What I did:**
- Designed DB schema changes to support change-detection logic.
- Decided to add `user_email (text)` and `pricing_snapshot (jsonb)` to the `audits` table.
- Created SQL migration [001_add_pricing_snapshot.sql](file:///e:/SpendLens/spendlens/supabase/migrations/001_add_pricing_snapshot.sql) inside `supabase/migrations/` and documented schema types in `src/types/index.ts`.

---

## 2026-05-20 13:00 — Lunch Break
**What I did:**
- Stepped away to rest and grab lunch.

---

## 2026-05-20 14:00 — Persistent Storage Integration
**What I did:**
- Modified `src/components/SpendForm.tsx` to collect user email directly on initial submission.
- Updated `src/app/api/audit/route.ts` to require email and freeze the current pricing table into a JSON pricing snapshot when storing the audit.

---

## 2026-05-20 16:00 — Core Comparison Logic implementation
**What I did:**
- Created [src/lib/pricingSnapshot.ts](file:///e:/SpendLens/spendlens/src/lib/pricingSnapshot.ts).
- Coded `buildPricingSnapshot()` to freeze the catalog.
- Wrote `findPricingChangesForInput()` to scan only the tool plans in a stored audit, ignoring unused plan updates.
- Coded the `buildReauditDiff()` function to generate before-and-after savings.

---

## 2026-05-20 17:30 — Tea Break
**What I did:**
- Took a quick break to walk around and stretch.

---

## 2026-05-20 18:00 — Change Detection Endpoint & Resend
**What I did:**
- Created `/api/detect-changes` endpoint to fetch historical audits, run comparisons, and group changes by user email to avoid spamming.
- Integrated **Resend** inside `src/lib/resend.ts` with a premium HTML email template showing consolidated re-audit changes.

---

## 2026-05-20 19:30 — Dinner Break
**What I did:**
- Stepped away for dinner and relaxed.

---

## 2026-05-20 20:30 — Re-audit Side-by-Side Diff Page UI
**What I did:**
- Implemented `/audit/[id]/reaudit/page.tsx` and the `ReauditDiff.tsx` component.
- Added highlights for recommendations that changed, faded/muted unchanged tools, and displayed the monthly delta delta headline.

---

## 2026-05-20 22:30 — Testing & Debugging
**What I did:**
- Created `__tests__/pricingSnapshot.test.ts` to write focused unit tests verifying snapshot comparisons and diff generation.
- Ran `npm test` and ensured all tests passed successfully.

---

## 2026-05-21 00:00 — Production Build & Final Polish
**What I did:**
- Addressed a Next.js social open graph warning in `src/app/layout.tsx` by setting the `metadataBase` property.
- Ran `npm run build` and verified the production bundle compiled successfully with zero errors.
- Cleaned up the folder and reviewed devlog entries for final submission.
