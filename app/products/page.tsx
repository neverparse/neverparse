import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BackToTop from "@/components/BackToTop";
import { getProducts } from "@/lib/registry";
import Link from "next/link";

export default function ProductsPage() {
  const products = getProducts();
  const active = products.filter(
    (p) => p.status === "active" || p.status === "beta"
  );
  const archived = products.filter((p) => p.status === "archived");

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-np-text-dim mb-8">
          <Link href="/" className="hover:text-np-text transition">Home</Link>
          <span>/</span>
          <span className="text-np-text">Products</span>
        </nav>

        <h1 className="text-3xl font-bold text-np-text-bright mb-2">Products</h1>
        <p className="text-np-text-dim mb-8">Agent-native primitives. Each one is an independent, composable API.</p>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 mb-10">
            <span className="text-xs font-mono text-np-text-dim mr-2">Filter:</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-np-accent/20 text-np-accent border border-np-accent/30">All</span>
            {categories.map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full text-xs font-mono text-np-text-dim border border-np-border hover:border-np-accent/30 hover:text-np-text transition cursor-pointer">{cat}</span>
            ))}
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-mono text-np-accent mb-6 uppercase tracking-wider">Active</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {active.map((p) => (<ProductCard key={p.slug} product={p} />))}
            </div>
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <h2 className="text-sm font-mono text-np-text-dim mb-6 uppercase tracking-wider">Archived</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
              {archived.map((p) => (<ProductCard key={p.slug} product={p} />))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-24 text-np-text-dim border border-np-border rounded-lg bg-np-surface">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-np-accent/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-np-text-bright mb-2">No products yet</p>
            <p className="text-sm mb-6">The factory is warming up.</p>
            <Link href="https://github.com/neverparse" target="_blank" className="text-sm text-np-accent hover:text-np-accent-dim transition font-mono">Follow us on GitHub &rarr;</Link>
          </div>
        )}
      </div>
      <Footer />
      <BackToTop />
    </div>
  );
}
