import { NextResponse } from "next/server";
import { getRegistry } from "@/lib/registry";

export async function GET() {
  const registry = getRegistry();
  return NextResponse.json({
    status: "ok",
    products: registry.products.length,
    activeProducts: registry.products.filter(
      (p) => p.status === "active" || p.status === "beta"
    ).length,
    timestamp: new Date().toISOString(),
  });
}
