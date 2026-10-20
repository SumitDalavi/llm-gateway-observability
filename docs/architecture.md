# Architecture — llm-gateway-observability
> Last updated: 2026-08-29 | Maturity: Full Prototype
> _Observability layer and proxy gateway for LLM requests._

## System Diagram
The following Mermaid.js sequence diagram maps the core workflow and interactions:

```mermaid
flowchart TD
    App(["User Application"])
    Gateway["Gateway API"]
    Otel["OpenTelemetry Collector"]
    Prometheus[("Prometheus")]
    Grafana["Grafana"]
    LLM["Upstream LLMs (OpenAI/Anthropic)"]

    App -->|"Request (w/ Auth & Tenant ID)"| Gateway
    Gateway -->|"Rate Limit Check"| Gateway
    Gateway -->|"Execute Request"| LLM
    LLM -->|"Response"| Gateway
    Gateway -->|"Emit Traces/Metrics"| Otel
    Otel -->|"Export Metrics"| Prometheus
    Prometheus -->|"Visualize"| Grafana
    Gateway -->|"Response"| App
```

## Component Table

| Component | File | Responsibility | Tech |
|---|---|---|---|
| Gateway Server | `src/server.ts` | Express server acting as the proxy | TypeScript/Node.js |
| Telemetry Engine | `src/telemetry.ts` | OTel instrumentation (Traces & Metrics) | OpenTelemetry |
| Rate Limiter | `src/rateLimit.ts` | Enforces tenant-level quotas | Redis/In-Memory |

## Port Assignments

| Service | Port | Notes |
|---|---|---|
| Gateway API | `3000` | Main entrypoint |
| OTel Collector | `4317` | gRPC receiver |
| Prometheus | `9090` | Metrics store |
| Grafana | `3001` | Dashboard UI |

## Dependency Honesty Table

| Dependency | Status | Notes |
|---|---|---|
| OpenTelemetry | **Real** | Full OTel stack configured via Docker Compose. |
| Upstream LLMs | **Optional** | E2E provider contract tests hit real APIs; unit tests use mocks. |


## Component Breakdown
- **Core Technology**: TypeScript, Redis, OpenTelemetry, Grafana
- **Design Paradigm**: Emphasizes high availability, fault tolerance, and security.

## Progressive Credential Loading & Production Architecture (v0.2.0)

This service implements the **Progressive Credential Loading (PCL)** pattern, decoupling development speed from external infrastructure provisioning:

```mermaid
graph LR
    Env[Environment Credentials] -->|Detect Keys & URLs| Detector[Credential Detector]
    Detector -->|No Credentials / Missing| Mock[Mock Mode Factory]
    Detector -->|Valid Credentials Present| Live[Live Provider Factory]
    Mock --> Runtime[Application Core & /health]
    Live --> Runtime
```

### Core Architecture Components
1. **Mode Detection Singleton:** Inspects environment configuration at boot time without hard crashes on missing secrets.
2. **Dual-Mode Factory Wrappers:**
   - **Storage / Cache:** In-process maps or SQLite `:memory:` transparently promote to managed Redis or PostgreSQL when connection strings are supplied.
   - **AI Providers:** Deterministic heuristic generators and local embeddings transparently promote to live OpenAI, Anthropic, or Gemini API clients.
3. **Hot-Reload & Dynamic TLS:** File watchers monitor mounted volume paths (Kubernetes ConfigMaps and Secrets) to update certificates and limit configs atomically without process restarts.
4. **Health & Observability:** The `/health` endpoint exposes real-time runtime mode metadata (`mock` vs `live`) across all backing adapters.
