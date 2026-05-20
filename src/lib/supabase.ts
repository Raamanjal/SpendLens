
// Two clients:
// - getServiceClient(): full access, server-side only
// - getBrowserClient(): anon access, safe for browser

import { createClient } from '@supabase/supabase-js';
import type { AuditInput, AuditResult, PricingSnapshot } from '@/types';

// ── Database row types ────────────────────────────────────

export interface AuditRow {
  id:               string;
  input:            AuditInput;
  result:           AuditResult;
  summary:          string;
  user_email:       string | null;
  pricing_snapshot: PricingSnapshot | null;
  created_at:       string;
}

export interface LeadRow {
  id:             string;
  audit_id:       string;
  email:          string;
  company:        string | null;
  monthly_saving: number | null;
  created_at:     string;
}

// ── Server-side client ───────────────────────────────────
// Uses service role key — bypasses RLS
// NEVER use this in browser code or expose to client
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );
}

// ── Browser client ────────────────────────────────────────
// Uses anon key — RLS applies
// Safe to use in client components
export function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL      ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}
