import { callProvider, Provider } from "./provider";
import { recordFallback, recordRequest, recordError } from "../observability/metrics";

interface RouteConfig {
  provider: Provider;
  model: string;
  apiKey: string;
}

/**
 * Executes a call with fallback logic. If the primary route fails, it automatically
 * attempts the secondary route.
 */
export async function executeWithFallback(
  teamId: string,
  prompt: string, 
  primary: RouteConfig, 
  secondary: RouteConfig,
  simulateOutage: boolean
): Promise<{ content: string; providerUsed: string }> {
  
  try {
    if (simulateOutage) {
      throw new Error("Simulated Outage: Primary Provider Unavailable (503)");
    }
    
    const start = Date.now();
    const content = await callProvider(primary.provider, primary.model, prompt, primary.apiKey);
    const latency = Date.now() - start;
    recordRequest(teamId, primary.provider, latency);
    return { content, providerUsed: primary.provider };
  } catch (err: any) {
    console.warn(`Primary provider ${primary.provider} failed: ${err.message}. Falling back to ${secondary.provider}...`);
    recordError(teamId, primary.provider);
    recordFallback(teamId);
    
    // Attempt secondary route
    const start = Date.now();
    const content = await callProvider(secondary.provider, secondary.model, prompt, secondary.apiKey);
    const latency = Date.now() - start;
    recordRequest(teamId, secondary.provider, latency);
    
    return { content, providerUsed: secondary.provider };
  }
}
