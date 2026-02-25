/**
 * Style Agent — enforces consistent visual system
 *
 * Boundaries:
 * - Owns Tailwind theme tokens, shared components, layout patterns
 * - Runs periodically to check consistency
 * - Opens minimal diffs if issues found
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

export function checkStyleConsistency() {
  console.log("Style Agent: checking consistency...\n");

  const issues: string[] = [];

  // Check tailwind config exists
  const twConfig = path.join(ROOT, "tailwind.config.ts");
  if (!fs.existsSync(twConfig)) {
    issues.push("Missing tailwind.config.ts");
  }

  // Check all components use np- color tokens
  const componentsDir = path.join(ROOT, "components");
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), "utf-8");

      // Check for hardcoded colors instead of theme tokens
      const hardcodedColors = content.match(/(bg|text|border)-(?:black|white|gray|blue|red|green)-\d+/g);
      if (hardcodedColors) {
        issues.push(`${file}: hardcoded colors found: ${hardcodedColors.slice(0, 3).join(", ")}`);
      }
    }
  }

  // Check globals.css has theme vars
  const globalsCss = path.join(ROOT, "app", "globals.css");
  if (fs.existsSync(globalsCss)) {
    const content = fs.readFileSync(globalsCss, "utf-8");
    if (!content.includes("--np-")) {
      issues.push("globals.css: missing --np- CSS custom properties");
    }
  }

  if (issues.length === 0) {
    console.log("✓ Style consistency check passed");
  } else {
    console.log("Style issues found:");
    issues.forEach((i) => console.log(`  ✗ ${i}`));
  }

  return issues;
}

if (require.main === module) {
  checkStyleConsistency();
}
