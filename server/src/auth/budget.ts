// In-Memory Budget tracking (USD)
const budgets: Record<string, number> = {};

export interface BudgetConfig {
  maxSpendUSD: number;
}

const BUDGET_CONFIGS: Record<string, BudgetConfig> = {
  "team-frontend": { maxSpendUSD: 10.0 }, // $10 limit
  "team-backend": { maxSpendUSD: 50.0 },
  "team-data": { maxSpendUSD: 100.0 },
  "test-team-exhausted": { maxSpendUSD: 0.0 }, // For demo scenario 2
};

// Extremely rough mock pricing per 1k tokens
const PRICING: Record<string, number> = {
  "openai": 0.002,
  "anthropic": 0.003
};

export function checkBudget(teamId: string): boolean {
  const config = BUDGET_CONFIGS[teamId] || { maxSpendUSD: 1.0 };
  const currentSpend = budgets[teamId] || 0;
  return currentSpend < config.maxSpendUSD;
}

export function deductBudget(teamId: string, provider: string, tokensUsed: number) {
  if (!budgets[teamId]) budgets[teamId] = 0;
  
  const costPer1k = PRICING[provider] || 0.002;
  const cost = (tokensUsed / 1000) * costPer1k;
  
  budgets[teamId] += cost;
}

export function getBudgets() {
  return budgets;
}

export function getBudgetConfigs() {
  return BUDGET_CONFIGS;
}
