
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID }                from 'crypto';
import { runAudit }                  from '@/lib/auditEngine';
import { generateSummary }           from '@/lib/gemini';
import type { AuditRequestBody }     from '@/types';

// ─── 1. In-memory rate limiter ────────────────────────────
// Maps IP address → array of request timestamps
// On every request, old timestamps are cleaned out
// If more than 10 requests in 1 hour → reject with 429
// NOTE: resets on server restart — fine for MVP
// Day 6: replace with Upstash Redis for production persistence

const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now      = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour in milliseconds
  const maxReqs  = 10;              // max requests per hour per IP

  // Get existing timestamps for this IP, filter out expired ones
  const prev = (rateLimitMap.get(ip) ?? [])
    .filter(t => now - t < windowMs);

  // Add the current request timestamp
  prev.push(now);
  rateLimitMap.set(ip, prev);

  // If total requests in window exceeds limit → blocked
  return prev.length > maxReqs;
}

// ─── 2. POST handler ──────────────────────────────────────
// Only POST is defined — GET/PUT/DELETE return 405 automatically
export async function POST(req: NextRequest) {

  // Get IP from header (set by Vercel/proxies)
  // Falls back to 'unknown' in local dev
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // ─── 3. Parse request body ──────────────────────────────
  // Wrapped in try/catch — malformed JSON would crash without it
  let body: AuditRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // ─── 4. Honeypot check ──────────────────────────────────
  // Real users never fill the hidden 'website' field
  // Bots that auto-fill forms will fill it
  // Return 200 OK so bots don't know they were rejected
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  // ─── 5. Validate required fields ────────────────────────
  const { tools, teamSize, useCase } = body;

  if (!tools?.length || !teamSize || !useCase) {
    return NextResponse.json(
      { error: 'Missing required fields: tools, teamSize, useCase.' },
      { status: 400 }
    );
  }

  // ─── 6. Run the audit engine ────────────────────────────
  // Pure function — no async, no side effects
  // Returns the full AuditResult synchronously
  const result = runAudit({ tools, teamSize, useCase });

  // ─── 7. Generate AI summary ─────────────────────────────
  // Async — calls Gemini API
  // Has built-in fallback so it never throws
  const summary = await generateSummary(
    result,
    { tools, teamSize, useCase }
  );

  // ─── 8. Generate unique audit ID ────────────────────────
  // randomUUID() from Node crypto — no library needed
  // Format: "a3f7c291-1b2e-4d5f-8a9b-0c1d2e3f4a5b"
  // Day 5: save { auditId, input, result, summary } to Supabase here
  const auditId = randomUUID();

  // ─── 9. Return result ───────────────────────────────────
  return NextResponse.json({ auditId, result, summary });
}