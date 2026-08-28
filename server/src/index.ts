import './telemetry';
import 'dotenv/config';
// @ts-nocheck
import express = require('express');
import cors = require('cors');
import { executeWithFallback } from './gateway/fallback';
import { checkRateLimit, estimateTokens } from './auth/rateLimiter';
import { checkBudget, deductBudget, getBudgets, getBudgetConfigs } from './auth/budget';
import { getMetrics } from './observability/metrics';
import { Provider } from './gateway/provider';

export const app = express();
app.use(cors());
app.use(express.json());

// --- GATEWAY ENDPOINT ---

app.post('/v1/chat/completions', async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
  
  // E.g. "Bearer team-frontend-key" -> "team-frontend"
  const token = authHeader.split(" ")[1];
  const teamId = token.split("-key")[0]; // Simple mock logic to extract team ID from token

  const { messages, simulateOutage } = req.body;
  if (!messages) return res.status(400).json({ error: "Missing messages" });

  const prompt = messages[messages.length - 1].content;
  const estimatedTokens = estimateTokens(prompt);

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(teamId, estimatedTokens);
  if (!rateLimit.allowed) {
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    return res.status(429).json({ error: "Rate limit exceeded (Tokens per Minute)" });
  }

  // 2. Budget Check
  if (!checkBudget(teamId)) {
    return res.status(429).json({ error: "Team budget exceeded. Please request a budget increase." });
  }

  // 3. Define Routes (Primary: OpenAI, Secondary: Anthropic)
  const primary = {
    provider: "openai" as Provider,
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY || "mock-key",
  };
  
  const secondary = {
    provider: "anthropic" as Provider,
    model: "claude-3-haiku-20240307",
    apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
  };

  try {
    // 4. Execute through Gateway Engine
    const { content, providerUsed } = await executeWithFallback(teamId, prompt, primary, secondary, simulateOutage);

    // 5. Deduct Budget
    const responseTokens = estimateTokens(content);
    deductBudget(teamId, providerUsed, estimatedTokens + responseTokens);

    res.json({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: estimatedTokens, completion_tokens: responseTokens },
      _gateway: {
        provider_used: providerUsed,
        budget_status: "Active"
      }
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN / DASHBOARD ENDPOINTS ---

app.get('/admin/metrics', (req: any, res: any) => {
  res.json({
    metrics: getMetrics(),
    budgets: getBudgets(),
    budgetConfigs: getBudgetConfigs()
  });
});

const PORT = process.env.PORT || 4003;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LLM Gateway running on port ${PORT}`);
  });
}
