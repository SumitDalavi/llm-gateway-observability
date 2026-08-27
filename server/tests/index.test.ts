// @ts-nocheck
const request = require('supertest');
import { app } from '../src/index';
import * as fallback from '../src/gateway/fallback';
import * as budget from '../src/auth/budget';
import * as rateLimiter from '../src/auth/rateLimiter';

jest.mock('../src/gateway/fallback');
jest.mock('../src/auth/budget');
jest.mock('../src/auth/rateLimiter');

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/chat/completions', () => {
    it('returns 401 if no auth header', async () => {
      const res = await request(app).post('/v1/chat/completions').send({});
      expect(res.status).toBe(401);
    });

    it('returns 400 if no messages', async () => {
      const res = await request(app)
        .post('/v1/chat/completions')
        .set('Authorization', 'Bearer team-1-key')
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 429 if rate limited', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({ allowed: false, remaining: 0 });
      (rateLimiter.estimateTokens as jest.Mock).mockReturnValue(10);
      
      const res = await request(app)
        .post('/v1/chat/completions')
        .set('Authorization', 'Bearer team-1-key')
        .send({ messages: [{ content: 'hello' }] });
      
      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Rate limit exceeded/);
    });

    it('returns 429 if budget exceeded', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({ allowed: true, remaining: 10 });
      (budget.checkBudget as jest.Mock).mockReturnValue(false);
      
      const res = await request(app)
        .post('/v1/chat/completions')
        .set('Authorization', 'Bearer team-1-key')
        .send({ messages: [{ content: 'hello' }] });
      
      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/budget exceeded/);
    });

    it('returns 200 on success', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({ allowed: true, remaining: 10 });
      (budget.checkBudget as jest.Mock).mockReturnValue(true);
      (fallback.executeWithFallback as jest.Mock).mockResolvedValue({ content: 'response', providerUsed: 'openai' });
      (rateLimiter.estimateTokens as jest.Mock).mockReturnValue(10);
      
      const res = await request(app)
        .post('/v1/chat/completions')
        .set('Authorization', 'Bearer team-1-key')
        .send({ messages: [{ content: 'hello' }] });
      
      expect(res.status).toBe(200);
      expect(res.body.choices[0].message.content).toBe('response');
      expect(res.body._gateway.provider_used).toBe('openai');
    });

    it('returns 500 on internal error', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({ allowed: true, remaining: 10 });
      (budget.checkBudget as jest.Mock).mockReturnValue(true);
      (fallback.executeWithFallback as jest.Mock).mockRejectedValue(new Error('Internal Failure'));
      
      const res = await request(app)
        .post('/v1/chat/completions')
        .set('Authorization', 'Bearer team-1-key')
        .send({ messages: [{ content: 'hello' }] });
      
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal Failure');
    });
  });

  describe('GET /admin/metrics', () => {
    it('returns metrics', async () => {
      (budget.getBudgets as jest.Mock).mockReturnValue({});
      (budget.getBudgetConfigs as jest.Mock).mockReturnValue({});
      
      const res = await request(app).get('/admin/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('metrics');
    });
  });
});
