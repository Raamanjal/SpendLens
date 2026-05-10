
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AuditResult, AuditInput } from '@/types';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const MODEL = 'gemini-2.5-flash';

// ─── 3. Main exported function ────────────────────────────
// Called from the /api/audit route after the audit engine runs
// Returns a string — either the AI paragraph or the fallback
export async function generateSummary(
  auditResult: AuditResult,
  input:       AuditInput
): Promise<string> {
  try {
    // Get a model instance
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Build the prompt with real audit data injected
    const prompt = buildPrompt(auditResult, input);

    // Send to Gemini and await response
    const result   = await model.generateContent(prompt);
    const text     = result.response.text().trim();

    // If Gemini returns empty string — use fallback
    return text || buildFallback(auditResult, input);

  } catch (err) {
    // Any API error (rate limit, bad key, network) — use fallback
    // NEVER let AI failure crash the audit
    console.error('Gemini failed, using fallback:', (err as Error).message);
    return buildFallback(auditResult, input);
  }
}

// ─── 4. The prompt ───────────────────────────────────────
function buildPrompt(result: AuditResult, input: AuditInput): string {
  // Build a line per tool for context
  const toolLines = result.perTool
    .map(t =>
      `- ${t.tool} (${t.plan}, ${t.seats} seat${t.seats > 1 ? 's' : ''}): ` +
      `$${t.currentSpend}/mo spend, ` +
      `$${t.potentialSaving}/mo potential saving — ${t.reason}`
    )
    .join('\n');

  return `
You are a concise financial advisor specialising in SaaS and AI tool spend optimisation.

A ${input.teamSize}-person team uses AI tools primarily for ${input.useCase} work.
Total potential saving: $${result.totalMonthlySaving}/month ($${result.totalAnnualSaving}/year).

Per-tool breakdown:
${toolLines}

Write a single paragraph of approximately 100 words that:
1. Briefly acknowledges their current AI tool stack
2. Highlights the top 1-2 savings opportunities with specific dollar amounts
3. Ends with one clear action-oriented sentence

Rules:
- Plain paragraph only — no bullet points, no headers, no markdown
- Use the exact numbers provided above
- Professional advisor tone, not sales language
- Do not mention Credex
`.trim();
}

// ─── 5. Fallback ──────────────────────────────────────────
// Runs when Gemini API fails for any reason
// Uses only local data — no network call needed
// Always returns a meaningful paragraph
function buildFallback(result: AuditResult, input: AuditInput): string {
  // Total what the user is currently spending
  const totalSpend = result.perTool.reduce(
    (sum, t) => sum + t.currentSpend, 0
  );

  // Find the single biggest saving opportunity
  const top = [...result.perTool]
    .sort((a, b) => b.potentialSaving - a.potentialSaving)[0];

  // Different message depending on whether savings exist
  const topLine = top?.potentialSaving > 0
    ? `The biggest opportunity is your ${top.tool} ${top.plan} plan — ` +
      `switching could save $${top.potentialSaving}/mo.`
    : `Your current stack appears well-optimised for your team size.`;

  return (
    `Your ${input.teamSize}-person team is spending ` +
    `$${totalSpend}/mo across ` +
    `${result.perTool.length} AI tool${result.perTool.length !== 1 ? 's' : ''}. ` +
    `Our audit identified $${result.totalMonthlySaving}/mo in potential savings ` +
    `($${result.totalAnnualSaving}/year). ` +
    `${topLine} ` +
    `Review the breakdown below and act on the highest-impact items first.`
  );
}