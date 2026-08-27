import { checkRateLimit, estimateTokens } from '../src/auth/rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // We could mock Date.now() but tests can run normally too.
  });

  it('estimates tokens correctly', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcde')).toBe(2);
  });

  it('allows request within limit', () => {
    const res = checkRateLimit('team-frontend', 10);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(90); // 100 - 10
  });

  it('denies request over limit', () => {
    const res = checkRateLimit('team-backend', 100);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(50); // initial 50
  });

  it('refills tokens over time', async () => {
    // drain
    checkRateLimit('team-data', 500); 
    let res = checkRateLimit('team-data', 10);
    expect(res.allowed).toBe(false); // 0 remaining

    // mock time
    const realDateNow = Date.now.bind(global.Date);
    global.Date.now = jest.fn(() => realDateNow() + 1000); // 1 sec later (50 tokens)

    res = checkRateLimit('team-data', 10);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(40);

    global.Date.now = realDateNow;
  });

  it('uses default config for unknown team', () => {
    const res = checkRateLimit('unknown-team', 5);
    expect(res.allowed).toBe(true);
  });
});
