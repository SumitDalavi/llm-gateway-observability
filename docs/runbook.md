# Runbook — llm-gateway-observability
> Last updated: 2026-08-29

## Prerequisites
| Tool | Required Version | How to check |
|---|---|---|
| Node.js | >= 20 | `node -v` |
| Docker & Compose | Latest | `docker-compose version` |

## Quick Start
```bash
# Install dependencies
npm install

# Start observability stack and Gateway
docker-compose up -d

# Verify
curl http://localhost:3000/health
```

## Run Tests
```bash
# Unit tests
npm test

# E2E Provider Contract Test
bash tests/e2e/test_provider_contracts.sh
```

Expected output:
```
PASS  __tests__/telemetry.test.ts
PASS  __tests__/rateLimit.test.ts
```

## Environment Variables
| Variable | Default | Purpose |
|---|---|---|
| PORT | `3000` | HTTP port |
| OTEL_EXPORTER_OTLP_ENDPOINT | `http://localhost:4317` | OTel Collector address |
| OPENAI_API_KEY | - | Necessary for live provider contract tests |

## Common Failure Modes
| Symptom | Cause | Fix |
|---|---|---|
| Metrics not appearing in Grafana | OTel Collector down | `docker-compose restart otel-collector` |
| `429 Too Many Requests` | Rate limit hit | Wait for the quota window to reset or increase limit in config. |
