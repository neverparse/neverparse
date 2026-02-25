import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-np-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-np-text-dim">
          <span className="font-mono text-np-accent">neverparse</span>{" "}
          &mdash; agent-native primitives
        </div>
        <div className="flex items-center gap-6 text-sm text-np-text-dim">
          <Link href="/products" className="hover:text-np-text transition">
            Products
          </Link>
          <Link
            href="https://github.com/neverparse"
            target="_blank"
            className="hover:text-np-text transition"
          >
            GitHub
          </Link>
          <a
            href="mailto:founders@neverparse.com"
            className="hover:text-np-text transition"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
