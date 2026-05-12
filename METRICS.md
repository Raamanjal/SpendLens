# Metrics

## North Star Metric

**Audits completed per week**

An audit completed means a user reached the results
page and saw their savings number. This is the exact
moment of value delivery. Everything downstream —
email capture, consultation bookings, credit
purchases — follows from this event.

Why not page visits: Visits measure distribution,
not value. A visitor who leaves without submitting
got nothing from the product.

Why not email captures: Email capture is a
conversion event, not a value event. Optimising
purely for email capture risks adding friction
before showing results — the opposite of what
makes the product work.

Why not revenue: Revenue is too far downstream
for a product in its first 30 days. You cannot
optimise what you cannot yet observe consistently.

---

## 3 Input Metrics

**1. Form completion rate**
Audits completed divided by landing page visits.
Target: 30% or above.
If below target: the form has too much friction
or the hero copy is not converting. Test shortening
the form or leading with a stronger value statement.

**2. Email capture rate**
Emails submitted divided by audits completed.
Target: 35% or above.
If below target: either most users are already
optimal (low savings number) or the lead form
copy is weak. Check the distribution of savings
amounts before changing copy.

**3. High-savings audit rate**
Audits showing more than $500/mo saving divided
by total audits.
Target: 20% or above.
If below target: the audit rules are not covering
enough edge cases, or the target users are already
on correct plans. Expand rules to cover larger
teams and enterprise plan combinations.

---

## What to Instrument First

Four events in priority order:

**Event 1 — audit_completed**
Fire when /api/audit returns 200.
Properties: totalMonthlySaving, toolCount,
useCase, isHighSavings.

**Event 2 — lead_captured**
Fire when /api/lead returns 200.
Properties: auditId, monthlySaving, isHighSavings.

**Event 3 — credex_cta_clicked**
Fire when Book a Free Credex Consultation is clicked.
Properties: auditId, totalAnnualSaving.

**Event 4 — share_url_copied**
Fire when ShareButton is clicked.
Properties: auditId, saving.

Implementation: PostHog free tier. One script tag,
no backend changes needed, GDPR-compliant by default.

---

## Pivot Triggers

After 500 completed audits, review these numbers:

Email capture rate below 15%: The results are not
compelling enough. Either the savings numbers are
too low (pricing data is stale or wrong) or the
results page hierarchy is not clear. Fix data
before fixing copy.

High-savings rate below 10%: Most users are already
on correct plans. The current rule set is too
narrow. Expand to cover API spend optimisation,
annual vs monthly billing gaps, and seat count
mismatches on more tools.

Credex CTA click rate below 5% of high-savings
users: Users do not trust Credex as the solution
or the CTA placement is wrong. Test different
copy and test moving the CTA above the breakdown
instead of below it.

Share URL creation rate below 10% of audits:
The shareable URL is not being used as a viral
loop. Test adding a share nudge immediately after
the savings number is shown rather than after
email capture.

DAU is not a useful metric for this product.
A tool that people use once per quarter should
be measured on reach and referral, not daily
return visits.