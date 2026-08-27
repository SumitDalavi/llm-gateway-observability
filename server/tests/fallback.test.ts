import { executeWithFallback } from '../src/gateway/fallback';
import * as provider from '../src/gateway/provider';

jest.mock('../src/gateway/provider');
jest.mock('../src/observability/metrics');

describe('Fallback', () => {
  const primary = { provider: 'openai' as any, model: 'gpt-4', apiKey: 'test' };
  const secondary = { provider: 'anthropic' as any, model: 'claude', apiKey: 'test' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses primary when successful', async () => {
    (provider.callProvider as jest.Mock).mockResolvedValue('success');
    
    const res = await executeWithFallback('t1', 'hello', primary, secondary, false);
    expect(res.content).toBe('success');
    expect(res.providerUsed).toBe('openai');
    expect(provider.callProvider).toHaveBeenCalledTimes(1);
  });

  it('uses secondary when primary fails', async () => {
    (provider.callProvider as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    (provider.callProvider as jest.Mock).mockResolvedValueOnce('fallback-success');
    
    const res = await executeWithFallback('t1', 'hello', primary, secondary, false);
    expect(res.content).toBe('fallback-success');
    expect(res.providerUsed).toBe('anthropic');
    expect(provider.callProvider).toHaveBeenCalledTimes(2);
  });

  it('simulates outage', async () => {
    (provider.callProvider as jest.Mock).mockResolvedValueOnce('fallback-success');
    
    const res = await executeWithFallback('t1', 'hello', primary, secondary, true);
    expect(res.content).toBe('fallback-success');
    expect(res.providerUsed).toBe('anthropic');
    // It should skip calling primary because simulateOutage throws early
    expect(provider.callProvider).toHaveBeenCalledTimes(1);
  });
});
