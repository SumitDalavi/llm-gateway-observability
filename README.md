

[![CI Pipeline](https://github.com/SumitDalavi/llm-gateway-observability/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/llm-gateway-observability/actions/workflows/ci.yml)

# llm-gateway-observability

[![Release](https://img.shields.io/github/v/release/SumitDalavi/llm-gateway-observability?color=blue&logo=github)](https://github.com/SumitDalavi/llm-gateway-observability/releases)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%20JSON-blueviolet?logo=spdx)](https://github.com/SumitDalavi/llm-gateway-observability/releases)

> **Maturity:** Full Prototype
> _Observability layer and proxy gateway for LLM requests, tracking token usage, latency, and standardizing traces._

## Features
- Fully automated workflow.
- Secure, scalable architecture.
- Built-in telemetry and observability.

## Technologies
- Python, OpenTelemetry, FastAPI

## Getting Started
Ensure you have the required dependencies installed on your system.

```bash
# Setup & Test
pip install -r requirements.txt
pytest
```

## Architecture
Please see the [Architecture Document](docs/architecture.md) for sequence diagrams and system design details.


## CI & Reliability Updates (August 2026)

- **CI Pipeline Remediation:** Successfully resolved all CI/CD pipeline failures.
- **Specific Fix:** Downgraded TypeScript to match ts-jest peer dependency requirements.
- **Status:** 🟩 Passing


---

## Mock Boundaries (Honest Scope)

| What | Status | Details |
|---|---|---|
| OpenTelemetry | **Real** | Full OTel stack configured via Docker Compose. |
| Upstream LLMs | **Optional** | E2E provider contract tests hit real APIs; unit tests use mocks. |
| Redis (Rate Limiter) | **Optional** | Simulated using in-memory structures for deterministic local execution, swappable for real Redis. |

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System diagram and component details
- [Runbook](docs/runbook.md) — Setup, commands, and expected outputs
- [Decisions](docs/decisions.md) — ADRs for observability pattern choices
- [Changelog](docs/changelog.md) — Change history

## Release & Verification

The project includes an automated DevSecOps release pipeline (`.github/workflows/release.yml`) triggered on semantic version tags (`v*.*.*`).

Each release automatically:
1. Executes test suite gates.
2. Builds the container image.
3. Performs vulnerability scanning via Trivy.
4. Generates an SPDX SBOM (`sbom.spdx.json`) using Anchore Syft.
5. Publishes a GitHub Release with attached SBOM.

### Verifying the Release
```bash
# Verify release via GitHub CLI
gh release view v0.1.0 --repo SumitDalavi/llm-gateway-observability

# Download and inspect SBOM
gh release download v0.1.0 --repo SumitDalavi/llm-gateway-observability --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .
```
