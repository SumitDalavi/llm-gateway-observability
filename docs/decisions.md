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
