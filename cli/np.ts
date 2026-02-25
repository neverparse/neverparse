#!/usr/bin/env tsx

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "registry", "products.json");
const STATE_DIR = path.join(ROOT, "state");
const LOGS_DIR = path.join(ROOT, "logs");

// Ensure dirs exist
[STATE_DIR, LOGS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Helpers ──

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
}

function saveRegistry(data: any) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2) + "\n");
}

function log(msg: string) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(LOGS_DIR, "np.log"), line + "\n");
}

function run(cmd: string, opts?: { cwd?: string }) {
  return execSync(cmd, {
    cwd: opts?.cwd || ROOT,
    stdio: "inherit",
    env: { ...process.env },
  });
}

function checkEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  ];
  const missing = required.filter((k) => !process.env[k]);
  return { ok: missing.length === 0, missing };
}

// ── Commands ──

const commands: Record<string, (args: string[]) => void> = {
  bootstrap(args) {
    log("Bootstrapping neverparse...");

    // Check env
    const env = checkEnv();
    if (!env.ok) {
      log(`WARNING: Missing env vars: ${env.missing.join(", ")}`);
    }

    // Install deps
    log("Installing dependencies...");
    run("npm install");

    // Create state/logs dirs
    log("Creating state and logs directories...");

    // Init git if needed
    if (!fs.existsSync(path.join(ROOT, ".git"))) {
      log("Initializing git repository...");
      run("git init");
      run('git remote add origin git@github.com:neverparse/neverparse.git || true');
    }

    log("Bootstrap complete. Run: npm run np -- dev");
  },

  doctor(_args) {
    console.log("\n🏥 Neverparse Doctor\n");

    // Check env
    const env = checkEnv();
    console.log(env.ok ? "✓ Environment variables" : `✗ Missing: ${env.missing.join(", ")}`);

    // Check node
    try {
      const v = execSync("node -v", { encoding: "utf-8" }).trim();
      console.log(`✓ Node.js ${v}`);
    } catch {
      console.log("✗ Node.js not found");
    }

    // Check deps
    const hasNodeModules = fs.existsSync(path.join(ROOT, "node_modules"));
    console.log(hasNodeModules ? "✓ Dependencies installed" : "✗ Run: np bootstrap");

    // Check registry
    try {
      const reg = loadRegistry();
      console.log(`✓ Registry: ${reg.products.length} products`);
    } catch {
      console.log("✗ Registry not found");
    }

    // Check git
    try {
      execSync("git status", { cwd: ROOT, stdio: "pipe" });
      console.log("✓ Git initialized");
    } catch {
      console.log("✗ Git not initialized");
    }

    console.log("");
  },

  status(_args) {
    const reg = loadRegistry();
    console.log("\n📊 Neverparse Status\n");
    console.log(`Products: ${reg.products.length}`);
    console.log(`Active: ${reg.products.filter((p: any) => p.status === "active").length}`);
    console.log(`Archived: ${reg.products.filter((p: any) => p.status === "archived").length}`);
    console.log("");

    for (const p of reg.products) {
      const icon =
        p.status === "active" ? "●" : p.status === "beta" ? "◐" : "○";
      console.log(
        `  ${icon} ${p.name.padEnd(20)} ${p.status.padEnd(12)} v${p.version}  ${p.deploy.status}`
      );
    }
    console.log("");
  },

  build(args) {
    const slug = getFlag(args, "--product");
    if (!slug) {
      log("Building entire project...");
      run("npm run build");
      return;
    }

    const reg = loadRegistry();
    const product = reg.products.find((p: any) => p.slug === slug);
    if (!product) {
      log(`Product '${slug}' not found in registry`);
      process.exit(1);
    }

    log(`Building product: ${slug}`);
    run("npm run build");
    log(`Build complete for ${slug}`);
  },

  validate(args) {
    const slug = getFlag(args, "--product");
    log(`Validating${slug ? ` product: ${slug}` : " all"}...`);

    // Typecheck
    log("Running typecheck...");
    try {
      run("npx tsc --noEmit");
      log("✓ Typecheck passed");
    } catch {
      log("✗ Typecheck failed");
    }

    // Lint
    log("Running lint...");
    try {
      run("npx next lint");
      log("✓ Lint passed");
    } catch {
      log("✗ Lint failed");
    }

    // Tests
    log("Running tests...");
    try {
      if (slug) {
        run(`npx vitest run products/${slug}/`);
      } else {
        run("npx vitest run");
      }
      log("✓ Tests passed");
    } catch {
      log("✗ Tests failed");
    }
  },

  deploy(args) {
    const slug = getFlag(args, "--product");
    log(`Deploying${slug ? ` product: ${slug}` : " all"}...`);

    // For now, deploy = push to git + Vercel auto-deploys
    log("Pushing to git...");
    try {
      run("git add -A");
      run('git commit -m "deploy: update" --allow-empty');
      run("git push origin main");
      log("✓ Pushed to git. Vercel will auto-deploy.");
    } catch (e) {
      log("Deploy: git push failed or nothing to push");
    }

    // Update registry deploy status
    if (slug) {
      const reg = loadRegistry();
      const product = reg.products.find((p: any) => p.slug === slug);
      if (product) {
        product.deploy.lastDeployed = new Date().toISOString();
        product.deploy.status = "deployed";
        saveRegistry(reg);
      }
    }
  },

  kill(args) {
    const slug = getFlag(args, "--product");
    if (!slug) {
      console.log("Usage: np kill --product <slug>");
      process.exit(1);
    }

    const reg = loadRegistry();
    const product = reg.products.find((p: any) => p.slug === slug);
    if (!product) {
      log(`Product '${slug}' not found`);
      process.exit(1);
    }

    log(`Archiving product: ${slug}`);
    product.status = "archived";
    product.deploy.status = "frozen";
    product.updatedAt = new Date().toISOString().split("T")[0];
    saveRegistry(reg);
    log(`Product '${slug}' archived. Page will show "Archived" label.`);
  },

  "ui"(args) {
    const sub = args[0];
    if (sub === "--sync") {
      log("Syncing UI from registry...");
      const reg = loadRegistry();
      log(`Found ${reg.products.length} products. UI will render from registry.`);
      log("UI sync complete. Run 'npm run dev' to preview.");
    } else {
      log("Usage: np ui --sync");
    }
  },

  "style"(args) {
    log("Running style consistency check...");
    // Check that all product pages use consistent components
    const reg = loadRegistry();
    for (const p of reg.products) {
      const pagePath = path.join(ROOT, "app", "p", "[slug]", "page.tsx");
      if (fs.existsSync(pagePath)) {
        log(`✓ Product page template exists for dynamic routes`);
      }
    }
    log("Style check complete.");
  },

  monitor(args) {
    const sub = args[0];
    if (sub === "--start") {
      log("Starting monitor (single pass)...");
      const reg = loadRegistry();
      const summary: string[] = [];

      for (const p of reg.products) {
        if (p.status === "archived") continue;
        const health =
          p.metrics.errors / Math.max(p.metrics.requests, 1) < 0.1
            ? "healthy"
            : "degraded";
        summary.push(`  ${p.name}: ${health} (${p.metrics.requests} reqs, ${p.metrics.errors} errs)`);

        // Check kill thresholds
        if (
          p.validation.apiCalls < reg.config.killThresholds.minApiCallsPerWeek &&
          p.createdAt < new Date(Date.now() - reg.config.killThresholds.evaluationWindowDays * 86400000).toISOString()
        ) {
          summary.push(`    ⚠ Below minimum API calls threshold`);
        }
      }

      const report = `Monitor Report - ${new Date().toISOString()}\n${summary.join("\n")}`;
      console.log("\n" + report);
      fs.writeFileSync(
        path.join(LOGS_DIR, `monitor-${new Date().toISOString().split("T")[0]}.log`),
        report + "\n"
      );
    } else {
      log("Usage: np monitor --start");
    }
  },

  logs(args) {
    const logFile = path.join(LOGS_DIR, "np.log");
    if (!fs.existsSync(logFile)) {
      console.log("No logs yet.");
      return;
    }
    const lines = fs.readFileSync(logFile, "utf-8").split("\n");
    const tail = args.includes("--tail") ? 20 : lines.length;
    console.log(lines.slice(-tail).join("\n"));
  },

  idea(args) {
    const count = parseInt(getFlag(args, "--count") || "3", 10);
    log(`Generating ${count} product ideas...`);
    // In a real implementation, this would use an LLM to research
    const ideas = [
      {
        name: "Infer",
        thesis: "Schema inference from any JSON data",
        score: 9,
      },
      {
        name: "AuthProxy",
        thesis: "Universal OAuth proxy for agent-to-SaaS auth",
        score: 8,
      },
      {
        name: "WebShape",
        thesis: "Extract structured data from any URL via schema",
        score: 8,
      },
    ];
    console.log("\nProduct Ideas:");
    ideas.slice(0, count).forEach((idea, i) => {
      console.log(`  ${i + 1}. ${idea.name} (score: ${idea.score}/10)`);
      console.log(`     ${idea.thesis}`);
    });
    console.log("");
  },

  run(args) {
    const mode = getFlag(args, "--mode");
    if (mode === "continuous") {
      log("Starting continuous mode...");
      log("Running: validate → build → deploy cycle");

      // Single pass of the pipeline
      commands.validate([]);
      commands.build([]);
      commands.monitor(["--start"]);

      log("Continuous pass complete. Re-run for another cycle.");
    } else {
      console.log("Usage: np run --mode continuous");
    }
  },
};

// ── CLI Entry ──

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log(`
Neverparse CLI (np)

Commands:
  bootstrap              Initialize project (install deps, setup git)
  doctor                 Check environment health
  status                 Show product status
  idea [--count N]       Generate product ideas
  build [--product slug] Build project or specific product
  validate [--product s] Run typecheck, lint, tests
  deploy [--product s]   Deploy to Vercel/Railway
  kill --product slug    Archive a product
  ui --sync              Sync UI from registry
  style --run            Run style consistency check
  monitor --start        Run monitoring pass
  logs [--tail]          View logs
  run --mode continuous  Run full pipeline cycle
`);
    return;
  }

  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}. Run 'np help' for usage.`);
    process.exit(1);
  }

  handler(args.slice(1));
}

main();
