# Decisions

## ADR-001: OpenTelemetry for Observability
**Date:** 2026-08-29  
**Status:** Accepted

**Context:**  
We need to capture latency, token counts, and cost metrics for every LLM request passing through the gateway.

**Decision:**  
We will use the OpenTelemetry (OTel) standard, instrumenting the Node.js application to emit spans and metrics to an OTel Collector, which then exports to Prometheus.

**Consequences:**  
- ✅ Vendor neutral. We can switch from Prometheus/Grafana to Datadog or Honeycomb by simply changing the OTel Collector config, requiring zero code changes in the gateway.
- ✅ Standardized semantic conventions for GenAI (e.g., `gen_ai.usage.prompt_tokens`).
- ⚠️ Slight performance overhead to serialize and export spans over gRPC, mitigated by batching in the OTel SDK.

## ADR-002: Progressive Credential Loading (PCL) Architecture
- **Context:** Production hardening required live backends (PostgreSQL, Redis, OpenAI, Anthropic), but removing mocks would break CI pipelines and create high developer onboarding friction.
- **Decision:** Implement Progressive Credential Loading. Keep in-memory and local mock heuristics as the default safe baseline, while wrapping external integrations in auto-promoting factory adapters triggered by environment variables.
- **Consequences:** 
  - *Pros:* 100% CI pass rate without requiring external secrets; zero setup friction for new contributors; progressive upgrade to production clusters.
  - *Cons:* Adds lightweight factory abstraction layers and runtime credential detection logic.
