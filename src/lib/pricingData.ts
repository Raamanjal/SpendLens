
// Every URL must go in PRICING_DATA.md

import type { ToolDefinition } from '@/types';

export const TOOLS: Record<string, ToolDefinition> = {
  cursor: {
    label: 'Cursor',
    plans: {
      hobby: {
        label:   'Hobby',
        monthly: 0,
        perSeat: false,
        // https://cursor.sh/pricing
      },
      pro: {
        label:   'Pro',
        monthly: 20,
        perSeat: true,
      },
      business: {
        label:   'Business',
        monthly: 40,
        perSeat: true,
      },
      enterprise: {                           
      label: 'Enterprise', 
      monthly: null, 
      perSeat: true,
      },
    },
  },

  github_copilot: {
    label: 'GitHub Copilot',
    plans: {
      individual: {
        label:   'Individual',
        monthly: 10,
        perSeat: true,
        // https://github.com/features/copilot#pricing
      },
      business: {
        label:   'Business',
        monthly: 19,
        perSeat: true,
      },
      enterprise: {
        label:   'Enterprise',
        monthly: 39,
        perSeat: true,
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
        // https://claude.ai/upgrade
      },
      pro: {
        label:   'Pro',
        monthly: 20,
        perSeat: true,
      },
      max: {
        label:   'Max',
        monthly: 100,
        perSeat: true,
      },
      team: {
        label:    'Team',
        monthly:  30,
        perSeat:  true,
        minSeats: 5,
      },
      enterprise: {
        label:   'Enterprise',
        monthly: null,
        perSeat: true,
      },
      api_direct: { 
        label: 'API Direct',
        monthly: null, 
        perSeat: false 
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
        // https://openai.com/chatgpt/pricing
      },
      plus: {
        label:   'Plus',
        monthly: 20,
        perSeat: true,
      },
      team: {
        label:    'Team',
        monthly:  30,
        perSeat:  true,
        minSeats: 2,
      },
      enterprise: {
        label:   'Enterprise',
        monthly: null,
        perSeat: true,
      },
      api_direct: {
        label: 'API Direct', 
        monthly: null, 
        perSeat: false, 
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
        // https://www.anthropic.com/pricing
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
        // https://openai.com/api/pricing
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
        // https://one.google.com/about/plans
      },
      pro: {
        label:   'Google One AI Premium',
        monthly: 20,
        perSeat: true,
      },
      ultra: { 
        label: 'Ultra',
        monthly: 30,
        perSeat: true  
      },
      api: {
        label:   'API (Pay-as-you-go)',
        monthly: null,
        perSeat: false,
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
        // https://windsurf.com/pricing
      },
      pro: {
        label:   'Pro',
        monthly: 15,
        perSeat: true,
      },
      teams: {
        label:   'Teams',
        monthly: 35,
        perSeat: true,
      },
    },
  },
};

export const USE_CASES = [
  { value: 'coding',   label: 'Coding / Engineering'  },
  { value: 'writing',  label: 'Writing / Content'     },
  { value: 'data',     label: 'Data / Analytics'      },
  { value: 'research', label: 'Research'              },
  { value: 'mixed',    label: 'Mixed / General'       },
] as const;

export const TOOL_LIST = Object.entries(TOOLS).map(([key, def]) => ({
  value: key,
  label: def.label,
}));