"use client";

import Link from "next/link";
import { useState } from "react";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
      {submitted ? (
        <p className="text-sm text-np-accent font-mono py-2">
          Thanks! We&apos;ll keep you posted.
        </p>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="px-3 py-2 rounded-md bg-np-bg border border-np-border text-sm text-np-text placeholder:text-np-text-dim focus:outline-none focus:border-np-accent/50 w-full sm:w-64 transition"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-np-accent text-np-bg text-sm font-medium hover:bg-np-accent-dim transition shrink-0"
          >
            Subscribe
          </button>
        </>
      )}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-np-border mt-auto">
      {/* Newsletter CTA */}
      <div className="max-w-6xl mx-auto px-6 py-10 border-b border-np-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-np-text-bright mb-1">
              Stay in the loop
            </h3>
            <p className="text-sm text-np-text-dim">
              Get notified when we ship new primitives.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Footer links */}
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
