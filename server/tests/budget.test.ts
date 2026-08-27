import { checkBudget, deductBudget, getBudgets, getBudgetConfigs } from '../src/auth/budget';

describe('Budget checks', () => {
  it('returns default config for unknown team', () => {
    expect(checkBudget('unknown')).toBe(true);
  });

  it('deducts budget correctly', () => {
    deductBudget('unknown', 'openai', 1000);
    const budgets = getBudgets();
    expect(budgets['unknown']).toBe(0.002);
  });

  it('denies when over budget', () => {
    deductBudget('test-team', 'openai', 1000000); // 1 million tokens = $2.00
    // actually, let's max it out
    deductBudget('test-team', 'openai', 50000000); // $100
    const configs = getBudgetConfigs();
    configs['test-team'] = { maxSpendUSD: 1.0 };
    expect(checkBudget('test-team')).toBe(false);
  });
  
  it('deducts default cost if provider unknown', () => {
    deductBudget('new-team', 'unknown-provider', 1000);
    const budgets = getBudgets();
    expect(budgets['new-team']).toBe(0.002);
  });
});
