# Neverparse — Agent Instructions

## What This Is
Neverparse is a product factory that builds agent-native primitives: machine-discoverable, machine-consumable APIs/tools/data that make agents reliable in the real world and across platforms.

**Live site**: https://neverparse.com
**Repo**: https://github.com/neverparse/neverparse
**Stack**: Next.js + Tailwind (Vercel), Railway (APIs), Clerk (auth), Stripe (payments), Supabase (DB), GA4 (analytics)

## Git Config (MUST USE)
```
git config user.name "neverparse"
git config user.email "261078601+neverparse@users.noreply.github.com"
```
NEVER commit with any other identity. NEVER commit .env or .mcp.json.

## Important Rules
- **No Henry Nevue references** — never publish anything with that name
- **Email**: founders@neverparse.com
- **GitHub org**: https://github.com/neverparse
- **.env has all secrets** — assume env vars exist, never print them, validate they're present
- **.mcp.json is gitignored** — contains secrets, never commit it

## Architecture

```
app/                    → Next.js pages + API routes
  api/v1/<slug>/        → Product API endpoints
  p/[slug]/page.tsx     → Dynamic product pages (reads registry)
  products/page.tsx     → Products index
components/             → Shared UI (Header, Footer, ProductCard, CodeBlock, TryIt)
lib/                    → Shared utils (registry.ts, analytics.ts, supabase.ts)
registry/products.json  → Source of truth for all products
products/<slug>/        → Product business logic + tests
agents/                 → Agent implementations
cli/np.ts               → CLI tool
```

## Product Registry
All products are defined in `registry/products.json`. The UI reads this file to render pages. To add a product:
1. Add entry to registry/products.json
2. Create products/<slug>/handler.ts + handler.test.ts
3. Create app/api/v1/<slug>/<endpoint>/route.ts
4. Tests must pass before merging

## Branch Strategy
- `main` — production, auto-deploys to Vercel
- `product/<slug>` — each new product gets its own branch
- `ui/<feature>` — UI improvements
- Always create PRs, never push directly to main except for urgent fixes

## Running Tests
```bash
npm run test                    # all tests
npx vitest run products/<slug>  # single product
npm run typecheck               # type checking
npm run build                   # full build
```

## CLI
```bash
npm run np -- status            # show product status
npm run np -- validate          # typecheck + lint + test
npm run np -- build             # build next.js
npm run np -- doctor            # check environment
```

## Design System
- Dark theme: bg #0a0a0a, surface #111111, accent #00d4aa
- Font: Inter (body), JetBrains Mono (code)
- All colors use `np-*` Tailwind tokens (see tailwind.config.ts)
- Components: Header, Footer, ProductCard, CodeBlock, TryIt

## Thesis Filter for New Products
Every product MUST be:
1. An agent-native primitive (structured I/O, typed schemas)
2. Valuable without any specific LLM (not an AI wrapper)
3. Horizontally scalable via integrations (more systems = more value)
4. Simple enough to ship as MVP in one session

## Deployment
- Frontend: Vercel (auto-deploys from main via git push)
- Vercel account: henry-8242 (scope: peoplecontexts-projects)
- Railway: for standalone API services that need independent scaling
- Current deployment: all API routes run as Vercel serverless functions
