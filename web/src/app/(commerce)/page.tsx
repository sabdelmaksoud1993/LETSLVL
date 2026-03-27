"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/commerce/product-card";
import { CategoryPills } from "@/components/commerce/category-pills";
import { formatViewerCount } from "@/lib/utils";
import {
  getProducts,
  getCategories,
} from "@/lib/supabase-data";
import {
  products as mockProducts,
  categories as mockCategories,
  streams,
} from "@/lib/mock-data";
import type { Product, Category } from "@/types/database";

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------

function ProductSkeleton() {
  return (
    <div className="bg-lvl-carbon rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-lvl-slate/50" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 rounded bg-lvl-slate/50" />
        <div className="h-4 w-full rounded bg-lvl-slate/50" />
        <div className="h-4 w-20 rounded bg-lvl-slate/50" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="rounded-xl bg-lvl-carbon p-6 animate-pulse">
      <div className="h-5 w-24 rounded bg-lvl-slate/50" />
      <div className="mt-2 h-3 w-32 rounded bg-lvl-slate/50" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lvl-carbon via-lvl-black to-lvl-carbon">
      {/* Gradient overlay accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-lvl-yellow/10 via-transparent to-lvl-yellow/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lvl-yellow/10 blur-3xl pointer-events-none" />

      <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-32">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-lvl-white leading-none">
          Built for
          <br />
          <span className="text-lvl-yellow">the bold.</span>
        </h1>
        <p className="mt-4 max-w-md text-lvl-smoke text-base sm:text-lg font-body leading-relaxed">
          Dubai&apos;s boldest destination for fashion, merchandise, and live
          auctions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/category/streetwear">
            <Button variant="primary" size="lg" className="font-display uppercase tracking-wider">
              Shop Now
            </Button>
          </Link>
          <Link href="/live">
            <Button variant="outline" size="lg" className="font-display uppercase tracking-wider">
              <Radio className="h-4 w-4" />
              Join Live
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Live Now (still uses mock streams)
// ---------------------------------------------------------------------------

function LiveNowBanner() {
  const liveStreams = streams.filter((s) => s.status === "live");
  if (liveStreams.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="live">LIVE</Badge>
          <h2 className="font-display text-xl uppercase tracking-wider text-lvl-white">
            Live Now
          </h2>
        </div>
        <Link
          href="/live"
          className="flex items-center gap-1 text-lvl-yellow text-sm font-body hover:underline"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {liveStreams.map((stream) => (
          <Link
            key={stream.id}
            href="/live"
            className="shrink-0 snap-start w-64 group"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-lvl-carbon">
              {stream.thumbnail_url && (
                <Image
                  src={stream.thumbnail_url}
                  alt={stream.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="256px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-lvl-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge variant="live">LIVE</Badge>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-lvl-white text-xs font-body font-medium truncate">
                  {stream.title}
                </p>
                <p className="text-lvl-smoke text-xs font-body mt-0.5">
                  {stream.seller.full_name} &middot;{" "}
                  {formatViewerCount(stream.viewer_count)} watching
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Trending
// ---------------------------------------------------------------------------

function TrendingSection({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
          Trending Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
        Trending Now
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function CategoriesSection({ categories, loading }: { categories: Category[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
          Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
        Categories
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative overflow-hidden rounded-xl bg-lvl-carbon p-6 hover:ring-1 hover:ring-lvl-yellow/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-lvl-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="relative font-display text-lg uppercase text-lvl-white">
              {category.name}
            </h3>
            <p className="relative mt-1 text-lvl-smoke text-xs font-body line-clamp-2">
              {category.description}
            </p>
            <ArrowRight className="relative mt-3 h-4 w-4 text-lvl-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// New Drops
// ---------------------------------------------------------------------------

function NewDropsSection({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
          New Drops
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
        New Drops
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newDrops, setNewDrops] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [cats, featured, drops] = await Promise.all([
          getCategories(),
          getProducts({ featured: true, limit: 8 }),
          getProducts({ limit: 8 }),
        ]);

        if (cancelled) return;

        // Fall back to mock data if Supabase returns empty
        setCategoriesData(cats.length > 0 ? cats : mockCategories);
        setFeaturedProducts(
          featured.length > 0
            ? featured
            : mockProducts.filter((p) => p.is_featured)
        );
        setNewDrops(
          drops.length > 0
            ? drops
            : [...mockProducts]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 8)
        );
      } catch {
        // On error, fall back to mock data
        if (!cancelled) {
          setCategoriesData(mockCategories);
          setFeaturedProducts(mockProducts.filter((p) => p.is_featured));
          setNewDrops(
            [...mockProducts]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 8)
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="pt-6">
        <CategoryPills categories={categoriesData} />
      </div>
      <div className="mt-6">
        <HeroSection />
      </div>
      <LiveNowBanner />
      <TrendingSection products={featuredProducts} loading={loading} />
      <CategoriesSection categories={categoriesData} loading={loading} />
      <NewDropsSection products={newDrops} loading={loading} />
    </main>
  );
}
