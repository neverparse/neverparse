# Neverparse Agent Prompts

These prompt files are designed to be copy-pasted into separate Claude Code windows for overnight autonomous operation.

## How to Run

### Prerequisites
1. Connect Vercel GitHub integration (one-time):
   - Go to https://vercel.com/peoplecontexts-projects/neverparse/settings/git
   - Click "Connect Git Repository"
   - Authorize the Vercel GitHub App on the `neverparse` org
   - Select `neverparse/neverparse` repo
   - After this, pushes to main auto-deploy

2. Ensure all MCP servers are connected (`/mcp` in Claude Code)

### Window 1: UI Agent
Open a new Claude Code window in this repo and paste:
```
Read agents/prompts/ui-agent.md and execute all tasks described in it. Work on branch ui/polish-v1. Create a PR to main when done. Do not ask questions — make your best judgment on design decisions.
```

### Window 2: Deploy Agent
Open a new Claude Code window in this repo and paste:
```
Read agents/prompts/deploy-agent.md and execute all tasks described in it. Work on branch infra/ci-setup. Create a PR to main when done. Do not ask questions — use your best judgment.
```

### Window 3: Product Agent (Product #2)
Open a new Claude Code window in this repo and paste:
```
Read agents/prompts/product-agent.md and execute all tasks. You are Product Agent #2. Research real agent developer pain points, pick the best idea, build a complete MVP. Check registry/products.json first — "infer" already exists, so pick something DIFFERENT. Work on branch product/<your-chosen-slug>. Create a PR to main when done. Do not ask questions.
```

### Window 4: Product Agent (Product #3)
Open a new Claude Code window in this repo and paste:
```
Read agents/prompts/product-agent.md and execute all tasks. You are Product Agent #3. Research real agent developer pain points, pick the best idea, build a complete MVP. Check registry/products.json first — do NOT duplicate any existing products. Focus on a DIFFERENT category than other agents. Work on branch product/<your-chosen-slug>. Create a PR to main when done. Do not ask questions.
```

### Window 5: Product Agent (Product #4) [optional]
```
Read agents/prompts/product-agent.md and execute all tasks. You are Product Agent #4. Focus specifically on the "integration/normalization" category — normalizing data across multiple SaaS APIs, webhooks, or auth systems. Check registry/products.json first — do NOT duplicate. Work on branch product/<your-chosen-slug>. Create a PR to main when done.
```

## Coordination
- Each agent works on its own branch — no conflicts
- Products register themselves in registry/products.json
- The UI reads registry dynamically — new products appear automatically
- PRs are the handoff mechanism
- Morning: review PRs, merge good ones, deploy
