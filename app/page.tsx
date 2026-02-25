import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BackToTop from "@/components/BackToTop";
import { getActiveProducts } from "@/lib/registry";
import Link from "next/link";

export default function Home() {
  const products = getActiveProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient animate-gradient-shift absolute inset-0" />
        <div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-20 relative">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full border border-np-border text-xs font-mono text-np-text-dim mb-6 opacity-0 animate-fade-in-up stagger-1">
              APIs built for agents, not humans
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-np-text-bright leading-[1.1] mb-6 opacity-0 animate-fade-in-up stagger-2">
              Agent-native primitives
              <br />
              <span className="text-np-accent">for the real world.</span>
            </h1>
            <p className="text-lg sm:text-xl text-np-text-dim leading-relaxed mb-10 max-w-2xl opacity-0 animate-fade-in-up stagger-3">
              Machine-discoverable, machine-consumable APIs and tools that make
              agents reliable across platforms. No wrappers. No glue. Just
              primitives that work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up stagger-4">
              <Link
                href="/products"
                className="px-6 py-3 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition text-center"
              >
                Explore Products
              </Link>
              <Link
                href="https://github.com/neverparse"
                target="_blank"
                className="px-6 py-3 rounded-md border border-np-border text-np-text hover:border-np-accent/40 transition text-center"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thesis / Value Props */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group p-6 border border-np-border rounded-lg bg-np-surface hover:border-np-accent/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-np-accent/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v4l3 3" />
              </svg>
            </div>
            <div className="text-np-accent font-mono text-xs mb-2 uppercase tracking-wider">01 — Discoverable</div>
            <h3 className="font-semibold text-np-text-bright mb-2 text-lg">OpenAPI-first</h3>
            <p className="text-sm text-np-text-dim leading-relaxed">Every API ships with typed schemas, OpenAPI specs, and structured error codes. Agents can introspect before they call.</p>
          </div>
          <div className="group p-6 border border-np-border rounded-lg bg-np-surface hover:border-np-accent/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-np-accent/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="6" height="6" rx="1" />
                <rect x="11" y="3" width="6" height="6" rx="1" />
                <rect x="7" y="11" width="6" height="6" rx="1" />
              </svg>
            </div>
            <div className="text-np-accent font-mono text-xs mb-2 uppercase tracking-wider">02 — Composable</div>
            <h3 className="font-semibold text-np-text-bright mb-2 text-lg">Primitive-level</h3>
            <p className="text-sm text-np-text-dim leading-relaxed">Not apps, not wrappers. Atomic operations that compose cleanly. One input, one output, no side effects unless you ask.</p>
          </div>
          <div className="group p-6 border border-np-border rounded-lg bg-np-surface hover:border-np-accent/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-np-accent/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
              </svg>
            </div>
            <div className="text-np-accent font-mono text-xs mb-2 uppercase tracking-wider">03 — Reliable</div>
            <h3 className="font-semibold text-np-text-bright mb-2 text-lg">Built for machines</h3>
            <p className="text-sm text-np-text-dim leading-relaxed">Deterministic outputs. Structured errors. Idempotent operations. Designed for retry loops and tool-calling agents.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-np-border">
        <h2 className="text-sm font-mono text-np-accent mb-10 uppercase tracking-wider">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-np-accent/10 border border-np-accent/30 flex items-center justify-center text-np-accent font-mono text-sm font-bold">1</span>
              <div className="hidden md:block flex-1 h-px bg-np-border" />
            </div>
            <h3 className="font-semibold text-np-text-bright mb-2">POST your data</h3>
            <p className="text-sm text-np-text-dim leading-relaxed">Send any JSON payload to an endpoint. No setup, no SDK, no configuration required.</p>
            <div className="mt-4 p-3 rounded-lg bg-np-surface border border-np-border font-mono text-xs text-np-text-dim">
              <span className="text-np-accent">POST</span>{" "}/api/v1/infer/detect
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-np-accent/10 border border-np-accent/30 flex items-center justify-center text-np-accent font-mono text-sm font-bold">2</span>
              <div className="hidden md:block flex-1 h-px bg-np-border" />
            </div>
            <h3 className="font-semibold text-np-text-bright mb-2">Get structured output</h3>
            <p className="text-sm text-np-text-dim leading-relaxed">Receive a typed schema, validated result, or generated code back as clean JSON.</p>
            <div className="mt-4 p-3 rounded-lg bg-np-surface border border-np-border font-mono text-xs text-np-accent">
              {"{ \"schema\": { \"type\": \"object\" } }"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-np-accent/10 border border-np-accent/30 flex items-center justify-center text-np-accent font-mono text-sm font-bold">3</span>
            </div>
            <h3 className="font-semibold text-np-text-bright mb-2">Use it anywhere</h3>
            <p className="text-sm text-np-text-dim leading-relaxed">Plug the output into your agent, pipeline, or app. Works with any language, any framework, any LLM.</p>
            <div className="mt-4 p-3 rounded-lg bg-np-surface border border-np-border font-mono text-xs text-np-text-dim">
              TypeScript / Python / Go / cURL
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-np-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-np-text-bright">Products</h2>
            <Link href="/products" className="text-sm text-np-text-dim hover:text-np-accent transition font-mono">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-np-border">
        <div className="text-center">
          <p className="text-sm text-np-text-dim mb-6 font-mono uppercase tracking-wider">Open source. Built in public.</p>
          <div className="flex justify-center gap-8 sm:gap-12">
            <Link href="https://github.com/neverparse" target="_blank" className="group flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-np-text-bright group-hover:text-np-accent transition">GitHub</span>
              <span className="text-xs text-np-text-dim">Star us on GitHub</span>
            </Link>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-np-text-bright">{products.reduce((sum, p) => sum + p.endpoints.length, 0)}</span>
              <span className="text-xs text-np-text-dim">API endpoints</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-np-text-bright">&lt;50ms</span>
              <span className="text-xs text-np-text-dim">Avg response</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
