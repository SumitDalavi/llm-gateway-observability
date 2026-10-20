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

## Release Runbook

### Triggering a New Release
Releases are automated via GitHub Actions (`.github/workflows/release.yml`) and trigger whenever a semantic version tag is pushed:

```bash
# 1. Ensure master is clean and up-to-date
git checkout master
git pull origin master

# 2. Tag the release
git tag -a v0.2.0 -m "Release v0.2.0"

# 3. Push the tag to trigger the pipeline
git push origin v0.2.0
```

### Release Pipeline Stages
1. **Test Verification:** Runs project test suite gates prior to container build.
2. **Container Image Build:** Builds the production container image (`ghcr.io/sumitdalavi/llm-gateway-observability:<tag>`).
3. **Trivy Vulnerability Scan:** Scans the built container for CRITICAL and HIGH CVEs via Aqua Security Trivy.
4. **Anchore Syft SBOM Generation:** Creates an SPDX JSON Software Bill of Materials (`sbom.spdx.json`).
5. **GitHub Release Publishing:** Creates the release with auto-generated release notes and attaches `sbom.spdx.json`.

### Verifying the Release
```bash
# Check workflow run status
gh run list --workflow=release.yml --repo SumitDalavi/llm-gateway-observability

# Inspect the published release and attached assets
gh release view v0.1.0 --repo SumitDalavi/llm-gateway-observability

# Download and inspect the SBOM
gh release download v0.1.0 --repo SumitDalavi/llm-gateway-observability -p "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

### Release Failure Modes
| Symptom | Cause | Resolution |
|---|---|---|
| `Unable to resolve action ... unable to find version` | Pinned action tag missing or upstream tag modified | Pin action to a verified release tag (`@v0.36.0`) or commit SHA |
| `invalid reference format: repository name must be lowercase` | Container repository owner contains uppercase characters | Lowercase the repository owner before tagging (`tr '[:upper:]' '[:lower:]'`) |
| `File not found: sbom.spdx.json` during release step | SBOM action configured with `artifact-name` instead of `output-file` | Ensure `output-file: sbom.spdx.json` is set in Anchore action |

## Operations & Diagnostics Guide (v0.2.0)

### Mode Verification & Diagnostics
Inspect the active execution mode and backing provider status via the health endpoint:
```bash
# Check runtime mode and adapter status
curl -s http://localhost:8080/health | jq .
# Expected output when running without keys:
# {"status": "ok", "mode": {"database": "mock", "ai": "mock", "cache": "mock"}}
```

### Running in Mock Mode (Tier 1)
Start the service with zero external dependencies:
```bash
cp .env.example .env
# Start service without modifying .env
npm start || python main.py || go run .
```

### Running with Live Credentials (Tier 2 / 3)
Populate target credentials in `.env` and restart:
```bash
# Verify live upgrade via health check
curl -s http://localhost:8080/health | jq .mode
```

### Pulling Pre-Built OCI Image
```bash
docker pull ghcr.io/sumitdalavi/llm-gateway-observability:v0.2.0
docker run -d -p 8080:8080 --env-file .env ghcr.io/sumitdalavi/llm-gateway-observability:v0.2.0
```
