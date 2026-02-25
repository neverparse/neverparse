"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-np-border bg-np-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-np-accent font-mono font-bold text-lg">
            neverparse
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-np-text-dim hover:text-np-text transition"
          >
            Products
          </Link>
          <Link
            href="https://github.com/neverparse"
            target="_blank"
            className="text-sm text-np-text-dim hover:text-np-text transition"
          >
            GitHub
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm px-4 py-1.5 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-8 h-8" },
              }}
            />
          </SignedIn>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-np-text transition-transform duration-200 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-np-text transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-np-text transition-transform duration-200 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-np-border bg-np-bg/95 backdrop-blur-md">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-np-text-dim hover:text-np-text transition py-1"
            >
              Products
            </Link>
            <Link
              href="https://github.com/neverparse"
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-np-text-dim hover:text-np-text transition py-1"
            >
              GitHub
            </Link>
            <div className="pt-2 border-t border-np-border">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm px-4 py-1.5 rounded-md bg-np-accent text-np-bg font-medium hover:bg-np-accent-dim transition">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: { avatarBox: "w-8 h-8" },
                  }}
                />
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
