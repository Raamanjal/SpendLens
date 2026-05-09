## Day 1 - 2026-05-06
**Hours worked:** 0

**Reason**
I was Busy at the Farewell of My College Seniors

## Day 2 - 2026-05-07
**Hours worked:** 0

**Reason**
I was Busy at the Farewell of My College Seniors

## Day 3 - 2026-05-08

**Hours worked:** 7

**What I did:**
Scaffolded the Next.js project with TypeScript and Tailwind.
Defined all shared types in src/types/index.ts as a single
source of truth before writing any logic. Wrote out all 8
tools with their full plan definitions in pricingData.ts,
cross-referencing each vendor's official pricing page.
Configured Jest with ts-jest to isolate test types, and eslint-plugin-jest to eliminate all VS Code problems. Wrote 7 smoke tests covering pricing
data shape and path alias resolution — all passing.

**What I learned:**
TypeScript needs a separate tsconfig for Jest because
Next.js uses "moduleResolution: bundler" which ts-jest
doesn't support — switching to "commonjs" for tests fixed
all the "Cannot find name describe" errors. Also noticed
Claude Team has a 5-seat minimum and annual vs monthly
billing difference — that will be an important audit rule.

**Blockers / what I'm stuck on:**
Deciding between flat rule functions vs per-tool switch
statements in the audit engine. Leaning toward individual
rule functions so each is independently testable.

**Plan for tomorrow:**
Build the full audit engine in src/lib/auditEngine.ts
with at least 8 rule checks covering all major tools.
Write 6+ Jest tests covering edge cases. No UI yet.



## Day 4 — 2026-05-09

**Hours worked:** 5

**What I did:**
Built the full audit engine in src/lib/auditEngine.ts as
pure functions with zero side effects. Created three price
helper functions — getPrice(), getMinSeats(), and
getAnnualPrice() — that read every number directly from
pricingData.ts so no prices are hardcoded anywhere in the
logic. Wrote a router function (auditSingleTool) that
dispatches each tool to its own dedicated rule function.
Wrote 7 rule functions covering all 8 tools with 20+
distinct rules. Wrote 30 Jest tests across 8 describe
blocks covering core behaviour, each tool individually,
and edge cases. All 30 pass.

**What I learned:**
Keeping the audit engine as pure functions makes it
trivially testable — no mocks, no DB, no API needed, just
input in and output out. The makeResult() helper was the
most important abstraction — it centralises label
resolution from pricingData and guarantees potentialSaving
never goes negative via Math.max(0, saving), which would
have been a silent UI bug otherwise. Also learned that
Claude Team Standard has two billing rates — $25/seat on
monthly and $20/seat on annual — stored as separate fields
in pricingData (monthly and annualMonthly), which the
billing optimisation rule uses to detect overpay.

**Blockers / what I'm stuck on:**
Caught a bug mid-way where auditCursor was referencing
TOOLS.claude.plans.pro.monthly instead of
TOOLS.cursor.plans.pro.monthly — both happen to be $20
so the tests still passed, but the reference was logically
wrong. Fixed by routing all price reads through the
getPrice() helper which makes wrong-tool references
immediately obvious. Also found that auditCursor was
using the useCase parameter without declaring it — added
it to the function signature and updated the router to
pass it through.

**Plan for tomorrow:**
Build the spend input form UI — SpendForm.tsx and
ToolRow.tsx components. Wire up the useFormPersist hook
for localStorage persistence so form state survives page
reloads. No API calls yet — just the form rendering
correctly with all 8 tools, their plans populating
dynamically, and validation before submission.

