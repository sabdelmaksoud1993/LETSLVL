"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/supabase-data";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
}

function getDiscountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const hasSale = product.compare_at_price !== null;
  const isLimited = product.inventory_count < 5;
  const isLiveExclusive = product.is_live_exclusive;

  // Check wishlist status on mount when user is logged in
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function check() {
      try {
        const result = await isInWishlist(user!.id, product.id);
        if (!cancelled) setIsWishlisted(result);
      } catch {
        // Silently ignore errors on wishlist check
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [user, product.id]);

  const handleWishlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (wishlistLoading) return;
      setWishlistLoading(true);

      try {
        if (isWishlisted) {
          await removeFromWishlist(user.id, product.id);
          setIsWishlisted(false);
        } else {
          await addToWishlist(user.id, product.id);
          setIsWishlisted(true);
        }
      } catch (err) {
        console.error("Wishlist error:", err);
      } finally {
        setWishlistLoading(false);
      }
    },
    [user, product.id, isWishlisted, wishlistLoading, router]
  );

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-lvl-carbon rounded-xl overflow-hidden hover:ring-1 hover:ring-lvl-yellow/30 transition-all duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.images[0] ?? ""}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasSale && (
            <Badge variant="new">
              SALE
            </Badge>
          )}
          {isLimited && (
            <Badge variant="limited">
              LIMITED
            </Badge>
          )}
          {isLiveExclusive && (
            <Badge variant="live">
              LIVE EXCLUSIVE
            </Badge>
          )}
        </div>

        {/* Wishlist heart — top right */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-lvl-black/60 backdrop-blur-sm transition-colors hover:bg-lvl-black/80 disabled:opacity-50"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted
                ? "fill-lvl-yellow text-lvl-yellow"
                : "text-lvl-white"
            )}
          />
        </button>
      </div>

      <div className="p-3">
        <p className="text-lvl-smoke text-xs uppercase tracking-wider font-body">
          {product.brand}
        </p>
        <h3 className="text-lvl-white font-medium text-sm mt-1 line-clamp-2 font-body">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lvl-white font-semibold text-sm font-body">
            {formatPrice(product.price, product.currency)}
          </span>
          {hasSale && product.compare_at_price !== null && (
            <>
              <span className="text-lvl-smoke text-xs line-through font-body">
                {formatPrice(product.compare_at_price, product.currency)}
              </span>
              <span className="text-lvl-yellow text-xs font-bold font-body">
                -{getDiscountPercent(product.price, product.compare_at_price)}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export { ProductCard, type ProductCardProps };
