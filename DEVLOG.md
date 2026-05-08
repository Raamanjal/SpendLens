

## Day 1 — 2026-05-08

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

