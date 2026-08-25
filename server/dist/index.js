"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fallback_1 = require("./gateway/fallback");
const rateLimiter_1 = require("./auth/rateLimiter");
const budget_1 = require("./auth/budget");
const metrics_1 = require("./observability/metrics");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- GATEWAY ENDPOINT ---
app.post('/v1/chat/completions', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Missing Authorization header" });
    // E.g. "Bearer team-frontend-key" -> "team-frontend"
    const token = authHeader.split(" ")[1];
    const teamId = token.split("-key")[0]; // Simple mock logic to extract team ID from token
    const { messages, simulateOutage } = req.body;
    if (!messages)
        return res.status(400).json({ error: "Missing messages" });
    const prompt = messages[messages.length - 1].content;
    const estimatedTokens = (0, rateLimiter_1.estimateTokens)(prompt);
    // 1. Rate Limiting Check
    const rateLimit = (0, rateLimiter_1.checkRateLimit)(teamId, estimatedTokens);
    if (!rateLimit.allowed) {
        res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
        return res.status(429).json({ error: "Rate limit exceeded (Tokens per Minute)" });
    }
    // 2. Budget Check
    if (!(0, budget_1.checkBudget)(teamId)) {
        return res.status(429).json({ error: "Team budget exceeded. Please request a budget increase." });
    }
    // 3. Define Routes (Primary: OpenAI, Secondary: Anthropic)
    const primary = {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: process.env.OPENAI_API_KEY || "mock-key",
    };
    const secondary = {
        provider: "anthropic",
        model: "claude-3-haiku-20240307",
        apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
    };
    try {
        // 4. Execute through Gateway Engine
        const { content, providerUsed } = await (0, fallback_1.executeWithFallback)(teamId, prompt, primary, secondary, simulateOutage);
        // 5. Deduct Budget
        const responseTokens = (0, rateLimiter_1.estimateTokens)(content);
        (0, budget_1.deductBudget)(teamId, providerUsed, estimatedTokens + responseTokens);
        res.json({
            choices: [{ message: { content } }],
            usage: { prompt_tokens: estimatedTokens, completion_tokens: responseTokens },
            _gateway: {
                provider_used: providerUsed,
                budget_status: "Active"
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- ADMIN / DASHBOARD ENDPOINTS ---
app.get('/admin/metrics', (req, res) => {
    res.json({
        metrics: (0, metrics_1.getMetrics)(),
        budgets: (0, budget_1.getBudgets)(),
        budgetConfigs: (0, budget_1.getBudgetConfigs)()
    });
});
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
    console.log(`LLM Gateway running on port ${PORT}`);
});
