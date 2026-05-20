// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID }                from 'crypto';
import { runAudit }                  from '@/lib/auditEngine';
import { generateSummary }           from '@/lib/gemini';
import { buildPricingSnapshot }      from '@/lib/pricingSnapshot';
import { getServiceClient }          from '@/lib/supabase';
import type { AuditRequestBody }     from '@/types';

// ── Rate limiter ──────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now      = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxReqs  = 10;
  const prev     = (rateLimitMap.get(ip) ?? [])
    .filter(t => now - t < windowMs);
  prev.push(now);
  rateLimitMap.set(ip, prev);
  return prev.length > maxReqs;
}

// ── POST handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    );
  }

  let body: AuditRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // Honeypot check
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const { tools, teamSize, useCase } = body;
  const email = body.email?.trim().toLowerCase();

  if (!tools?.length || !teamSize || !useCase || !email) {
    return NextResponse.json(
      { error: 'Missing required fields.' },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  // Run audit engine — pure, synchronous
  const result  = runAudit({ tools, teamSize, useCase });

  // Pricing frozen at audit time (for Round 2 change detection)
  const pricingSnapshot = buildPricingSnapshot();

  // Generate AI summary — async, has fallback
  const summary = await generateSummary(
    result,
    { tools, teamSize, useCase }
  );

  // ── Save to Supabase ──────────────────────────────────
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('audits')
    .insert({
      input:            { tools, teamSize, useCase },
      result,
      summary,
      user_email:       email,
      pricing_snapshot: pricingSnapshot,
    })
    .select('id')
    .single();

  if (error) {
    // DB error — still return the result so the user sees their audit
    // Log the error and generate a fallback UUID
    console.error('Supabase insert failed:', error.message);
    const fallbackId = randomUUID();
    return NextResponse.json({ auditId: fallbackId, result, summary, email });
  }

  return NextResponse.json({
    auditId: data.id,
    result,
    summary,
    email,
  });
}
