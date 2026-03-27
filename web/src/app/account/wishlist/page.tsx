"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, LogIn } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { getWishlist, removeFromWishlist } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import type { WishlistItem } from "@/types/database";

function WishlistSkeleton() {
  return (
    <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-lvl-carbon rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[4/5] bg-lvl-slate/50" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-16 rounded bg-lvl-slate/50" />
            <div className="h-4 w-full rounded bg-lvl-slate/50" />
            <div className="h-4 w-20 rounded bg-lvl-slate/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const items = await getWishlist(user!.id);
        if (!cancelled) setWishlistItems(items);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleRemove = useCallback(
    async (productId: string) => {
      if (!user) return;
      try {
        await removeFromWishlist(user.id, productId);
        setWishlistItems((prev) =>
          prev.filter((item) => item.product_id !== productId)
        );
      } catch (err) {
        console.error("Failed to remove from wishlist:", err);
      }
    },
    [user]
  );

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-lvl-black pb-24">
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <LogIn size={64} className="text-lvl-slate mb-4" />
          <p className="text-lvl-white font-display text-xl font-bold uppercase mb-2">
            Sign in to save items
          </p>
          <p className="text-lvl-smoke text-sm font-body text-center mb-6">
            Create an account or sign in to save your favorite items
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-lvl-yellow text-lvl-black font-display font-bold uppercase px-6 py-3 rounded-xl hover:bg-lvl-yellow/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const wishlistProducts = wishlistItems
    .map((item) => item.product)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-lvl-black pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-lvl-white">
          SAVED ITEMS
        </h1>
        {!loading && (
          <p className="text-lvl-smoke text-sm font-body mt-1">
            {wishlistProducts.length} item
            {wishlistProducts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Content */}
      {loading || authLoading ? (
        <WishlistSkeleton />
      ) : wishlistProducts.length > 0 ? (
        <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
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
            href="/"
            className="inline-flex items-center gap-2 bg-lvl-yellow text-lvl-black font-display font-bold uppercase px-6 py-3 rounded-xl hover:bg-lvl-yellow/90 transition-colors"
          >
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
