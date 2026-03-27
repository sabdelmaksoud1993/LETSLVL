"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Archive,
  Package,
  ChevronDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type ProductStatus = "active" | "draft";
type SortKey = "newest" | "price" | "stock";

interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly status: ProductStatus;
  readonly createdAt: string;
}

const MOCK_PRODUCTS: readonly Product[] = [
  {
    id: "p1",
    name: "Pokemon Scarlet & Violet Booster Box",
    price: 850,
    stock: 12,
    status: "active",
    createdAt: "2026-03-20",
  },
  {
    id: "p2",
    name: "One Piece TCG Romance Dawn Display",
    price: 2100,
    stock: 5,
    status: "active",
    createdAt: "2026-03-15",
  },
  {
    id: "p3",
    name: "Yu-Gi-Oh! Structure Deck: Legend of the Crystal Beasts",
    price: 180,
    stock: 30,
    status: "active",
    createdAt: "2026-03-10",
  },
  {
    id: "p4",
    name: "Digimon Card Game BT-16 Booster",
    price: 320,
    stock: 18,
    status: "active",
    createdAt: "2026-03-05",
  },
  {
    id: "p5",
    name: "Dragon Ball Super Card Game - Zenkai Series Set 7",
    price: 95,
    stock: 0,
    status: "draft",
    createdAt: "2026-02-28",
  },
  {
    id: "p6",
    name: "Magic: The Gathering Foundations Play Booster",
    price: 450,
    stock: 8,
    status: "active",
    createdAt: "2026-02-20",
  },
];

export default function SellerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortLabels: Record<SortKey, string> = {
    newest: "Newest",
    price: "Price",
    stock: "Stock",
  };

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const results = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query)
    );

    const sorted = [...results];
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        sorted.sort((a, b) => b.stock - a.stock);
        break;
    }

    return sorted;
  }, [searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/seller/dashboard"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold tracking-wider">
          MY <span className="text-lvl-yellow">PRODUCTS</span>
        </h1>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-lvl-carbon border border-lvl-slate rounded-lg py-3 pl-10 pr-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu((p) => !p)}
            className="flex items-center gap-2 bg-lvl-carbon border border-lvl-slate rounded-lg py-3 px-4 text-sm font-body text-lvl-smoke hover:text-lvl-white transition-colors"
          >
            {sortLabels[sortBy]}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 bg-lvl-carbon border border-lvl-slate rounded-lg overflow-hidden z-10 min-w-[120px]">
              {(Object.entries(sortLabels) as [SortKey, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSortBy(key);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm font-body hover:bg-lvl-slate/50 transition-colors",
                      sortBy === key
                        ? "text-lvl-yellow"
                        : "text-lvl-smoke"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-lvl-slate mb-4" />
          <p className="font-display text-lg font-bold tracking-wide mb-1">
            No products found
          </p>
          <p className="text-lvl-smoke text-sm font-body">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-lvl-carbon rounded-xl p-4 flex items-center gap-4"
            >
              {/* Thumbnail placeholder */}
              <div className="w-14 h-14 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-lvl-smoke" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lvl-yellow text-sm font-display font-bold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-lvl-smoke text-xs font-body">
                    {product.stock} in stock
                  </span>
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-display font-bold tracking-wider border",
                      product.status === "active"
                        ? "bg-green-500/20 text-green-400 border-green-500/40"
                        : "bg-lvl-slate/50 text-lvl-smoke border-lvl-slate"
                    )}
                  >
                    {product.status === "active" ? "Active" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="w-9 h-9 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-lvl-yellow/20 transition-colors"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit className="w-4 h-4 text-lvl-smoke" />
                </button>
                <button
                  type="button"
                  className="w-9 h-9 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-lvl-error/20 transition-colors"
                  aria-label={`Archive ${product.name}`}
                >
                  <Archive className="w-4 h-4 text-lvl-smoke" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
