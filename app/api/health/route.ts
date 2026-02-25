import { NextResponse } from "next/server";
import { getRegistry } from "@/lib/registry";

export async function GET() {
  const registry = getRegistry();
  return NextResponse.json({
    status: "ok",
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    products: registry.products.map((p) => ({
      slug: p.slug,
      name: p.name,
      status: p.status,
      version: p.version,
      deploy: p.deploy.status,
      lastDeployed: p.deploy.lastDeployed,
      endpoints: p.endpoints.length,
    })),
    totals: {
      products: registry.products.length,
      active: registry.products.filter(
        (p) => p.status === "active" || p.status === "beta"
      ).length,
    },
    timestamp: new Date().toISOString(),
  });
}
