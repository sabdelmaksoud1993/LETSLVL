"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCartCount } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Shop", href: "/" },
  { label: "Live", href: "/live" },
  { label: "Drops", href: "/category/streetwear" },
] as const;

function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!user) return null;

  const displayName = profile?.full_name || user.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg px-2 h-9 text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/50 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-lvl-yellow text-lvl-black font-display text-sm font-bold">
          {initial}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-lvl-carbon border border-lvl-slate/50 shadow-xl py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-lvl-slate/30">
            <p className="font-body text-sm text-lvl-white font-medium truncate">
              {displayName}
            </p>
            <p className="font-body text-xs text-lvl-smoke truncate">
              {user.email}
            </p>
          </div>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/30 transition-colors"
          >
            <User size={16} />
            My Account
          </Link>

          <Link
            href="/seller/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/30 transition-colors"
          >
            <LayoutDashboard size={16} />
            Seller Dashboard
          </Link>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-lvl-yellow hover:text-lvl-yellow hover:bg-lvl-yellow/10 transition-colors"
            >
              <Shield size={16} />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-lvl-slate/30 mt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-body text-red-400 hover:text-red-300 hover:bg-lvl-slate/30 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

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

          {/* Desktop Auth Buttons / User Menu */}
          {!loading && (
            <div className="hidden lg:flex items-center gap-1">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center px-4 h-9 rounded-lg text-sm font-display uppercase tracking-wider text-lvl-smoke hover:text-lvl-white border border-lvl-slate hover:border-lvl-smoke transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center px-4 h-9 rounded-lg text-sm font-display uppercase tracking-wider bg-lvl-yellow text-lvl-black font-bold hover:bg-lvl-yellow/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}

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
              {!loading && user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 rounded-lg border border-lvl-slate text-lvl-white font-display uppercase tracking-wider hover:border-lvl-yellow transition-colors justify-center"
                  >
                    <User size={18} />
                    My Account
                  </Link>
                  <Link
                    href="/seller/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 rounded-lg border border-lvl-slate text-lvl-white font-display uppercase tracking-wider hover:border-lvl-yellow transition-colors justify-center"
                  >
                    <LayoutDashboard size={18} />
                    Seller Dashboard
                  </Link>
                  {profile?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 rounded-lg border border-lvl-yellow/50 text-lvl-yellow font-display uppercase tracking-wider hover:border-lvl-yellow transition-colors justify-center"
                    >
                      <Shield size={18} />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 py-3 rounded-lg border border-red-500/30 text-red-400 font-display uppercase tracking-wider hover:border-red-500 transition-colors justify-center"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export { Header };
