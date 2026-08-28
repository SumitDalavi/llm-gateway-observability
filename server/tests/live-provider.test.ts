import { callProvider } from '../src/gateway/provider';

describe('Live Provider Contract Test', () => {
  it('should successfully call OpenAI if OPENAI_API_KEY is provided', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('Skipping live OpenAI test: OPENAI_API_KEY not set');
      return;
    }
    
    // We expect this to return a valid string response from OpenAI
    const response = await callProvider('openai', 'gpt-4o-mini', 'Say "hello world" in lowercase only.', apiKey);
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('hello world');
  }, 15000); // 15s timeout for network call

  it('should successfully call Anthropic if ANTHROPIC_API_KEY is provided', async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('Skipping live Anthropic test: ANTHROPIC_API_KEY not set');
      return;
    }
    
    const response = await callProvider('anthropic', 'claude-3-haiku-20240307', 'Say "hello world" in lowercase only.', apiKey);
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('hello world');
  }, 15000);
});
