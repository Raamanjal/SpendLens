# Prompts

## AI Summary Generation

### Model Used
Gemini 1.5 Flash via Google Generative AI SDK
Why Flash not Pro: Flash is faster and cheaper for
a 100 word summary task. The real audit data is
injected directly so model reasoning quality does
not affect accuracy — only tone and fluency matter
at this step.

---

### Final Prompt
You are a concise financial advisor specialising in
SaaS and AI tool spend optimisation.
A {teamSize}-person team uses AI tools primarily
for {useCase} work.
Total potential saving: ${totalMonthlySaving}/month
(${totalAnnualSaving}/year).
Per-tool breakdown:
{toolLines}
Write a single paragraph of approximately 100 words:

Briefly acknowledge their current AI tool stack
Highlight the top 1-2 savings with specific
dollar amounts
End with one clear action-oriented sentence

Rules:

Plain paragraph only
No bullet points, headers, or markdown
Use the exact numbers provided above
Professional advisor tone, not sales language
Do not mention Credex


---

### Why It Works

**Role framing:** "Financial advisor specialising in
SaaS spend" keeps output professional and analytical.
Without it the model wrote generic chatbot responses.

**Rules block:** Early versions returned bullet
points. The explicit rules block eliminated this
completely after two iterations.

**Numbers injected:** Without real numbers the model
hallucinated savings figures. Passing the full audit
result into the prompt grounds every sentence in
actual data from the engine.

**~100 words:** Without a word count the output
varied between 30 and 300 words. Approximate
guidance keeps it display-friendly without being
rigid.

---

### What Did Not Work

**Version 1:** Just asked to "summarise this audit."
Model wrote generic advice not connected to the
specific numbers provided.

**Version 2:** Asked for a bullet point summary.
Output looked wrong placed above the breakdown
table — two bullet lists on the same page.

**Version 3:** No role framing. Output sounded like
a customer support bot. Adding "financial advisor
specialising in SaaS spend" fixed the tone in one
iteration.

---

### Fallback Behaviour

If Gemini API fails for any reason — rate limit,
network error, invalid key — the system falls back
to a deterministic template built from the audit
data. The fallback runs entirely locally with no
network call. The results page always shows a
summary paragraph regardless of API status. This
was tested by intentionally setting an invalid key
during development.

---

## Audit Engine

No AI is used in the audit rules. All logic is
hardcoded, deterministic, and tested.

This is intentional. A finance-literate person
must agree with every recommendation. Hardcoded
rules are auditable, testable, and explainable.
An LLM-generated recommendation for "downgrade
to Pro and save $40/mo" introduces hallucination
risk on financial advice. The AI handles prose.
The rules handle money.