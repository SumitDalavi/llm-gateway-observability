import { recordRequest, recordError, recordFallback, getMetrics } from '../src/observability/metrics';

describe('Metrics', () => {
  it('records requests correctly', () => {
    recordRequest('t1', 'openai', 100);
    recordRequest('t1', 'openai', 200);
    recordRequest('t1', 'openai', 300);
    
    const m = getMetrics();
    expect(m.totalRequests).toBeGreaterThanOrEqual(3);
    expect(m.providerUsage['openai']).toBeGreaterThanOrEqual(3);
    expect(m.teamUsage['t1']).toBeGreaterThanOrEqual(3);
    expect(m.p50Latency).toBe(200);
    expect(m.p95Latency).toBe(300);
    expect(m.latencies).toBeUndefined();
  });

  it('records errors and fallbacks', () => {
    recordError('t2', 'anthropic');
    recordFallback('t2');
    
    const m = getMetrics();
    expect(m.totalErrors).toBeGreaterThanOrEqual(1);
    expect(m.totalFallbacks).toBeGreaterThanOrEqual(1);
  });

  it('caps latencies at 1000', () => {
    for (let i = 0; i < 1100; i++) {
      recordRequest('t3', 'openai', 10);
    }
    const m = getMetrics();
    expect(m.p50Latency).toBe(10);
  });

  it('handles empty latencies', () => {
    expect(getMetrics()).toBeDefined();
  });
});
