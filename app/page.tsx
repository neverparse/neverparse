import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/registry";
import Link from "next/link";

export default function Home() {
  const products = getActiveProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-np-text-bright leading-tight mb-6">
            Agent-native primitives
            <br />
            <span className="text-np-accent">for the real world.</span>
          </h1>
          <p className="text-lg text-np-text-dim leading-relaxed mb-8 max-w-2xl">
            Machine-discoverable, machine-consumable APIs and tools that make
            agents reliable across platforms. No wrappers. No glue. Just
            primitives that work.
          </p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition"
            >
              Explore Products
            </Link>
            <Link
              href="https://github.com/neverparse"
              target="_blank"
              className="px-6 py-2.5 rounded-md border border-np-border text-np-text hover:border-np-accent/40 transition"
            >
              GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Thesis */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-np-border rounded-lg bg-np-surface">
            <div className="text-np-accent font-mono text-sm mb-3">
              01 — Discoverable
            </div>
            <h3 className="font-semibold text-np-text-bright mb-2">
              OpenAPI-first
            </h3>
            <p className="text-sm text-np-text-dim leading-relaxed">
              Every API ships with typed schemas, OpenAPI specs, and structured
              error codes. Agents can introspect before they call.
            </p>
          </div>
          <div className="p-6 border border-np-border rounded-lg bg-np-surface">
            <div className="text-np-accent font-mono text-sm mb-3">
              02 — Composable
            </div>
            <h3 className="font-semibold text-np-text-bright mb-2">
              Primitive-level
            </h3>
            <p className="text-sm text-np-text-dim leading-relaxed">
              Not apps, not wrappers. Atomic operations that compose cleanly.
              One input, one output, no side effects unless you ask.
            </p>
          </div>
          <div className="p-6 border border-np-border rounded-lg bg-np-surface">
            <div className="text-np-accent font-mono text-sm mb-3">
              03 — Reliable
            </div>
            <h3 className="font-semibold text-np-text-bright mb-2">
              Built for machines
            </h3>
            <p className="text-sm text-np-text-dim leading-relaxed">
              Deterministic outputs. Structured errors. Idempotent operations.
              Designed for retry loops and tool-calling agents.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-np-text-bright mb-8">
            Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
