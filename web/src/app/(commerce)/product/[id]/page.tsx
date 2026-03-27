"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Minus, Plus, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/commerce/product-card";
import { addToCart } from "@/lib/cart-store";
import { products, categories } from "@/lib/mock-data";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = products.find((p) => p.id === params.id);

  const category = product
    ? categories.find((c) => c.id === product.category_id)
    : null;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-display text-3xl uppercase text-lvl-white">
          Product Not Found
        </h1>
        <p className="mt-4 text-lvl-smoke font-body">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-lvl-yellow hover:underline font-body"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  const hasSale = product.compare_at_price !== null;
  const discountPercent = hasSale && product.compare_at_price !== null
    ? Math.round(
        ((product.compare_at_price - product.price) / product.compare_at_price) *
          100
      )
    : 0;

  function handleAddToCart() {
    addToCart(product!, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 pt-6 pb-6 text-sm font-body"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="text-lvl-smoke hover:text-lvl-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-lvl-smoke" />
        {category && (
          <>
            <Link
              href={`/category/${category.slug}`}
              className="text-lvl-smoke hover:text-lvl-white transition-colors"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-lvl-smoke" />
          </>
        )}
        <span className="text-lvl-white truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-lvl-carbon">
            <Image
              src={product.images[selectedImage] ?? product.images[0] ?? ""}
              alt={`${product.title} - Image ${selectedImage + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {hasSale && <Badge variant="new">SALE</Badge>}
              {product.inventory_count < 5 && (
                <Badge variant="limited">LIMITED</Badge>
              )}
              {product.is_live_exclusive && (
                <Badge variant="live">LIVE EXCLUSIVE</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors",
                    selectedImage === idx
                      ? "border-lvl-yellow"
                      : "border-transparent hover:border-lvl-slate"
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <p className="text-lvl-smoke text-xs uppercase tracking-wider font-body">
            {product.brand}
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl uppercase tracking-tight text-lvl-white">
            {product.title}
          </h1>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-2xl text-lvl-white">
              {formatPrice(product.price, product.currency)}
            </span>
            {hasSale && product.compare_at_price !== null && (
              <>
                <span className="text-lvl-smoke text-lg line-through font-body">
                  {formatPrice(product.compare_at_price, product.currency)}
                </span>
                <Badge variant="new">-{discountPercent}%</Badge>
              </>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 text-lvl-smoke font-body text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-lvl-white text-sm font-body font-medium mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[44px] rounded-lg px-3 py-2 text-sm font-body font-medium transition-colors",
                      selectedSize === size
                        ? "bg-lvl-yellow text-lvl-black"
                        : "bg-lvl-slate text-lvl-white hover:bg-lvl-slate/80"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-lvl-white text-sm font-body font-medium mb-2">
                Color{selectedColor ? `: ${selectedColor}` : ""}
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  const colorMap: Record<string, string> = {
                    Black: "#000000",
                    White: "#FFFFFF",
                    "Dark Oatmeal": "#8B7D6B",
                    Cement: "#B0A999",
                    Multi: "linear-gradient(135deg, #ff6b6b, #4ecdc4, #ffe66d)",
                    "Black/Yellow": "linear-gradient(135deg, #000, #F5C518)",
                    "Fossil Stone": "#C4B9A7",
                  };
                  const bg = colorMap[color] ?? "#666666";
                  const isGradient = bg.startsWith("linear");

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition-all",
                        selectedColor === color
                          ? "border-lvl-yellow ring-2 ring-lvl-yellow/50 ring-offset-2 ring-offset-lvl-black"
                          : "border-lvl-slate hover:border-lvl-smoke"
                      )}
                      style={{
                        background: isGradient ? bg : undefined,
                        backgroundColor: isGradient ? undefined : bg,
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <p className="text-lvl-white text-sm font-body font-medium mb-2">
              Quantity
            </p>
            <div className="inline-flex items-center rounded-lg bg-lvl-slate">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-lvl-white hover:text-lvl-yellow transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-lvl-white font-body font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-lvl-white hover:text-lvl-yellow transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              className="font-display uppercase tracking-wider"
            >
              {addedToCart ? "ADDED!" : "ADD TO CART"}
            </Button>
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => setIsWishlisted((prev) => !prev)}
              className="font-display uppercase tracking-wider"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isWishlisted && "fill-lvl-yellow text-lvl-yellow"
                )}
              />
              {isWishlisted ? "WISHLISTED" : "ADD TO WISHLIST"}
            </Button>
          </div>

          {/* Inventory notice */}
          {product.inventory_count < 10 && (
            <p className="mt-4 text-lvl-warning text-sm font-body">
              Only {product.inventory_count} left in stock
            </p>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl uppercase tracking-wider text-lvl-white mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
