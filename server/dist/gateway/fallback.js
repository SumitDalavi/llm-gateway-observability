"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithFallback = void 0;
const provider_1 = require("./provider");
const metrics_1 = require("../observability/metrics");
/**
 * Executes a call with fallback logic. If the primary route fails, it automatically
 * attempts the secondary route.
 */
async function executeWithFallback(teamId, prompt, primary, secondary, simulateOutage) {
    try {
        if (simulateOutage) {
            throw new Error("Simulated Outage: Primary Provider Unavailable (503)");
        }
        const start = Date.now();
        const content = await (0, provider_1.callProvider)(primary.provider, primary.model, prompt, primary.apiKey);
        const latency = Date.now() - start;
        (0, metrics_1.recordRequest)(teamId, primary.provider, latency);
        return { content, providerUsed: primary.provider };
    }
    catch (err) {
        console.warn(`Primary provider ${primary.provider} failed: ${err.message}. Falling back to ${secondary.provider}...`);
        (0, metrics_1.recordError)(teamId, primary.provider);
        (0, metrics_1.recordFallback)(teamId);
        // Attempt secondary route
        const start = Date.now();
        const content = await (0, provider_1.callProvider)(secondary.provider, secondary.model, prompt, secondary.apiKey);
        const latency = Date.now() - start;
        (0, metrics_1.recordRequest)(teamId, secondary.provider, latency);
        return { content, providerUsed: secondary.provider };
    }
}
exports.executeWithFallback = executeWithFallback;
