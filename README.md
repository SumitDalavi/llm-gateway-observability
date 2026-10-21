# LLM Gateway Observability 🔍

[![CI Pipeline](https://github.com/SumitDalavi/llm-gateway-observability/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/llm-gateway-observability/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/llm-gateway-observability?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/llm-gateway-observability/releases)
[![Release Workflow](https://github.com/SumitDalavi/llm-gateway-observability/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/llm-gateway-observability/actions/workflows/release.yml)
[![GHCR Container](https://img.shields.io/badge/ghcr.io-v0.2.0-blue?logo=docker&logoColor=white)](https://github.com/SumitDalavi/llm-gateway-observability/pkgs/container/llm-gateway-observability)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/llm-gateway-observability/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Observability layer and proxy gateway for LLM requests, tracking token usage, latency, and standardizing traces.

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
Please see the [Architecture Document](docs/ARCHITECTURE.md) for sequence diagrams and system design details.

---

## Mock Boundaries (Honest Scope)

| What | Status | Details |
|---|---|---|
| OpenTelemetry | **Real** | Full OTel stack configured via Docker Compose. |
| Upstream LLMs | **Optional** | E2E provider contract tests hit real APIs; unit tests use mocks. |
| Redis (Rate Limiter) | **Optional** | Simulated using in-memory structures for deterministic local execution, swappable for real Redis. |

## 🚀 Progressive Credential Loading & Execution Tiers

This project implements **Progressive Credential Loading (PCL)**, allowing it to run immediately out-of-the-box without external dependencies while seamlessly upgrading as credentials are provided.

### Tier 1: Zero-Config Mock Mode (Default)
Ideal for CI, testing, and rapid local evaluation.
- **Execution:** Run with default configuration (`cp .env.example .env`). Zero API keys, databases, or cloud credentials required.
- **Fallback Behavior:** In-memory caches, deterministic offline heuristics, mock vector embeddings, and local mock storage are automatically used.
- **Health Verification:** Endpoints report `{"mode": "mock"}` for unconfigured dependencies.

### Tier 2: Local Development with Live Services
Connect specific external services while keeping others mocked.
- **Execution:** Provide credentials in `.env` for the services you want active (e.g., `OPENAI_API_KEY, ANTHROPIC_API_KEY, OTLP_TRACE_URL`).
- **Progressive Upgrade:** The runtime inspects environment variables on boot and dynamically promotes only configured modules to live mode.
- **Safe Fallback:** Any missing credentials automatically remain on mock fallbacks with no crashes or missing service errors.

### Tier 3: Production Hardened
Enterprise deployment with production-grade backends, security scans, and container distributions.
- **Release Distribution:** Download standalone release bundle and verified checksums:
  ```bash
  gh release download v0.2.0 --repo SumitDalavi/llm-gateway-observability
  ```
- **Integrity & Security:** Checksums and SPDX SBOM (`sbom.spdx.json`) available on [GitHub Releases](https://github.com/SumitDalavi/llm-gateway-observability/releases).

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System diagram and component details
- [Runbook](docs/runbook.md) — Setup, commands, and expected outputs
- [Decisions](docs/decisions.md) — ADRs for observability pattern choices
- [Changelog](docs/changelog.md) — Change history

## 🔒 Release & Security Verification

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
gh release view v0.2.0 --repo SumitDalavi/llm-gateway-observability

# Download and inspect SBOM
gh release download v0.2.0 --repo SumitDalavi/llm-gateway-observability --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .
```

## 👨‍💻 Author

**Sumit Dalavi** — Senior DevSecOps / Platform Engineer
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

---
*Built with a focus on robust patterns, not toy demos.*
