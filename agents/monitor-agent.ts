/**
 * Monitor/Iteration Agent — watches growth + quality
 *
 * Boundaries:
 * - Reads GA events, API metrics, GitHub stars
 * - Produces summary reports
 * - Triggers iteration or kill workflows
 *
 * Data sources:
 * - Supabase: api_logs table
 * - Registry: metrics + validation fields
 * - GA: page views, CTA clicks (via GA API)
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "registry", "products.json");
const LOGS_DIR = path.join(ROOT, "logs");

export function runMonitor() {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

  const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  const now = new Date().toISOString();
  const report: string[] = [`\n=== Monitor Report: ${now} ===\n`];

  const activeProducts = reg.products.filter(
    (p: any) => p.status === "active" || p.status === "beta"
  );

  report.push(`Active products: ${activeProducts.length}\n`);

  for (const p of activeProducts) {
    const errorRate =
      p.metrics.requests > 0
        ? (p.metrics.errors / p.metrics.requests).toFixed(3)
        : "N/A";
    const health =
      p.metrics.requests === 0
        ? "no-traffic"
        : Number(errorRate) < 0.05
          ? "healthy"
          : Number(errorRate) < 0.1
            ? "degraded"
            : "critical";

    report.push(`Product: ${p.name} (${p.slug})`);
    report.push(`  Status: ${p.status} | Health: ${health}`);
    report.push(
      `  Requests: ${p.metrics.requests} | Errors: ${p.metrics.errors} | Error Rate: ${errorRate}`
    );
    report.push(`  Avg Latency: ${p.metrics.avgLatencyMs}ms`);
    report.push(`  Signups: ${p.metrics.signups} | CTA Clicks: ${p.validation.ctaClicks}`);
    report.push(`  GitHub Stars: ${p.validation.githubStars}`);
    report.push(`  Deploy: ${p.deploy.status} (${p.deploy.platform})`);

    // Kill threshold check
    const thresholds = reg.config.killThresholds;
    const ageMs =
      Date.now() - new Date(p.createdAt).getTime();
    const ageDays = ageMs / 86400000;

    if (ageDays > thresholds.evaluationWindowDays) {
      const killReasons: string[] = [];
      if (p.validation.apiCalls < thresholds.minApiCallsPerWeek) {
        killReasons.push(`API calls (${p.validation.apiCalls}) below min (${thresholds.minApiCallsPerWeek}/week)`);
      }
      if (p.metrics.signups < thresholds.minSignupsPerMonth) {
        killReasons.push(`Signups (${p.metrics.signups}) below min (${thresholds.minSignupsPerMonth}/month)`);
      }
      if (Number(errorRate) > thresholds.maxErrorRate) {
        killReasons.push(`Error rate (${errorRate}) above max (${thresholds.maxErrorRate})`);
      }

      if (killReasons.length > 0) {
        report.push(`  ⚠ KILL CANDIDATE: ${killReasons.join("; ")}`);
      }
    } else {
      report.push(`  (evaluation window: ${Math.round(ageDays)}/${thresholds.evaluationWindowDays} days)`);
    }
    report.push("");
  }

  // Recommendations
  report.push("--- Recommendations ---");
  if (activeProducts.length < 3) {
    report.push("• Spawn more Product Agents to increase product count");
  }
  report.push("• Review CTA click rates and optimize copy");
  report.push("");

  const reportText = report.join("\n");
  console.log(reportText);

  // Save to file
  const dateStr = now.split("T")[0];
  fs.writeFileSync(path.join(LOGS_DIR, `monitor-${dateStr}.log`), reportText);
}

if (require.main === module) {
  runMonitor();
}
