
import { TOOLS, TOOL_LIST, USE_CASES } from '@/lib/pricingData';

describe('Jest setup', () => {

  it('runs correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('resolves @/ path alias', () => {
    expect(TOOLS).toBeDefined();
    expect(TOOLS.cursor).toBeDefined();
    expect(TOOLS.claude).toBeDefined();
  });

  it('pricingData has all 8 required tools', () => {
    const requiredTools = [
      'cursor',
      'github_copilot',
      'claude',
      'chatgpt',
      'anthropic_api',
      'openai_api',
      'gemini',
      'windsurf',
    ];
    requiredTools.forEach(tool => {
      expect(TOOLS[tool]).toBeDefined();
    });
  });

  it('every tool has a label and at least one plan', () => {
    Object.entries(TOOLS).forEach(([key, def]) => {
      expect(typeof def.label).toBe('string');
      expect(Object.keys(def.plans).length).toBeGreaterThan(0);
    });
  });

  it('every plan has required fields', () => {
    Object.entries(TOOLS).forEach(([_toolKey, def]) => {
      Object.entries(def.plans).forEach(([_planKey, plan]) => {
        expect(typeof plan.label).toBe('string');
        expect(typeof plan.perSeat).toBe('boolean');
        // monthly is either a number or null
        expect(
          typeof plan.monthly === 'number' || plan.monthly === null
        ).toBe(true);
      });
    });
  });

  it('TOOL_LIST has correct shape', () => {
    expect(Array.isArray(TOOL_LIST)).toBe(true);
    TOOL_LIST.forEach(item => {
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('label');
    });
  });

  it('USE_CASES has all 5 options', () => {
    const values = USE_CASES.map(u => u.value);
    expect(values).toContain('coding');
    expect(values).toContain('writing');
    expect(values).toContain('data');
    expect(values).toContain('research');
    expect(values).toContain('mixed');
  });

});