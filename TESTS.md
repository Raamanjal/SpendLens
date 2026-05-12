# Tests

## Test Files

### `__tests__/smoke.test.ts`

Verifies the Jest setup and pricingData shape.

**Covers:**
- Jest runs correctly
- @/ path alias resolves
- All 8 required tools exist in pricingData
- Every tool has a label and at least one plan
- Every plan has required fields (label, monthly, perSeat)
- TOOL_LIST has correct shape
- USE_CASES has all 5 options

**Run:**
```bash
npm test -- __tests__/smoke.test.ts
```

---

### `__tests__/auditEngine.test.ts`

Core audit logic tests — the most important test file.

**Covers:**

Core engine behaviour:
- Empty tools array returns zero savings
- Annual saving equals monthly × 12
- potentialSaving never goes negative
- isHighSavings true when saving exceeds $500/mo
- isAlreadyOptimal true when saving under $10/mo
- Filters out incomplete tool entries
- Multiple tools — savings sum correctly

Cursor rules:
- Business for 1 user → downgrade
- Business for 2 users → downgrade
- Pro for solo dev → keep

Claude rules:
- Team Standard for 3 users → downgrade
- Team Premium for 2 users → downgrade
- Max for non-research solo → downgrade
- Max for research use case → keep
- Pro → keep

GitHub Copilot rules:
- Enterprise for small team → downgrade
- Pro+ for writing use case → downgrade
- Business for coding team → keep

ChatGPT rules:
- Pro for non-research → downgrade
- Pro for research → keep
- Business solo → downgrade

Gemini rules:
- Ultra for non-research → downgrade
- Ultra for research → keep

Windsurf rules:
- Teams for 1 user → downgrade
- Teams for 2 users → downgrade
- Pro → keep

API spend rules:
- High per-user Anthropic spend → optimize
- High total OpenAI spend → optimize
- Low API spend → keep

recommendedPlan assertions:
- Claude team standard → recommends Pro
- Cursor business → recommends Pro
- GitHub Copilot enterprise → recommends Business
- ChatGPT pro → recommends Plus
- Keep action → no recommended plan

Real-world test cases:
- Test Case 1: Small team on wrong Claude plan ($40 saving)
- Test Case 2: Multiple tools, high savings ($1025 saving)
- Test Case 3: Already optimal stack ($0 saving)

**Run:**
```bash
npm test -- __tests__/auditEngine.test.ts
```

---

## Run All Tests

```bash
npm test
```

## Run in Watch Mode

```bash
npm run test:watch
```

## Run in CI Mode

```bash
npm run test:ci
```

## Test Count

```
smoke.test.ts:       7 tests
auditEngine.test.ts: 34 tests
─────────────────────────────
Total:               41 tests
```