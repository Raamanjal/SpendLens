# Reflection

## 1. Hardest Bug

The hardest bug was in the audit engine where Cursor 
Business plan rules were referencing 
TOOLS.claude.plans.pro.monthly instead of 
TOOLS.cursor.plans.pro.monthly. Both happen to be $20 
so all the tests still passed and the output looked 
correct. I only caught it during a code review of the 
getPrice() helper function calls.

My first hypothesis was that the savings calculation 
was wrong — I checked the math manually and it was 
correct. Second hypothesis was that the plan key lookup 
was failing silently — I added console.log to makeResult 
and saw the right numbers coming through. Third 
hypothesis was that the tool reference itself was wrong 
— I searched for TOOLS.claude in the audit engine and 
found it inside the auditCursor function where it had 
no business being.

The fix was one word — claude to cursor. The lesson was 
that tests passing does not mean logic is correct. 
I added a test specifically checking that the Cursor 
audit uses Cursor pricing, not Claude pricing, even 
though the numbers happen to match today.

## 2. A Decision I Reversed

I originally built the results page as a separate route 
that the form redirected to after submission. The idea 
was that every audit would get its own URL immediately.

I reversed this on Day 3 when I realised I had not set 
up Supabase yet. The redirect approach required saving 
to a database before showing results — without a 
database I had nowhere to store the data and the 
results page would be empty.

I switched to a state-based toggle on the homepage — 
form view and results view on the same page, no 
redirect. This got the core flow working in one day 
without any backend dependency. The shareable URL 
was added properly on Day 5 once Supabase was wired up.

## 3. What I Would Build in Week 2

The benchmark mode — showing how a team's AI spend per 
developer compares to companies of the same size. 
Right now the audit tells you if you are on the wrong 
plan. Benchmark mode would tell you if your entire 
category of spend is high, even if every individual 
plan is correct.

I would also build a PDF export of the audit report. 
Several user interview respondents said they forward 
cost analysis to their CFO or finance team who prefer 
a document over a link. A generated PDF would make 
SpendLens useful as a finance deliverable, not just a 
self-serve tool.

Third priority would be a return visit flow — if a 
user runs an audit and comes back three months later 
after acting on the recommendations, they should be 
able to see how much they actually saved vs how much 
was predicted.

## 4. How I Used AI Tools

Used Claude Sonnet for the majority of the build — 
component scaffolding, API route structure, and 
debugging TypeScript errors. Used Gemini Flash inside 
the product itself for the audit summary generation.

Tasks I trusted Claude with: boilerplate component 
structure, Tailwind class suggestions, TypeScript type 
definitions, and explaining Next.js 15 API changes 
like params being a Promise in dynamic routes.

Tasks I did not trust Claude with: the audit engine 
rule logic and the pricing data. Every audit rule 
and every price was written and verified by me against 
official vendor pricing pages. The audit logic is the 
core value of the product — if that is wrong, 
everything is wrong.

One specific time the AI was wrong: Claude suggested 
using Record<RecommendedAction, ActionConfig> as the 
type for the action config object in ToolAuditCard. 
This caused a TypeScript error in Turbopack because 
the union type was being misinterpreted as a value 
expression. The fix was to use 
{ [key: string]: ActionConfig } instead — a simpler 
type that Turbopack parses without ambiguity. Claude's 
suggestion was technically valid TypeScript but 
incompatible with the Turbopack parser.

## 5. Self Ratings

**Discipline: 7/10**
Committed code across 5 distinct calendar days and 
maintained the DEVLOG throughout. Lost some time to 
configuration issues that should have been caught 
earlier — ESLint flat config and Jest TypeScript 
setup took longer than expected.

**Code Quality: 7/10**
The audit engine is well-structured with pure 
functions, a single helper for price lookups, and 
consistent result construction through makeResult. 
The UI components are functional but some have grown 
larger than ideal — SpendForm could be split further.

**Design Sense: 7/10**
The UI is clean and functional. The results page 
hierarchy — hero number, summary, breakdown, CTA — 
is intentional and logical. It is not a design 
portfolio piece but it is professional enough to share.

**Problem Solving: 8/10**
Debugging the Turbopack Unicode parse error was 
non-obvious. Identifying the wrong tool reference in 
the audit engine despite passing tests required 
systematic hypothesis testing rather than 
assumption-driven fixes.

**Entrepreneurial Thinking: 7/10**
The lead gate placement — value shown first, email 
asked second — is intentional and correct. The Credex 
CTA surfaces only for high-savings users which 
respects the user and increases conversion quality. 
The shareable URL as a viral loop is implemented 
properly with OG tags.