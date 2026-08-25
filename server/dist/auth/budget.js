"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetConfigs = exports.getBudgets = exports.deductBudget = exports.checkBudget = void 0;
// In-Memory Budget tracking (USD)
const budgets = {};
const BUDGET_CONFIGS = {
    "team-frontend": { maxSpendUSD: 10.0 }, // $10 limit
    "team-backend": { maxSpendUSD: 50.0 },
    "team-data": { maxSpendUSD: 100.0 },
};
// Extremely rough mock pricing per 1k tokens
const PRICING = {
    "openai": 0.002,
    "anthropic": 0.003
};
function checkBudget(teamId) {
    const config = BUDGET_CONFIGS[teamId] || { maxSpendUSD: 1.0 };
    const currentSpend = budgets[teamId] || 0;
    return currentSpend < config.maxSpendUSD;
}
exports.checkBudget = checkBudget;
function deductBudget(teamId, provider, tokensUsed) {
    if (!budgets[teamId])
        budgets[teamId] = 0;
    const costPer1k = PRICING[provider] || 0.002;
    const cost = (tokensUsed / 1000) * costPer1k;
    budgets[teamId] += cost;
}
exports.deductBudget = deductBudget;
function getBudgets() {
    return budgets;
}
exports.getBudgets = getBudgets;
function getBudgetConfigs() {
    return BUDGET_CONFIGS;
}
exports.getBudgetConfigs = getBudgetConfigs;
