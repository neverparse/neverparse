import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeBlock from "@/components/CodeBlock";
import TryIt from "@/components/TryIt";
import BackToTop from "@/components/BackToTop";
import { getProduct, getProducts } from "@/lib/registry";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not Found" };
  return {
    title: `${product.name} — Neverparse`,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono text-np-text-dim mb-8">
          <Link href="/" className="hover:text-np-text transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-np-text transition">Products</Link>
          <span>/</span>
          <span className="text-np-text">{product.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-np-text-bright">{product.name}</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-np-accent/20 text-np-accent">{product.status}</span>
            <span className="text-xs font-mono text-np-text-dim">v{product.version}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-np-surface-2 border border-np-border text-np-text-dim">&lt;50ms avg</span>
          </div>
          <p className="text-lg text-np-text-dim">{product.tagline}</p>
        </div>

        {/* Description */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">What it does</h2>
          <p className="text-np-text leading-relaxed">{product.description}</p>
        </section>

        {/* Try It — moved up for prominence */}
        <section className="mb-12" id="try-it">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">Try it live</h2>
          <TryIt
            slug={product.slug}
            endpoint={product.endpoints[0]?.path || ""}
            defaultInput={JSON.stringify({ data: { name: "Alice", age: 30, email: "alice@example.com", active: true, tags: ["admin", "user"] } }, null, 2)}
          />
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">Endpoints</h2>
          <div className="space-y-3">
            {product.endpoints.map((ep) => (
              <div key={ep.path} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-4 border border-np-border rounded-lg bg-np-surface">
                <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-np-accent/20 text-np-accent shrink-0 self-start">{ep.method}</span>
                <div className="flex-1 min-w-0">
                  <code className="text-sm text-np-text-bright font-mono break-all">{ep.path}</code>
                  <p className="text-sm text-np-text-dim mt-1">{ep.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Schema Table */}
          <div className="mt-6 border border-np-border rounded-lg overflow-hidden">
            <div className="bg-np-surface-2 px-4 py-2 border-b border-np-border">
              <span className="text-xs font-mono text-np-text-dim uppercase tracking-wider">Request / Response Schema</span>
            </div>
            <div className="divide-y divide-np-border">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-np-surface text-xs font-mono text-np-text-dim">
                <div className="col-span-3">Field</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-2">Required</div>
                <div className="col-span-4">Description</div>
              </div>
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm">
                <div className="col-span-3 font-mono text-np-accent text-xs">data</div>
                <div className="col-span-3 font-mono text-np-text-dim text-xs">object | array</div>
                <div className="col-span-2 text-np-text-dim text-xs">Yes</div>
                <div className="col-span-4 text-np-text-dim text-xs">The JSON data to process</div>
              </div>
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm">
                <div className="col-span-3 font-mono text-np-accent text-xs">schema</div>
                <div className="col-span-3 font-mono text-np-text-dim text-xs">object</div>
                <div className="col-span-2 text-np-text-dim text-xs">Response</div>
                <div className="col-span-4 text-np-text-dim text-xs">Inferred JSON Schema</div>
              </div>
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm">
                <div className="col-span-3 font-mono text-np-accent text-xs">format</div>
                <div className="col-span-3 font-mono text-np-text-dim text-xs">string</div>
                <div className="col-span-2 text-np-text-dim text-xs">Optional</div>
                <div className="col-span-4 text-np-text-dim text-xs">Output format (typescript, zod)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">Examples</h2>
          <div className="space-y-6">
            <CodeBlock code={product.examples.curl} language="bash" filename="cURL" />
            <CodeBlock code={product.examples.typescript} language="typescript" filename="TypeScript" />
            <CodeBlock code={product.examples.python} language="python" filename="Python" />
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="mb-12">
          <div className="border border-np-accent/20 rounded-lg p-8 bg-np-surface text-center glow">
            <h2 className="text-xl font-bold text-np-text-bright mb-2">Get started with {product.name}</h2>
            <p className="text-np-text-dim mb-6">Free tier available. No credit card required.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-up" className="px-6 py-2.5 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition">Sign Up Free</Link>
              <a href="#try-it" className="px-6 py-2.5 rounded-md border border-np-border text-np-text hover:border-np-accent/40 transition">Try it first</a>
            </div>
          </div>
        </section>

        {/* Docs */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">Documentation</h2>
          <div className="prose prose-invert max-w-none">
            <div className="space-y-6 text-np-text">
              <div>
                <h3 className="text-lg font-semibold text-np-text-bright mb-2">Authentication</h3>
                <p className="text-sm text-np-text-dim mb-2">Include your API key in the <code className="text-np-accent">Authorization</code> header:</p>
                <CodeBlock code="Authorization: Bearer YOUR_API_KEY" language="http" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-np-text-bright mb-2">Rate Limits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div className="p-3 rounded-lg bg-np-surface border border-np-border">
                    <div className="text-xs font-mono text-np-text-dim mb-1">Free</div>
                    <div className="text-sm text-np-text-bright font-semibold">100 req/day</div>
                  </div>
                  <div className="p-3 rounded-lg bg-np-surface border border-np-border">
                    <div className="text-xs font-mono text-np-text-dim mb-1">Pro</div>
                    <div className="text-sm text-np-text-bright font-semibold">10,000 req/day</div>
                  </div>
                  <div className="p-3 rounded-lg bg-np-surface border border-np-border">
                    <div className="text-xs font-mono text-np-text-dim mb-1">Enterprise</div>
                    <div className="text-sm text-np-text-bright font-semibold">Unlimited</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-np-text-bright mb-2">Error Codes</h3>
                <p className="text-sm text-np-text-dim mb-2">All errors return structured JSON with <code className="text-np-accent">code</code>, <code className="text-np-accent">message</code>, and <code className="text-np-accent">details</code> fields.</p>
                <CodeBlock code={JSON.stringify({ error: { code: "INVALID_INPUT", message: "The 'data' field is required", details: { field: "data", expected: "object | array" } } }, null, 2)} language="json" filename="Error Response" />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <BackToTop />
    </div>
  );
}
