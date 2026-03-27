"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { CategoryPills } from "@/components/commerce/category-pills";
import { products, categories } from "@/lib/mock-data";

type SortOption = "newest" | "price-low" | "price-high";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under 300 AED", min: 0, max: 300 },
  { label: "300 - 600 AED", min: 300, max: 600 },
  { label: "600 - 1000 AED", min: 600, max: 1000 },
  { label: "Over 1000 AED", min: 1000, max: Infinity },
];

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const category = categories.find((c) => c.slug === params.slug);

  const filteredProducts = useMemo(() => {
    if (!category) return [];

    const categoryProducts = products.filter(
      (p) => p.category_id === category.id
    );

    const range = PRICE_RANGES[priceRange];
    const priceFiltered = categoryProducts.filter(
      (p) => p.price >= range.min && p.price < range.max
    );

    const sorted = [...priceFiltered];
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
    }

    return sorted;
  }, [category, sortBy, priceRange]);

  if (!category) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-display text-3xl uppercase text-lvl-white">
          Category Not Found
        </h1>
        <p className="mt-4 text-lvl-smoke font-body">
          The category you&apos;re looking for doesn&apos;t exist.
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

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      {/* Category pills */}
      <div className="pt-6">
        <CategoryPills categories={categories} activeSlug={params.slug} />
      </div>

      {/* Hero heading */}
      <div className="mt-8 mb-6">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-lvl-white">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-lvl-smoke font-body text-base">
            {category.description}
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-lvl-smoke text-sm font-body">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg bg-lvl-slate px-3 py-2 text-sm text-lvl-white font-body transition-colors hover:bg-lvl-slate/80 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Price range — desktop */}
          <div className="hidden sm:block relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="appearance-none rounded-lg bg-lvl-slate pl-3 pr-8 py-2 text-sm text-lvl-white font-body focus:outline-none focus:ring-1 focus:ring-lvl-yellow cursor-pointer"
              aria-label="Price range"
            >
              {PRICE_RANGES.map((range, idx) => (
                <option key={range.label} value={idx}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-lvl-smoke pointer-events-none" />
          </div>

          {/* Sort — always visible */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none rounded-lg bg-lvl-slate pl-3 pr-8 py-2 text-sm text-lvl-white font-body focus:outline-none focus:ring-1 focus:ring-lvl-yellow cursor-pointer"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-lvl-smoke pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile filters dropdown */}
      {showFilters && (
        <div className="mb-6 rounded-xl bg-lvl-carbon p-4 sm:hidden">
          <p className="text-lvl-white text-sm font-body font-medium mb-2">
            Price Range
          </p>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range, idx) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setPriceRange(idx)}
                className={`rounded-full px-3 py-1.5 text-xs font-body transition-colors ${
                  priceRange === idx
                    ? "bg-lvl-yellow text-lvl-black"
                    : "bg-lvl-slate text-lvl-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lvl-smoke font-body text-lg">
            No products found in this category.
          </p>
        </div>
      )}
    </main>
  );
}
