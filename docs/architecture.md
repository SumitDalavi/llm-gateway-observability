# Architecture: LLM Gateway with Fallback Routing

## System Diagram
The following Mermaid.js sequence diagram maps the core workflow and interactions:

```mermaid
sequenceDiagram
Client->>Gateway: Request
Gateway->>Redis: Check Token Bucket
Gateway->>OpenAI: Request (Primary)
OpenAI-->>Gateway: 503 Timeout
Gateway->>Anthropic: Request (Fallback)
Anthropic-->>Gateway: 200 OK
```

## Component Breakdown
- **Core Technology**: TypeScript, Redis, OpenTelemetry, Grafana
- **Design Paradigm**: Emphasizes high availability, fault tolerance, and security.
