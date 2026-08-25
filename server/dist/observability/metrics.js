"use strict";
// Real-time tracking of metrics for the dashboard
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = exports.recordFallback = exports.recordError = exports.recordRequest = void 0;
const metrics = {
    totalRequests: 0,
    totalErrors: 0,
    totalFallbacks: 0,
    latencies: [],
    providerUsage: {},
    teamUsage: {}
};
function recordRequest(teamId, provider, latencyMs) {
    metrics.totalRequests++;
    if (!metrics.providerUsage[provider])
        metrics.providerUsage[provider] = 0;
    metrics.providerUsage[provider]++;
    if (!metrics.teamUsage[teamId])
        metrics.teamUsage[teamId] = 0;
    metrics.teamUsage[teamId]++;
    // Keep last 1000 latencies for memory safety
    metrics.latencies.push(latencyMs);
    if (metrics.latencies.length > 1000)
        metrics.latencies.shift();
}
exports.recordRequest = recordRequest;
function recordError(teamId, provider) {
    metrics.totalErrors++;
}
exports.recordError = recordError;
function recordFallback(teamId) {
    metrics.totalFallbacks++;
}
exports.recordFallback = recordFallback;
function getMetrics() {
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
exports.getMetrics = getMetrics;
