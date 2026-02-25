"use client";

import Link from "next/link";
import type { Product } from "@/lib/registry";
import { trackCtaClick } from "@/lib/analytics";

export default function ProductCard({ product }: { product: Product }) {
  const statusColor =
    product.status === "active"
      ? "bg-np-accent/20 text-np-accent"
      : product.status === "beta"
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-np-text-dim/20 text-np-text-dim";

  return (
    <Link
      href={`/p/${product.slug}`}
      onClick={() => trackCtaClick(product.slug, "card_click")}
      className="group block border border-np-border rounded-lg p-6 bg-np-surface hover:border-np-accent/40 hover:bg-np-surface-2 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-mono font-semibold text-lg text-np-text-bright group-hover:text-np-accent transition">
          {product.name}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
          {product.status}
        </span>
      </div>
      <p className="text-sm text-np-text-dim leading-relaxed mb-4">
        {product.tagline}
      </p>
      <div className="flex items-center gap-4 text-xs text-np-text-dim">
        <span className="font-mono">v{product.version}</span>
        <span>{product.endpoints.length} endpoints</span>
        <span className="capitalize">{product.pricing}</span>
      </div>
    </Link>
  );
}
