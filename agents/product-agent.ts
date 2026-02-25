/**
 * Product Agent — discovers, builds, and iterates on product MVPs.
 *
 * Boundaries:
 * - Owns ONLY its product folder (products/<slug>/) and API routes
 * - Communicates with UI via product registry (registry/products.json)
 * - Must not modify shared UI components directly
 *
 * Workflow:
 * 1. Research: mine GitHub issues, dev pain points, agent failures
 * 2. Ideate: propose top 3 ideas, score, pick 1
 * 3. Build: create MVP (handler, tests, API route)
 * 4. Register: add product to registry
 * 5. Hand off: signal Deploy Agent
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "registry", "products.json");

interface ProductSpec {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  endpoints: { method: string; path: string; description: string }[];
}

export function registerProduct(spec: ProductSpec) {
  const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));

  // Check if already exists
  if (reg.products.find((p: any) => p.slug === spec.slug)) {
    console.log(`Product '${spec.slug}' already in registry. Updating...`);
    const idx = reg.products.findIndex((p: any) => p.slug === spec.slug);
    reg.products[idx] = {
      ...reg.products[idx],
      ...spec,
      updatedAt: new Date().toISOString().split("T")[0],
    };
  } else {
    reg.products.push({
      ...spec,
      status: "active",
      version: "0.1.0",
      examples: { curl: "", typescript: "", python: "" },
      pricing: "free-tier",
      metrics: { requests: 0, errors: 0, avgLatencyMs: 0, signups: 0 },
      validation: {
        githubStars: 0,
        ctaClicks: 0,
        apiCalls: 0,
        lastChecked: null,
      },
      deploy: { platform: "vercel", url: null, lastDeployed: null, status: "pending" },
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2) + "\n");
  console.log(`Product '${spec.slug}' registered.`);
}

export function scaffoldProduct(slug: string) {
  const productDir = path.join(ROOT, "products", slug);
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }

  // Create handler stub
  const handlerPath = path.join(productDir, "handler.ts");
  if (!fs.existsSync(handlerPath)) {
    fs.writeFileSync(
      handlerPath,
      `// ${slug} product handler\n// TODO: implement\n\nexport function handle(input: unknown) {\n  return { status: "ok", data: input };\n}\n`
    );
  }

  // Create test stub
  const testPath = path.join(productDir, "handler.test.ts");
  if (!fs.existsSync(testPath)) {
    fs.writeFileSync(
      testPath,
      `import { describe, it, expect } from "vitest";\nimport { handle } from "./handler";\n\ndescribe("${slug}", () => {\n  it("returns ok", () => {\n    const result = handle({ test: true });\n    expect(result.status).toBe("ok");\n  });\n});\n`
    );
  }

  // Create API route stub
  const routeDir = path.join(ROOT, "app", "api", "v1", slug);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(
      path.join(routeDir, "route.ts"),
      `import { NextRequest, NextResponse } from "next/server";\n\nexport async function POST(req: NextRequest) {\n  const body = await req.json();\n  return NextResponse.json({ status: "ok", data: body });\n}\n`
    );
  }

  console.log(`Scaffolded product: ${slug}`);
}
