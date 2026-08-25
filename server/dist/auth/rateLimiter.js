"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTokens = exports.checkRateLimit = void 0;
// In-Memory Token Bucket implementation for rate limiting
const buckets = {};
const TEAM_CONFIGS = {
    "team-frontend": { maxTokens: 100, refillRatePerSecond: 10 },
    "team-backend": { maxTokens: 50, refillRatePerSecond: 5 },
    "team-data": { maxTokens: 500, refillRatePerSecond: 50 },
};
function checkRateLimit(teamId, tokensRequested) {
    const config = TEAM_CONFIGS[teamId] || { maxTokens: 10, refillRatePerSecond: 1 }; // default fallback
    const now = Date.now();
    if (!buckets[teamId]) {
        buckets[teamId] = { tokens: config.maxTokens, lastRefill: now };
    }
    const bucket = buckets[teamId];
    // Refill
    const timePassedSec = (now - bucket.lastRefill) / 1000;
    const newTokens = timePassedSec * config.refillRatePerSecond;
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + newTokens);
    bucket.lastRefill = now;
    if (bucket.tokens >= tokensRequested) {
        bucket.tokens -= tokensRequested;
        return { allowed: true, remaining: Math.floor(bucket.tokens) };
    }
    return { allowed: false, remaining: Math.floor(bucket.tokens) };
}
exports.checkRateLimit = checkRateLimit;
// A simple util for estimating tokens from prompt length
function estimateTokens(text) {
    return Math.ceil(text.length / 4); // rough approximation
}
exports.estimateTokens = estimateTokens;
