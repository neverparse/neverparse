import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/registry";

export default function ProductsPage() {
  const products = getProducts();
  const active = products.filter(
    (p) => p.status === "active" || p.status === "beta"
  );
  const archived = products.filter((p) => p.status === "archived");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl font-bold text-np-text-bright mb-2">
          Products
        </h1>
        <p className="text-np-text-dim mb-10">
          Agent-native primitives. Each one is an independent, composable API.
        </p>

        {active.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-mono text-np-accent mb-6 uppercase tracking-wider">
              Active
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {active.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <h2 className="text-sm font-mono text-np-text-dim mb-6 uppercase tracking-wider">
              Archived
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
              {archived.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-20 text-np-text-dim">
            <p className="text-lg">No products yet.</p>
            <p className="text-sm mt-2">The factory is warming up.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
