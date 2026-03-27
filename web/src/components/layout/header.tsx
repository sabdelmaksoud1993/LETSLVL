"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCartCount } from "@/lib/cart-store";

const NAV_LINKS = [
  { label: "Shop", href: "/" },
  { label: "Live", href: "/live" },
  { label: "Drops", href: "/category/streetwear" },
] as const;

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const syncCartCount = useCallback(() => {
    setCartCount(getCartCount());
  }, []);

  useEffect(() => {
    syncCartCount();

    window.addEventListener("cart-updated", syncCartCount);
    return () => {
      window.removeEventListener("cart-updated", syncCartCount);
    };
  }, [syncCartCount]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-lvl-black/95 backdrop-blur border-b border-lvl-slate">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 shrink-0">
          <span className="font-display text-2xl font-bold uppercase tracking-tight text-lvl-white">
            LET&apos;S
          </span>
          <span className="font-display text-2xl font-bold uppercase tracking-tight text-lvl-yellow">
            LVL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-sm font-semibold uppercase tracking-wider text-lvl-smoke hover:text-lvl-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/50 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <Link
            href="/account/wishlist"
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/50 transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={20} />
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-lg text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/50 transition-colors"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-body font-bold bg-lvl-yellow text-lvl-black rounded-full">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/auth/login"
            className="hidden lg:flex items-center justify-center px-4 h-9 rounded-lg text-sm font-display uppercase tracking-wider text-lvl-smoke hover:text-lvl-white border border-lvl-slate hover:border-lvl-smoke transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/auth/register"
            className="hidden lg:flex items-center justify-center px-4 h-9 rounded-lg text-sm font-display uppercase tracking-wider bg-lvl-yellow text-lvl-black font-bold hover:bg-lvl-yellow/90 transition-colors"
          >
            Sign Up
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex lg:hidden items-center justify-center w-10 h-10 rounded-lg text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/50 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-30 bg-lvl-black/98">
          <nav className="flex flex-col gap-2 p-6" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display text-2xl font-bold uppercase tracking-wider text-lvl-white hover:text-lvl-yellow py-3 border-b border-lvl-slate transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-3 rounded-lg border border-lvl-slate text-lvl-white font-display uppercase tracking-wider hover:border-lvl-yellow transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-3 rounded-lg bg-lvl-yellow text-lvl-black font-display uppercase tracking-wider font-bold hover:bg-lvl-yellow/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export { Header };
