import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="font-mono text-6xl font-bold text-np-accent mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold text-np-text-bright mb-3">
            Page not found
          </h1>
          <p className="text-np-text-dim mb-8">
            The resource you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition"
            >
              Go Home
            </Link>
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-md border border-np-border text-np-text hover:border-np-accent/40 transition"
            >
              View Products
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
