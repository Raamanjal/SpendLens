// src/lib/resend.ts
// Sends transactional emails via Resend
// Called from /api/lead after email is captured

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

interface SendAuditEmailParams {
  email:         string;
  monthlySaving: number;
  auditId:       string;
  isHighSavings: boolean;
}

export async function sendAuditEmail({
  email,
  monthlySaving,
  auditId,
  isHighSavings,
}: SendAuditEmailParams): Promise<void> {

  const auditUrl    = `${process.env.NEXT_PUBLIC_BASE_URL}/audit/${auditId}`;
  const annualSaving = monthlySaving * 12;

  // ── Email subject ──────────────────────────────────────
  const subject = monthlySaving > 0
    ? `Your AI Spend Audit — $${monthlySaving.toLocaleString()}/mo in savings found`
    : 'Your AI Spend Audit — SpendLens';

  // ── Email body ─────────────────────────────────────────
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                 background: #f9fafb; margin: 0; padding: 40px 20px;">

      <div style="max-width: 520px; margin: 0 auto; background: white;
                  border-radius: 12px; border: 1px solid #e5e7eb;
                  overflow: hidden;">

        <!-- Header -->
        <div style="background: #16a34a; padding: 32px;
                    text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;
                     font-weight: 700; letter-spacing: -0.5px;">
            SpendLens
          </h1>
          <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 14px;">
            Your AI Spend Audit is ready
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">

          ${monthlySaving > 0 ? `
          <!-- Savings hero -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0;
                      border-radius: 10px; padding: 24px;
                      text-align: center; margin-bottom: 24px;">
            <p style="color: #15803d; font-size: 13px; font-weight: 600;
                      text-transform: uppercase; letter-spacing: 1px;
                      margin: 0 0 8px;">
              Potential Monthly Savings
            </p>
            <p style="color: #16a34a; font-size: 48px; font-weight: 700;
                      margin: 0; line-height: 1;">
              $${monthlySaving.toLocaleString()}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">
              $${annualSaving.toLocaleString()} per year
            </p>
          </div>
          ` : `
          <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
            Your audit is complete. Your AI stack looks well-optimised.
          </p>
          `}

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${auditUrl}"
               style="display: inline-block; background: #16a34a;
                      color: white; font-weight: 600; font-size: 14px;
                      padding: 12px 28px; border-radius: 8px;
                      text-decoration: none;">
              View Full Audit
            </a>
          </div>

          ${isHighSavings ? `
          <!-- Credex CTA for high savings -->
          <div style="background: #111827; border-radius: 10px;
                      padding: 24px; margin-bottom: 24px;">
            <p style="color: #f9fafb; font-size: 15px; font-weight: 600;
                      margin: 0 0 8px;">
              Want to capture even more savings?
            </p>
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 16px;
                      line-height: 1.6;">
              Credex sources discounted AI credits from companies that
              over-forecast. Book a free call with our team.
            </p>
            <a href="https://credex.rocks/consult"
               style="display: inline-block; background: #22c55e;
                      color: white; font-weight: 600; font-size: 13px;
                      padding: 10px 20px; border-radius: 8px;
                      text-decoration: none;">
              Book a Free Credex Call
            </a>
          </div>
          ` : ''}

          <!-- Share -->
          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            Share your audit:
            <a href="${auditUrl}" style="color: #16a34a;">
              ${auditUrl}
            </a>
          </p>

        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #f3f4f6; padding: 20px 32px;
                    text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            SpendLens by Credex · credex.rocks
          </p>
          <p style="color: #d1d5db; font-size: 11px; margin: 6px 0 0;">
            You received this because you ran a free audit.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from:    'SpendLens <onboarding@resend.dev>',
      to:      email,
      subject,
      html,
    });
  } catch (err) {
    // Email failure must never crash the lead capture
    console.error('Resend failed:', (err as Error).message);
  }
}