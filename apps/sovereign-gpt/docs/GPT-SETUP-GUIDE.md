# Sovereign Build Agent — ChatGPT Custom GPT Setup Guide

## What You're Building
A ChatGPT Custom GPT that acts as your autonomous engineer for the SOVV / defrag.app platform.
It can read/write code, deploy workers, query your database, check Stripe revenue, and generate UI components + images — all from a chat window.

---

## Step 1: Create the GPT

1. Go to **https://chatgpt.com/gpts/editor**
2. Click **"Create a GPT"**
3. Switch to the **"Configure"** tab (not the builder chat)

---

## Step 2: Basic Settings

| Field | Value |
|-------|-------|
| **Name** | Sovereign Build Agent |
| **Description** | Autonomous engineer for the SOVV / defrag.app platform. Reads/writes code, deploys workers, queries the database, checks Stripe, and generates UI components and images. |
| **Instructions** | *(paste the full contents of `prompts/gpt-system-prompt.md`)* |

---

## Step 3: Capabilities

Enable these:
- ✅ **Web Browsing** — off (not needed, broker handles all fetching)
- ✅ **DALL·E Image Generation** — off (broker uses Cloudflare Flux/SDXL instead)
- ✅ **Code Interpreter** — optional (useful for data analysis)

---

## Step 4: Add the Action (API Connection)

1. Scroll to **"Actions"** section
2. Click **"Add action"**
3. In the **Schema** field, paste the full contents of `actions/openapi-schema.yaml`
4. Set **Authentication**:
   - Type: **API Key**
   - Auth Type: **Bearer**
   - API Key: `898b73ccde873b3d8f3cdd62b472063c35f52be1b4ff8b852e00f50670b3afaa`
5. Click **"Test"** → select `healthCheck` → should return:
   ```json
   {
     "ok": true,
     "broker": "sovereign-broker v2.0",
     "github": "connected",
     "cloudflare": "connected",
     "stripe": "connected"
   }
   ```

---

## Step 5: Conversation Starters

Add these as starter prompts:

```
What's the current state of the SOVV project? What should we build next?
```
```
How many active subscribers do we have and what's our MRR?
```
```
Build me a new React component for [describe what you need]
```
```
Read the file apps/worker/src/billing.ts and explain how billing works
```
```
Generate a UI mockup for the settings page
```
```
Show me the last 10 commits and what changed
```

---

## Step 6: Publish

- **Access**: "Only me" (private) or "Anyone with a link"
- Click **Save**

---

## How to Use It

### Chat Mode (default)
Just talk to it. It uses **Llama 3.3 70B** for reasoning.

```
You: What's broken in the codebase?
GPT: [calls getBuildScope, analyzes, returns prioritized list]
```

### Switch to Code Mode
When you need complex code generation, it automatically switches to **GPT-OSS 120B**:

```
You: Build me a new Cloudflare Worker for handling webhooks
GPT: [switches to code model, generates complete worker + wrangler.toml]
```

### Switch to Image/Component Mode
When you want visuals:

```
You: Design what the new onboarding flow could look like
GPT: [calls generateImage with flux-dev, returns mockup image]

You: Build the onboarding component with a visual mockup
GPT: [generates React/TS code + Flux image mockup, offers to commit]
```

### Vision Mode
Paste a screenshot URL:

```
You: Here's a screenshot of the current settings page: [url]
     What's wrong with the layout?
GPT: [calls analyzeImage with Llama Vision, gives detailed feedback]
```

### Full Build Loop
```
You: Add a user preferences API endpoint

GPT:
1. Reads apps/worker/src/index.ts (getRepoFile)
2. Reads apps/worker/src/me.ts for patterns
3. Generates preferences.ts handler (code model)
4. Shows you the code
5. "Commit this to apps/worker/src/preferences.ts?"
6. You: yes
7. Commits to GitHub (writeRepoFile)
8. "Trigger a deploy?" → you decide
```

---

## Broker API Reference

**Base URL:** `https://sovereign-broker.defrag.app`
**Auth:** `Authorization: Bearer 898b73ccde873b3d8f3cdd62b472063c35f52be1b4ff8b852e00f50670b3afaa`

| Endpoint | Method | What it does |
|----------|--------|--------------|
| `/health` | GET | Check all service connections |
| `/repo/tree` | GET | Full file tree of SOVV repo |
| `/repo/file?path=` | GET | Read any file |
| `/repo/write` | POST | Create/update a file (commits to main) |
| `/repo/commits` | GET | Recent commits |
| `/ai/chat` | POST | Chat with model switching (chat/code/vision/fast) |
| `/ai/generate-image` | POST | Generate image via Flux/SDXL |
| `/ai/analyze-image` | POST | Analyze image with vision model |
| `/cf/workers` | GET | List all deployed workers |
| `/cf/worker/deploy` | POST | Deploy a worker |
| `/cf/worker/logs?worker=` | GET | Worker logs |
| `/cf/kv/get?key=` | GET | Read KV value |
| `/cf/kv/set` | POST | Write KV value |
| `/cf/d1/query` | POST | Run SELECT on D1 database |
| `/cf/r2/list` | GET | List R2 objects |
| `/cf/r2/upload` | POST | Upload to R2 |
| `/cf/pages/deployments` | GET | Pages deployment status |
| `/stripe/overview` | GET | MRR, subscribers, recent charges |
| `/stripe/subscriptions` | GET | List subscriptions |
| `/stripe/revenue` | GET | Revenue metrics |
| `/stripe/create-price` | POST | Create new product/price |
| `/build/scope` | GET | AI-powered project scope analysis |
| `/build/component` | POST | Generate React/TS component |
| `/build/worker` | POST | Generate Cloudflare Worker |
| `/build/commit` | POST | Commit multiple files + trigger CI |

---

## Model Reference

| Alias | Model | Best for |
|-------|-------|----------|
| `chat` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Conversation, planning, analysis |
| `code` | `@cf/openai/gpt-oss-120b` | Complex code gen, architecture |
| `vision` | `@cf/meta/llama-3.2-11b-vision-instruct` | Screenshot analysis, image understanding |
| `fast` | `@cf/meta/llama-3.2-3b-instruct` | Quick lookups, simple answers |

| Image Alias | Model | Best for |
|-------------|-------|----------|
| `flux-schnell` | `@cf/black-forest-labs/flux-1-schnell` | Fast UI mockups |
| `flux-dev` | `@cf/black-forest-labs/flux-2-dev` | High quality visuals |
| `sdxl` | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | Detailed/photorealistic |
| `sdxl-lightning` | `@cf/bytedance/stable-diffusion-xl-lightning` | Fast + detailed |

---

## Security Notes

- The broker token is the only credential the GPT needs
- D1 queries are read-only (SELECT only) — no write access to the database via GPT
- Worker deploys and file commits require explicit confirmation in chat
- The broker validates the token on every request
- Rotate the token anytime: `wrangler secret put BROKER_TOKEN --name sovereign-broker`

---

## Rotating the Broker Token

```bash
# Generate new token
NEW_TOKEN=$(openssl rand -hex 32)

# Update the worker secret
echo "$NEW_TOKEN" | npx wrangler secret put BROKER_TOKEN --name sovereign-broker

# Update the GPT action auth in ChatGPT settings
# Go to: chatgpt.com/gpts/editor → your GPT → Actions → Edit → Auth → update API key
```

---

## Deployed Infrastructure

| Service | URL | Worker Name |
|---------|-----|-------------|
| Broker (GPT API) | sovereign-broker.defrag.app | sovereign-broker |
| Main API | api.defrag.app | sovereign-os-api |
| AI Worker | ai.defrag.app | worker-ai |
| Web App | app.defrag.app | sovv-web |
| Build Agent | — | sovereign-build-agent |
| Code Agent | — | sovereign-code-agent |
| Session Worker | — | worker-session |