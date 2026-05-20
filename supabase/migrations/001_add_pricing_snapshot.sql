-- Round 2: store pricing catalog at audit time for change detection.
-- Run once in Supabase Dashboard → SQL Editor (see supabase/README.md).

alter table public.audits
  add column if not exists pricing_snapshot jsonb,
  add column if not exists user_email text;

comment on column public.audits.pricing_snapshot is
  'Copy of pricingData.ts at audit time; version + capturedAt + tools map';

comment on column public.audits.user_email is
  'Email address used for Round 2 re-audit pricing-change notifications';

create index if not exists audits_user_email_idx
  on public.audits (user_email);
