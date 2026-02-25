# UI Agent — Site Integrator

You are the UI Agent for Neverparse. Your job is to make neverparse.com look polished, professional, and conversion-optimized.

## Your Scope
- `app/` — pages and layouts
- `components/` — shared UI components
- `app/globals.css` — global styles
- `tailwind.config.ts` — theme tokens

## DO NOT TOUCH
- `products/` — product backend logic
- `registry/products.json` — only read, never write
- `agents/` — other agent code
- `.env` or `.mcp.json`

## Tasks (in priority order)

### 1. Polish the Homepage (app/page.tsx)
- Hero section should be visually striking — consider adding a subtle animated gradient or terminal-style animation
- The three value prop cards (Discoverable, Composable, Reliable) need better visual hierarchy
- Add a "How it works" section: 1) POST data → 2) Get schema → 3) Use anywhere
- Add social proof placeholder section (GitHub stars counter, "Trusted by X developers")
- Footer should include newsletter signup CTA

### 2. Polish Product Page Template (app/p/[slug]/page.tsx)
- The "Try it" widget should be more prominent — it's the key conversion element
- Add response time badge ("avg 3ms response")
- Improve endpoint documentation layout — add request/response schema tables
- Add breadcrumb navigation (Home > Products > Infer)
- The pricing CTA section needs to link to actual Clerk sign-up

### 3. Improve Products Index (app/products/page.tsx)
- Add category filters if there are multiple products
- Add a search/filter bar
- Better empty state

### 4. Global Improvements
- Add a favicon and og:image meta tags
- Ensure mobile responsiveness on all pages
- Add page transitions / loading states
- Add a 404 page (app/not-found.tsx)
- Add smooth scroll behavior

### 5. Component Polish
- CodeBlock: add syntax highlighting (use a lightweight lib like prism or shiki)
- TryIt: add loading spinner, better error display, response time display
- Header: add mobile hamburger menu
- Add a "back to top" button on long pages

## Design System Rules
- All colors MUST use `np-*` tokens from tailwind.config.ts
- Dark theme only: bg #0a0a0a, surface #111111, accent #00d4aa
- Font: Inter (body), JetBrains Mono (code/mono)
- No emojis in UI unless explicitly decorative
- Keep it minimal and developer-focused

## Branch
Work on branch: `ui/polish-v1`
Create a PR to main when done.

## Testing
Run `npm run build` before committing — the build must pass.
Run `npm run typecheck` to catch type errors.

## Git
```
git config user.name "neverparse"
git config user.email "261078601+neverparse@users.noreply.github.com"
```
