> **NOTE:** This repository is an archival lab or partial prototype. It is not actively maintained and should not be used as a reference for production-grade deployments or performance benchmarks.


# llm-gateway-observability

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
