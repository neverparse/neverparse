import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeBlock from "@/components/CodeBlock";
import TryIt from "@/components/TryIt";
import { getProduct, getProducts } from "@/lib/registry";
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

      <div className="max-w-4xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-np-text-bright">
              {product.name}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-np-accent/20 text-np-accent">
              {product.status}
            </span>
            <span className="text-xs font-mono text-np-text-dim">
              v{product.version}
            </span>
          </div>
          <p className="text-lg text-np-text-dim">{product.tagline}</p>
        </div>

        {/* Description */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">
            What it does
          </h2>
          <p className="text-np-text leading-relaxed">{product.description}</p>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">
            Endpoints
          </h2>
          <div className="space-y-3">
            {product.endpoints.map((ep) => (
              <div
                key={ep.path}
                className="flex items-start gap-4 p-4 border border-np-border rounded-lg bg-np-surface"
              >
                <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-np-accent/20 text-np-accent shrink-0">
                  {ep.method}
                </span>
                <div>
                  <code className="text-sm text-np-text-bright font-mono">
                    {ep.path}
                  </code>
                  <p className="text-sm text-np-text-dim mt-1">
                    {ep.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Try It */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">
            Try it
          </h2>
          <TryIt
            slug={product.slug}
            endpoint={product.endpoints[0]?.path || ""}
            defaultInput={JSON.stringify(
              {
                data: { name: "Alice", age: 30, email: "alice@example.com", active: true, tags: ["admin", "user"] },
              },
              null,
              2
            )}
          />
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">
            Examples
          </h2>
          <div className="space-y-6">
            <CodeBlock code={product.examples.curl} language="bash" filename="cURL" />
            <CodeBlock
              code={product.examples.typescript}
              language="typescript"
              filename="TypeScript"
            />
            <CodeBlock
              code={product.examples.python}
              language="python"
              filename="Python"
            />
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="mb-12">
          <div className="border border-np-border rounded-lg p-8 bg-np-surface text-center">
            <h2 className="text-xl font-bold text-np-text-bright mb-2">
              Get started with {product.name}
            </h2>
            <p className="text-np-text-dim mb-6">
              Free tier available. No credit card required.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-2.5 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition">
                Sign Up Free
              </button>
              <button className="px-6 py-2.5 rounded-md border border-np-border text-np-text hover:border-np-accent/40 transition">
                View Pricing
              </button>
            </div>
          </div>
        </section>

        {/* Docs */}
        <section className="mb-12">
          <h2 className="text-sm font-mono text-np-accent mb-4 uppercase tracking-wider">
            Documentation
          </h2>
          <div className="prose prose-invert max-w-none">
            <div className="space-y-6 text-np-text">
              <div>
                <h3 className="text-lg font-semibold text-np-text-bright mb-2">Authentication</h3>
                <p className="text-sm text-np-text-dim mb-2">
                  Include your API key in the <code className="text-np-accent">Authorization</code> header:
                </p>
                <CodeBlock
                  code={`Authorization: Bearer YOUR_API_KEY`}
                  language="http"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-np-text-bright mb-2">Rate Limits</h3>
                <p className="text-sm text-np-text-dim">
                  Free tier: 100 requests/day. Pro: 10,000 requests/day. Enterprise: unlimited.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-np-text-bright mb-2">Error Codes</h3>
                <p className="text-sm text-np-text-dim">
                  All errors return structured JSON with <code className="text-np-accent">code</code>,{" "}
                  <code className="text-np-accent">message</code>, and{" "}
                  <code className="text-np-accent">details</code> fields.
                </p>
                <CodeBlock
                  code={JSON.stringify(
                    {
                      error: {
                        code: "INVALID_INPUT",
                        message: "The 'data' field is required",
                        details: { field: "data", expected: "object | array" },
                      },
                    },
                    null,
                    2
                  )}
                  language="json"
                  filename="Error Response"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
