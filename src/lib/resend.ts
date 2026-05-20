// src/lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

interface SendAuditEmailParams {
  email:         string;
  monthlySaving: number;
  auditId:       string;
  isHighSavings: boolean;
}

interface SendPricingChangeEmailParams {
  email: string;
  affectedAudits: {
    auditId: string;
    changes: string[];
    oldMonthlySaving: number;
    newMonthlySaving: number;
    monthlyDelta: number;
  }[];
}

export async function sendAuditEmail({
  email,
  monthlySaving,
  auditId,
  isHighSavings,
}: SendAuditEmailParams): Promise<void> {

  // ── Debug: log what we are trying to send ──────────────
  console.log('=== Resend Debug ===');
  console.log('API Key set:', !!process.env.RESEND_API_KEY);
  console.log('API Key prefix:', process.env.RESEND_API_KEY?.slice(0, 8));
  console.log('Sending to:', email);
  console.log('Saving:', monthlySaving);
  console.log('Audit ID:', auditId);
  console.log('====================');

  const auditUrl    = `${process.env.NEXT_PUBLIC_BASE_URL}/audit/${auditId}`;
  const annualSaving = monthlySaving * 12;

  const subject = monthlySaving > 0
    ? `Your AI Spend Audit — $${monthlySaving.toLocaleString()}/mo in savings found`
    : 'Your AI Spend Audit — SpendLens';

  const html = buildEmailHtml({
    auditUrl,
    monthlySaving,
    annualSaving,
    isHighSavings,
  });

  try {
    const response = await resend.emails.send({
      from:    'onboarding@resend.dev',
      to:      email,
      subject,
      html,
    });

    // ── Debug: log the full Resend response ──────────────
    console.log('Resend response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('Resend error:', response.error);
    } else {
      console.log('Email sent successfully. ID:', response.data?.id);
    }

  } catch (err) {
    console.error('Resend threw an exception:', (err as Error).message);
    console.error('Full error:', err);
  }
}

export async function sendPricingChangeEmail({
  email,
  affectedAudits,
}: SendPricingChangeEmailParams): Promise<void> {
  if (!affectedAudits.length) return;

  const subject = affectedAudits.length === 1
    ? 'SpendLens pricing change detected for your audit'
    : `SpendLens pricing changes detected for ${affectedAudits.length} audits`;

  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject,
      html: buildPricingChangeEmailHtml({ email, affectedAudits }),
    });

    if (response.error) {
      console.error('Pricing-change email failed:', response.error);
    }
  } catch (err) {
    console.error('Pricing-change email threw:', (err as Error).message);
  }
}

// ── Email HTML template ───────────────────────────────────

interface EmailHtmlParams {
  auditUrl:      string;
  monthlySaving: number;
  annualSaving:  number;
  isHighSavings: boolean;
}

function buildEmailHtml({
  auditUrl,
  monthlySaving,
  annualSaving,
  isHighSavings,
}: EmailHtmlParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                 background:#f9fafb;margin:0;padding:40px 20px;">

      <div style="max-width:520px;margin:0 auto;background:white;
                  border-radius:12px;border:1px solid #e5e7eb;
                  overflow:hidden;">

        <!-- Header -->
        <div style="background:#16a34a;padding:32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;
                     font-weight:700;letter-spacing:-0.5px;">
            SpendLens
          </h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:14px;">
            Your AI Spend Audit is ready
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">

          ${monthlySaving > 0 ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;
                      border-radius:10px;padding:24px;
                      text-align:center;margin-bottom:24px;">
            <p style="color:#15803d;font-size:13px;font-weight:600;
                      text-transform:uppercase;letter-spacing:1px;
                      margin:0 0 8px;">
              Potential Monthly Savings
            </p>
            <p style="color:#16a34a;font-size:48px;font-weight:700;
                      margin:0;line-height:1;">
              $${monthlySaving.toLocaleString()}
            </p>
            <p style="color:#6b7280;font-size:14px;margin:8px 0 0;">
              $${annualSaving.toLocaleString()} per year
            </p>
          </div>
          ` : `
          <p style="color:#374151;font-size:15px;margin:0 0 24px;">
            Your audit is complete.
            Your AI stack looks well-optimised.
          </p>
          `}

          <div style="text-align:center;margin-bottom:24px;">
            <a href="${auditUrl}"
               style="display:inline-block;background:#16a34a;
                      color:white;font-weight:600;font-size:14px;
                      padding:12px 28px;border-radius:8px;
                      text-decoration:none;">
              View Full Audit
            </a>
          </div>

          ${isHighSavings ? `
          <div style="background:#111827;border-radius:10px;
                      padding:24px;margin-bottom:24px;">
            <p style="color:#f9fafb;font-size:15px;font-weight:600;
                      margin:0 0 8px;">
              Want to capture even more savings?
            </p>
            <p style="color:#9ca3af;font-size:13px;margin:0 0 16px;
                      line-height:1.6;">
              Credex sources discounted AI credits from companies
              that over-forecast. Book a free call with our team.
            </p>
            <a href="https://credex.rocks/consult"
               style="display:inline-block;background:#22c55e;
                      color:white;font-weight:600;font-size:13px;
                      padding:10px 20px;border-radius:8px;
                      text-decoration:none;">
              Book a Free Credex Call
            </a>
          </div>
          ` : ''}

          <p style="color:#6b7280;font-size:13px;margin:0;">
            View your audit:
            <a href="${auditUrl}" style="color:#16a34a;">
              ${auditUrl}
            </a>
          </p>

        </div>

        <!-- Footer -->
        <div style="border-top:1px solid #f3f4f6;padding:20px 32px;
                    text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            SpendLens by Credex · credex.rocks
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function buildPricingChangeEmailHtml({
  affectedAudits,
}: SendPricingChangeEmailParams): string {
  const items = affectedAudits.map(audit => {
    const diffUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/audit/${audit.auditId}/reaudit`;
    const changeList = audit.changes
      .map(change => `<li style="margin-bottom:6px;">${escapeHtml(change)}</li>`)
      .join('');
    const deltaText = audit.monthlyDelta === 0
      ? 'No total savings change'
      : `${audit.monthlyDelta > 0 ? '+' : ''}$${audit.monthlyDelta.toLocaleString()}/mo savings delta`;

    return `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 8px;color:#111827;font-weight:700;">
          Audit ${audit.auditId.slice(0, 8)}
        </p>
        <p style="margin:0 0 12px;color:#4b5563;font-size:14px;">
          Previous recommendation: $${audit.oldMonthlySaving.toLocaleString()}/mo savings<br />
          Current recommendation: $${audit.newMonthlySaving.toLocaleString()}/mo savings<br />
          <strong>${deltaText}</strong>
        </p>
        <ul style="color:#4b5563;font-size:14px;padding-left:20px;margin:0 0 16px;">
          ${changeList}
        </ul>
        <a href="${diffUrl}"
           style="display:inline-block;background:#16a34a;color:white;
                  font-weight:600;font-size:14px;padding:10px 18px;
                  border-radius:8px;text-decoration:none;">
          View before/after diff
        </a>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                 background:#f9fafb;margin:0;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:white;
                  border-radius:12px;border:1px solid #e5e7eb;padding:32px;">
        <h1 style="color:#111827;margin:0 0 8px;font-size:22px;">
          Pricing changed. Your audit may have changed too.
        </h1>
        <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
          SpendLens re-checked your stored audit against the latest pricing data.
          Here is what changed and how it affects the original recommendation.
        </p>
        ${items}
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">
          SpendLens by Credex
        </p>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
