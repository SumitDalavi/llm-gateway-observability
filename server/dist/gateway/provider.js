"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callProvider = void 0;
const openai_1 = require("@langchain/openai");
const anthropic_1 = require("@langchain/anthropic");
async function callProvider(provider, modelName, prompt, apiKey) {
    let model;
    if (provider === "openai") {
        model = new openai_1.ChatOpenAI({
            modelName: modelName,
            openAIApiKey: apiKey,
            temperature: 0.7,
        });
    }
    else if (provider === "anthropic") {
        model = new anthropic_1.ChatAnthropic({
            modelName: modelName,
            anthropicApiKey: apiKey,
            temperature: 0.7,
        });
    }
    else {
        throw new Error(`Unsupported provider: ${provider}`);
    }
    const response = await model.invoke([
        ["user", prompt]
    ]);
    return response.content;
}
exports.callProvider = callProvider;
