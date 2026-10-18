# Changelog

## [v0.1.0] — 2026-10-18
### Added
- Automated DevSecOps release pipeline triggering on `v*.*.*` git tags.
- Container image build targeting GitHub Container Registry (`ghcr.io`).
- Trivy vulnerability scanning step with vulnerability reporting.
- Anchore Syft SPDX-JSON SBOM artifact generation.
- Automated GitHub Release publication with attached `sbom.spdx.json`.


## [2026-08-29] — Phase 2 Evidence
### Added
- Added `tests/e2e/test_provider_contracts.sh` script to verify live provider contract tests.
- Added reproducible benchmark evidence `benchmarks/results/rate_limit_metrics.json` demonstrating durable rate limit enforcement.
- Standardized documentation (`runbook.md`, `decisions.md`, `ARCHITECTURE.md`).
- Added maturity badge and standard mock boundaries to `README.md`.
