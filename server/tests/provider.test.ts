import { callProvider } from '../src/gateway/provider';
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

jest.mock("@langchain/openai");
jest.mock("@langchain/anthropic");

describe('Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls openai', async () => {
    (ChatOpenAI as any).mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({ content: 'openai response' })
    }));

    const res = await callProvider('openai', 'gpt-4', 'hello', 'key');
    expect(res).toBe('openai response');
  });

  it('calls anthropic', async () => {
    (ChatAnthropic as any).mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({ content: 'anthropic response' })
    }));

    const res = await callProvider('anthropic', 'claude', 'hello', 'key');
    expect(res).toBe('anthropic response');
  });

  it('throws for unsupported provider', async () => {
    await expect(callProvider('unknown' as any, 'model', 'hello', 'key')).rejects.toThrow('Unsupported provider');
  });
});
