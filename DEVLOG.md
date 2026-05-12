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

## Day 5 — 2026-05-10

**Hours worked:** 13

**What I did:**
Built the complete form UI and results layer in one session.

For the form: wrote useFormPersist.ts — a generic hook that
reads from localStorage after mount using a hydrated boolean
flag to prevent SSR mismatch, then writes on every state
change. ToolRow.tsx — single form row with tool selector,
dynamic plan selector that populates from pricingData based
on the selected tool, monthly spend input with dollar prefix,
and seats counter. Plan selector resets automatically when
tool changes to prevent stale plan keys being submitted.
SpendForm.tsx — manages the full list of tool rows, filters
incomplete rows before submitting, handles add/remove/update,
and calls /api/audit. Honeypot hidden field added for bot
detection. page.tsx — landing page with hero section and a
single state toggle between form view and results view.

For the results and API layer: gemini.ts calls Gemini 1.5
Flash with a structured prompt that injects real audit
numbers using a financial advisor persona with explicit rules
against markdown output — this fixed early versions that
returned bullet points instead of a paragraph. Has a
deterministic fallback that runs if the API fails for any
reason so the audit never crashes. /api/audit receives form
data, runs the audit engine, calls Gemini, generates a UUID
with Node crypto, and returns JSON. In-memory rate limiter
keyed by IP with a 1-hour rolling window. /api/lead validates
email format and logs the capture — Supabase and Resend wired
on Day 5. AuditResults renders the hero savings number, AI
summary, per-tool breakdown cards, Credex CTA for savings
above $500, and a lead capture form that switches to a share
button on submission. ToolAuditCard maps each action type to
badge colour and card background using a plain string key
config object. LeadCapture and ShareButton completed.
layout.tsx updated with default OG metadata and Geist font.
Did a full UI redesign after the initial layout looked rough —
replaced it with a cleaner green-on-white design with proper
card hierarchy and spacing.

Fixed 19 ESLint errors by adding browser and Node globals to
the flat ESLint config and replacing all React.X namespace
references with direct named imports. Also spent time
debugging Turbopack parse failures caused by Unicode
characters in JSX text — arrow symbols and HTML entities like
&apos; caused build errors that only appeared at runtime. Fix
was to wrap special characters in JSX expression syntax or
remove them. Fixed a missing useState declaration in
AuditResults that TypeScript surfaced as Cannot find name
leadCaptured — the use client directive must be the absolute
first line with no comments above it.

**What I learned:**
The hydration pattern with a boolean flag is the correct way
to use localStorage in Next.js App Router — without it the
server renders with the initial value and the client
immediately re-renders causing a hydration mismatch crash.
Turbopack in Next.js 16 is stricter about Unicode characters
in JSX than the Webpack bundler was — plain text or JS string
expressions are safer than HTML entities or raw Unicode
arrows. Gemini returns an empty string rather than throwing
when the prompt produces no output — needed an explicit check
before triggering the fallback. Next.js 15 params in dynamic
routes is now a Promise and must be awaited — destructuring
directly caused a TypeScript error. Record with a union type
generic is misinterpreted by Turbopack when the union comes
from an import type — a plain string index signature fixes it.
React namespace usage triggers no-undef ESLint errors in flat
config — named imports are the correct approach anyway.

**Blockers / what I'm stuck on:**
The shareable /audit/[id] page shows a placeholder until
Supabase is connected on Day 5. Lead capture logs to console
instead of saving to a database. The in-memory rate limiter
resets on cold start which is acceptable for MVP but would
need Upstash Redis for production persistence. Spent more
time than expected on Turbopack parse errors and ESLint
configuration — both are now fully resolved.

**Plan for tomorrow:**
Set up Supabase — create audits and leads tables, wire service
client into /api/audit to persist results, wire into /api/lead
to save email captures, and fetch real data in /audit/[id] so
the shareable URL works end to end. Set up Resend to send a
transactional confirmation email on lead capture.

## Day 6 — 2026-05-11

**Hours worked:** 10

**What I did:**
Wired up the full backend. Created Supabase project, ran
SQL schema for audits and leads tables with RLS enabled.
Built supabase.ts with service and browser clients. Updated
/api/audit to save results to Supabase with a fallback UUID
if the insert fails. Updated /api/lead to save email
captures. Updated /audit/[id]/page.tsx to fetch real data
from Supabase with dynamic OG metadata showing the actual
saving amount. Added not-found.tsx for missing audit IDs.

Extended the audit engine with a recommendedPlan feature —
added recommendedPlanKey parameter to makeResult in the
format toolKey:planKey which resolves the plan label and
price from pricingData. Updated all 8 tool rule functions
to pass the correct recommended plan. Updated ToolAuditCard
to show a green pill displaying the exact plan to switch to.
Added 5 new Jest tests covering recommendedPlan assertions.

Set up Resend account and built the full HTML email template
with savings hero, view audit CTA, and Credex CTA for high
savings users.

**What I learned:**
Supabase RLS is off by default — must be explicitly enabled
per table. Service role key bypasses RLS entirely so it must
never be a NEXT_PUBLIC_ variable. The recommendedPlanKey
string format keeps rule functions clean — makeResult
resolves label and price from pricingData in one place.

**Blockers / what I'm stuck on:**
Resend email not working. Two errors hit during debugging —
first the SDK returned application_error with null statusCode
meaning api.resend.com was unreachable. After generating a
new API key the error changed to 401 API key is invalid.
Lead capture saves to Supabase correctly but email is not
being sent.

**Plan for tomorrow:**
Fix Resend — verify new key with direct curl before testing
through the app, check Resend dashboard for account flags.
If unresolvable, move on to CI setup, Vercel deployment,
Lighthouse audit, and all remaining markdown files.


## Day 7 — 2026-05-12
**Hours worked:** 12

**What I did:**
Fixed Resend email integration after discovering the API key in .env.local was truncated during paste. Verified the key manually using a PowerShell curl request before testing through the app. After updating the full key, Resend returned successful responses and emails were delivered correctly. Removed all debug logging from resend.ts.

Set up GitHub Actions CI and resolved multiple issues. Converted jest.config.ts to jest.config.js because CI could not parse TypeScript config files without ts-node. Updated the config to use the new Jest transform syntax instead of deprecated globals. Fixed the “multiple configurations found” error by removing the tracked jest.config.ts using git rm. Updated the GitHub Actions workflow from Node.js 20 to 22 to remove deprecation warnings. CI now passes all checks.

Deployed the app to Vercel
 successfully on the first build. Added all environment variables and improved Lighthouse scores by adding security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) in next.config.ts. Improved accessibility with proper aria-label, htmlFor, role="alert", and aria-live usage. Generated a 1200x630 Open Graph image for social previews.

Completed all remaining markdown documentation files including README, ARCHITECTURE, REFLECTION, TESTS, GTM, ECONOMICS, LANDING_COPY, METRICS, and USER_INTERVIEWS. Added a Mermaid architecture diagram, scaling plan, growth strategy, conversion funnel math, ARR projections, and pivot triggers.

Conducted 3 user interviews with developers and students using multiple AI subscriptions. A key insight was that users react more strongly to annual cost framing compared to monthly pricing, which influenced the decision to highlight yearly savings prominently in the results UI.

**What I learned:**
Jest TypeScript configs require ts-node in CI, so converting to JavaScript avoids extra dependencies. git rm is necessary to stop Git from tracking deleted files. Vercel
 auto-detects Next.js configuration, reducing deployment setup work. User interviews revealed that subscription inertia is often a stronger factor than actual product value in keeping AI tool subscriptions active.

**Blockers / what I'm stuck on:**
No blockers. CI passing, deployment live, Resend working, documentation completed.

