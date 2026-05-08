// src/lib/pricingData.ts
// Every number here traces to PRICING_DATA.md
// All prices verified from official vendor pages — May 2026

import type { ToolDefinition } from '@/types';

export const TOOLS: Record<string, ToolDefinition> = {

  cursor: {
    label: 'Cursor',
    plans: {
      hobby: {
        label:   'Hobby',
        monthly: 0,
        perSeat: false,
        // https://cursor.com/pricing — verified 2026-05-08
      },
      pro: {
        label:   'Pro',
        monthly: 20,
        perSeat: true,
        // https://cursor.com/pricing — verified 2026-05-08
      },
      pro_plus: {
        label:   'Pro+',
        monthly: 60,
        perSeat: true,
        // https://cursor.com/pricing — verified 2026-05-08
      },
      business: {
        label:   'Business',
        monthly: 40,
        perSeat: true,
        // https://cursor.com/pricing — verified 2026-05-08
      },
      enterprise: {
        label:   'Enterprise',
        monthly: null,
        perSeat: true,
        // https://cursor.com/pricing — verified 2026-05-08
      },
    },
  },

  github_copilot: {
    label: 'GitHub Copilot',
    plans: {
      free: {
        label:   'Free',
        monthly: 0,
        perSeat: false,
        // https://github.com/features/copilot — verified 2026-05-08
      },
      pro: {
        label:   'Pro',
        monthly: 10,
        perSeat: true,
        // https://github.com/features/copilot — verified 2026-05-08
        // Note: previously called "Individual" — renamed to Pro in 2024
      },
      pro_plus: {
        label:   'Pro+',
        monthly: 39,
        perSeat: true,
        // https://github.com/features/copilot — verified 2026-05-08
      },
      business: {
        label:   'Business',
        monthly: 19,
        perSeat: true,
        // https://github.com/features/copilot — verified 2026-05-08
      },
      enterprise: {
        label:   'Enterprise',
        monthly: 39,
        perSeat: true,
        // https://github.com/features/copilot — verified 2026-05-08
      },
    },
  },

  claude: {
    label: 'Claude',
    plans: {
      free: {
        label:   'Free',
        monthly: 0,
        perSeat: false,
        // https://claude.ai/upgrade — verified 2026-05-08
      },
      pro: {
        label:   'Pro',
        monthly: 20,
        perSeat: true,
        // https://claude.ai/upgrade — verified 2026-05-08
      },
      max: {
        label:   'Max',
        monthly: 100,
        perSeat: true,
        // https://claude.ai/upgrade — verified 2026-05-08
      },
      team_standard: {
        label:         'Team Standard',
        monthly:       25,    // monthly billing rate
        annualMonthly: 20,    // annual billing rate (cheaper)
        perSeat:       true,
        minSeats:      5,
        // https://claude.ai/upgrade — verified 2026-05-08
        // $20/seat/mo on annual plan, $25/seat/mo on monthly plan
      },
      team_premium: {
        label:         'Team Premium',
        monthly:       125,   // monthly billing rate
        annualMonthly: 100,   // annual billing rate (cheaper)
        perSeat:       true,
        minSeats:      5,
        // https://claude.ai/upgrade — verified 2026-05-08
        // $100/seat/mo on annual plan, $125/seat/mo on monthly plan
      },
      enterprise: {
        label:   'Enterprise',
        monthly: null,
        perSeat: true,
        // https://claude.ai/upgrade — verified 2026-05-08
        // Custom pricing, minimum 20 seats
      },
      api_direct: {
        label:   'API Direct',
        monthly: null,
        perSeat: false,
        // https://www.anthropic.com/pricing — verified 2026-05-08
      },
    },
  },

  chatgpt: {
    label: 'ChatGPT',
    plans: {
      free: {
        label:   'Free',
        monthly: 0,
        perSeat: false,
        // https://chatgpt.com/pricing — verified 2026-05-08
      },
      go: {
        label:   'Go',
        monthly: 5,
        perSeat: true,
        // https://chatgpt.com/pricing — verified 2026-05-08
      },
      plus: {
        label:   'Plus',
        monthly: 20,
        perSeat: true,
        // https://chatgpt.com/pricing — verified 2026-05-08
      },
      pro: {
        label:   'Pro',
        monthly: 120,
        perSeat: true,
        // https://chatgpt.com/pricing — verified 2026-05-08
      },
      business: {
        label:    'Business (ChatGPT & Codex)',
        monthly:  21,
        perSeat:  true,
        minSeats: 2,
        // https://chatgpt.com/pricing — verified 2026-05-08
        // Billed annually, minimum 2 seats
      },
      business_codex: {
        label:   'Business Codex',
        monthly: null,
        perSeat: false,
        // https://chatgpt.com/pricing — verified 2026-05-08
        // Usage-based pricing
      },
      enterprise: {
        label:   'Enterprise',
        monthly: null,
        perSeat: true,
        // https://chatgpt.com/pricing — verified 2026-05-08
      },
      api_direct: {
        label:   'API Direct',
        monthly: null,
        perSeat: false,
        // https://openai.com/api/pricing — verified 2026-05-08
      },
    },
  },

  anthropic_api: {
    label: 'Anthropic API',
    plans: {
      payg: {
        label:   'Pay-as-you-go',
        monthly: null,
        perSeat: false,
        // https://www.anthropic.com/pricing — verified 2026-05-08
      },
    },
  },

  openai_api: {
    label: 'OpenAI API',
    plans: {
      payg: {
        label:   'Pay-as-you-go',
        monthly: null,
        perSeat: false,
        // https://openai.com/api/pricing — verified 2026-05-08
      },
    },
  },

  gemini: {
    label: 'Gemini',
    plans: {
      free: {
        label:   'Free',
        monthly: 0,
        perSeat: false,
        // https://one.google.com/about/ai-premium/ — verified 2026-05-08
      },
      pro: {
        label:   'Google AI Pro',
        monthly: 20,
        perSeat: true,
        // https://one.google.com/about/ai-premium/ — verified 2026-05-08
      },
      ultra: {
        label:   'Google AI Ultra',
        monthly: 300,
        perSeat: true,
        // https://one.google.com/about/ai-premium/ — verified 2026-05-08
      },
      api: {
        label:   'Gemini API (Pay-as-you-go)',
        monthly: null,
        perSeat: false,
        // https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-08
      },
    },
  },

  windsurf: {
    label: 'Windsurf',
    plans: {
      free: {
        label:   'Free',
        monthly: 0,
        perSeat: false,
        // https://windsurf.com/pricing — verified 2026-05-08
      },
      pro: {
        label:   'Pro',
        monthly: 15,
        perSeat: true,
        // https://windsurf.com/pricing — verified 2026-05-08
      },
      teams: {
        label:   'Teams',
        monthly: 35,
        perSeat: true,
        // https://windsurf.com/pricing — verified 2026-05-08
      },
    },
  },

};

export const USE_CASES = [
  { value: 'coding',   label: 'Coding / Engineering' },
  { value: 'writing',  label: 'Writing / Content'    },
  { value: 'data',     label: 'Data / Analytics'     },
  { value: 'research', label: 'Research'             },
  { value: 'mixed',    label: 'Mixed / General'      },
] as const;

export const TOOL_LIST = Object.entries(TOOLS).map(([key, def]) => ({
  value: key,
  label: def.label,
}));