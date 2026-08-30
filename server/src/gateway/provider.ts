// @ts-nocheck
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type Provider = "openai" | "anthropic";

export async function callProvider(provider: Provider, modelName: string, prompt: string, apiKey: string): Promise<string> {
  if (apiKey.startsWith("sk-dummy")) {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 500));
    return `[Mock Response from ${provider}] Processed prompt: "${prompt.substring(0, 50)}..."`;
  }

  let model: BaseChatModel;
  
  if (provider === "openai") {
    model = new ChatOpenAI({
      modelName: modelName,
      openAIApiKey: apiKey,
      temperature: 0.7,
    });
  } else if (provider === "anthropic") {
    model = new ChatAnthropic({
      modelName: modelName,
      anthropicApiKey: apiKey,
      temperature: 0.7,
    });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const response = await model.invoke([
    ["user", prompt]
  ]);
  
  return response.content as string;
}
