// src/app/api/lead/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { LeadRequestBody }      from '@/types';

export async function POST(req: NextRequest) {

  // ─── 1. Parse body ──────────────────────────────────────
  let body: LeadRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // ─── 2. Honeypot check ──────────────────────────────────
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  // ─── 3. Validate email and auditId ──────────────────────
  const { email, auditId } = body;

  if (!email || !auditId) {
    return NextResponse.json(
      { error: 'Email and auditId are required.' },
      { status: 400 }
    );
  }

  // ─── 4. Basic email format check ────────────────────────
  // Regex checks for: something @ something . something
  // Not perfect but catches obvious typos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  // ─── 5. Log for now — Day 5 replaces this ───────────────
  // Day 5: INSERT into Supabase leads table
  // Day 5: Send transactional email via Resend
  console.log('Lead captured:', {
    email,
    auditId,
    company:       body.company,
    monthlySaving: body.monthlySaving,
  });

  return NextResponse.json({ ok: true });
}