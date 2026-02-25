"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="border-b border-np-border bg-np-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-np-accent font-mono font-bold text-lg">
            neverparse
          </span>
        </Link>

        <nav className="flex items-center gap-6">
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
      </div>
    </header>
  );
}
