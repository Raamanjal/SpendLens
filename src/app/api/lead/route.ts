// src/app/api/lead/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient }          from '@/lib/supabase';
import { sendAuditEmail }            from '@/lib/resend';
import type { LeadRequestBody }      from '@/types';

export async function POST(req: NextRequest) {

  let body: LeadRequestBody;
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

  const { email, auditId, company, monthlySaving } = body;

  if (!email || !auditId) {
    return NextResponse.json(
      { error: 'Email and auditId are required.' },
      { status: 400 }
    );
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  // ── Save lead to Supabase ─────────────────────────────
  const supabase = getServiceClient();

  const { error: dbError } = await supabase
    .from('leads')
    .insert({
      audit_id:       auditId,
      email,
      company:        company ?? null,
      monthly_saving: monthlySaving ?? null,
    });

  if (dbError) {
    console.error('Lead insert failed:', dbError.message);
    // Still send the email — don't fail the user
    // because of a DB error
  }

  // ── Send transactional email via Resend ───────────────
  await sendAuditEmail({
    email,
    monthlySaving:  monthlySaving ?? 0,
    auditId,
    isHighSavings:  (monthlySaving ?? 0) > 500,
  });

  return NextResponse.json({ ok: true });
}