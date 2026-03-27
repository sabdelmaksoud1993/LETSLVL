"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { products } from "@/lib/mock-data";
import { ProductCard } from "@/components/commerce/product-card";
import type { Product } from "@/types/database";

const STORAGE_KEY = "lvl_wishlist";

function getWishlistIds(): readonly string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<readonly string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWishlistIds(getWishlistIds());
    setMounted(true);
  }, []);

  const wishlistProducts: readonly Product[] = mounted
    ? wishlistIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined)
    : [];

  const handleRemove = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <div className="min-h-screen bg-lvl-black pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-lvl-white">
          SAVED ITEMS
        </h1>
        {mounted && (
          <p className="text-lvl-smoke text-sm font-body mt-1">
            {wishlistProducts.length} item
            {wishlistProducts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Content */}
      {mounted && wishlistProducts.length > 0 ? (
        <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        mounted && (
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <Heart
              size={64}
              className="text-lvl-slate mb-4"
            />
            <p className="text-lvl-white font-display text-xl font-bold uppercase mb-2">
              No items saved yet
            </p>
            <p className="text-lvl-smoke text-sm font-body text-center mb-6">
              Tap the heart icon on any product to save it here
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-lvl-yellow text-lvl-black font-display font-bold uppercase px-6 py-3 rounded-xl hover:bg-lvl-yellow/90 transition-colors"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>
          </div>
        )
      )}
    </div>
  );
}

export default WishlistPage;
