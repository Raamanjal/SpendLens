# Architecture

## System Diagram

```mermaid
graph TD
  A[User — Browser] -->|Fills form| B[SpendForm Component]
  B -->|POST /api/audit| C[Audit API Route]
  C -->|runAudit| D[Audit Engine]
  D -->|AuditResult| C
  C -->|generateSummary| E[Gemini 1.5 Flash]
  E -->|Summary paragraph| C
  C -->|INSERT| F[(Supabase — audits table)]
  C -->|auditId + result + summary| A
  A -->|Enters email| G[LeadCapture Component]
  G -->|POST /api/lead| H[Lead API Route]
  H -->|INSERT| I[(Supabase — leads table)]
  H -->|sendAuditEmail| J[Resend]
  J -->|Email| K[User Inbox]
  A -->|Shares URL| L[/audit/id]
  L -->|SELECT from audits| F
  L -->|Renders AuditResults| A
```

## Data Flow

```
1. User fills SpendForm (tool, plan, spend, seats)
   └── Persisted to localStorage on every keystroke

2. Form submits to POST /api/audit
   ├── Rate limit check (10 requests/hour per IP)
   ├── Honeypot check (bots rejected silently)
   ├── runAudit() — pure function, no side effects
   │   └── Returns AuditResult with per-tool breakdown
   ├── generateSummary() — calls Gemini API
   │   └── Falls back to template if API fails
   ├── INSERT into Supabase audits table
   └── Returns { auditId, result, summary }

3. AuditResults renders on the same page
   ├── Hero savings number
   ├── AI summary paragraph
   ├── Per-tool breakdown cards
   └── Lead capture form

4. POST /api/lead
   ├── INSERT into Supabase leads table
   └── sendAuditEmail() via Resend

5. Shareable URL /audit/[id]
   ├── SELECT from audits by id (no PII exposed)
   └── Renders full AuditResults with OG metadata
```

## Stack Choice

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 | SSR for OG tags, API routes, Vercel deploy |
| Language | TypeScript | Type safety across audit engine and API |
| Styling | Tailwind CSS | Fast iteration, no CSS files to maintain |
| Database | Supabase | Free tier, RLS for lead privacy, JS SDK |
| AI | Gemini 1.5 Flash | Fast, cheap, sufficient for 100-word summary |
| Email | Resend | Simple API, good deliverability |
| Deployment | Vercel | Zero config for Next.js, free tier |
| Testing | Jest + ts-jest | Unit tests for audit engine pure functions |
| CI | GitHub Actions | Lint + test on every push |

## Scaling to 10k Audits/Day

Current bottlenecks and fixes at scale:

**Rate limiter** — in-memory Map resets on cold start.
Replace with Upstash Redis for persistent rate limiting 
across serverless instances.

**Supabase** — free tier handles ~500 concurrent 
connections. Upgrade to Pro ($25/mo) which supports 
connection pooling via PgBouncer.

**Gemini API** — 1,500 requests/day on free tier. 
Upgrade to paid or cache summaries for identical 
audit inputs using a hash of the input as the key.

**OG images** — static og-image.png works for MVP. 
At scale generate dynamic images using 
@vercel/og with the actual saving amount per audit.

**Resend** — free tier is 3,000 emails/month. 
Upgrade to Starter ($20/mo) for 50,000 emails.