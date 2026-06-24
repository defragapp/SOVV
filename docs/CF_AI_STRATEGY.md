# Sovereign.os AI Strategy

## Two-Lane Architecture

### Lane 1: Fast, Low-Cost Public Lane
- **Technology**: Cloudflare Workers AI
- **Primary Model**: `@cf/meta/llama-3.1-8b-instruct-fast`
- **Use Cases**: Standard Defrag outputs, Alignment suggestions, basic parsing, free-tier traffic.
- **Goal**: Maintain low latency and minimal cost for the most common operations.

### Lane 2: Premium, Metered Lane
- **Technology**: AI Gateway routing to higher-tier models (or premium Workers AI models if applicable).
- **Use Cases**: Covenant generation, long-form narrative exports, complex comparison flows, Pro-tier requests.
- **Goal**: Provide deeper, richer context for paying users while strictly managing costs.

## Implementation Guidelines

1. **Centralized Prompting**: All prompt assembly should occur within `worker-ai` or a dedicated `packages/prompts` library.
2. **Gateway Enforcement**: Every AI request MUST pass through the Cloudflare AI Gateway (`sovereign-ai-gateway`) to ensure centralized logging, cost tracking, and rate limiting.
3. **Structured Outputs**: AI models should be instructed to return strictly formatted JSON matching predefined Zod schemas.
4. **Baseline Injection**: The `Baseline Design` must be injected into the system prompt securely on the server side. It must never be passed from the client in the API request body.
