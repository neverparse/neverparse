/**
 * UI Agent (Site Integrator)
 *
 * Boundaries:
 * - Owns only the Next.js website rendering
 * - Reads registry to build nav, product list, product pages
 * - Must not touch product backend logic
 *
 * Workflow:
 * 1. Read registry/products.json
 * 2. Verify all active products have rendering support
 * 3. Sync product metadata to UI components
 * 4. Report any rendering issues
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "registry", "products.json");

export function syncUI() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  const activeProducts = reg.products.filter(
    (p: any) => p.status === "active" || p.status === "beta"
  );

  console.log(`UI Sync: ${activeProducts.length} active products`);

  // Verify the dynamic route exists
  const dynamicPage = path.join(ROOT, "app", "p", "[slug]", "page.tsx");
  if (!fs.existsSync(dynamicPage)) {
    console.error("MISSING: app/p/[slug]/page.tsx - product pages won't render");
    return false;
  }

  // Verify products page exists
  const productsPage = path.join(ROOT, "app", "products", "page.tsx");
  if (!fs.existsSync(productsPage)) {
    console.error("MISSING: app/products/page.tsx");
    return false;
  }

  // Check each product has valid data for rendering
  for (const p of activeProducts) {
    const issues: string[] = [];
    if (!p.tagline) issues.push("missing tagline");
    if (!p.description) issues.push("missing description");
    if (!p.endpoints || p.endpoints.length === 0) issues.push("no endpoints");
    if (!p.examples.curl) issues.push("missing curl example");

    if (issues.length > 0) {
      console.log(`  ⚠ ${p.slug}: ${issues.join(", ")}`);
    } else {
      console.log(`  ✓ ${p.slug}: ready for rendering`);
    }
  }

  return true;
}

if (require.main === module) {
  syncUI();
}
