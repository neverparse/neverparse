/**
 * Deploy Agent — CI, tests, deployments
 *
 * Boundaries:
 * - Owns CI, integration tests, deployment flows
 * - On detecting new/updated product: test → deploy
 * - Manages Vercel (frontend) + Railway (API services)
 * - Never prints secrets
 *
 * Current mode: Vercel auto-deploys from git push.
 * Railway deployments are manual or via Railway CLI.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "registry", "products.json");

export function deployAll() {
  console.log("Deploy Agent: starting deployment pipeline...\n");

  const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  const pending = reg.products.filter(
    (p: any) => p.deploy.status === "pending" || p.deploy.status === "needs-update"
  );

  if (pending.length === 0) {
    console.log("No products pending deployment.");
    return;
  }

  for (const p of pending) {
    console.log(`Deploying: ${p.slug}...`);

    // Run tests for this product
    try {
      execSync(`npx vitest run products/${p.slug}/`, {
        cwd: ROOT,
        stdio: "pipe",
      });
      console.log(`  ✓ Tests passed for ${p.slug}`);
    } catch {
      console.log(`  ✗ Tests failed for ${p.slug}. Skipping deploy.`);
      continue;
    }

    // Update deploy status
    p.deploy.lastDeployed = new Date().toISOString();
    p.deploy.status = "deployed";
    p.deploy.platform = "vercel";
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2) + "\n");
  console.log("\nDeploy Agent: pipeline complete. Push to git for Vercel deployment.");
}

export function rollback(slug: string) {
  console.log(`Rollback requested for: ${slug}`);
  console.log("Strategy: Vercel auto-rollback via 'vercel rollback' or redeploy previous commit.");
  // In production, this would use the Vercel API
}

if (require.main === module) {
  deployAll();
}
