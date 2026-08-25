// Real-time tracking of metrics for the dashboard

interface GlobalMetrics {
  totalRequests: number;
  totalErrors: number;
  totalFallbacks: number;
  latencies: number[];
  providerUsage: Record<string, number>;
  teamUsage: Record<string, number>;
}

const metrics: GlobalMetrics = {
  totalRequests: 0,
  totalErrors: 0,
  totalFallbacks: 0,
  latencies: [],
  providerUsage: {},
  teamUsage: {}
};

export function recordRequest(teamId: string, provider: string, latencyMs: number) {
  metrics.totalRequests++;
  
  if (!metrics.providerUsage[provider]) metrics.providerUsage[provider] = 0;
  metrics.providerUsage[provider]++;
  
  if (!metrics.teamUsage[teamId]) metrics.teamUsage[teamId] = 0;
  metrics.teamUsage[teamId]++;
  
  // Keep last 1000 latencies for memory safety
  metrics.latencies.push(latencyMs);
  if (metrics.latencies.length > 1000) metrics.latencies.shift();
}

export function recordError(teamId: string, provider: string) {
  metrics.totalErrors++;
}

export function recordFallback(teamId: string) {
  metrics.totalFallbacks++;
}

export function getMetrics() {
  // Calculate P50 and P95
  const sorted = [...metrics.latencies].sort((a, b) => a - b);
  let p50 = 0;
  let p95 = 0;
  
  if (sorted.length > 0) {
    p50 = sorted[Math.floor(sorted.length * 0.50)];
    p95 = sorted[Math.floor(sorted.length * 0.95)];
  }

  return {
    ...metrics,
    p50Latency: p50,
    p95Latency: p95,
    // don't send raw array to client
    latencies: undefined 
  };
}
