"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  getSellerProducts,
  deleteSellerProduct,
  type SellerProduct,
} from "@/lib/seller-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "active" | "draft" | "archived";
type SortKey = "newest" | "price" | "stock";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SellerProductsPage() {
  const [products, setProducts] = useState<readonly SellerProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ---- load & listen for changes --------------------------------------------

  const loadProducts = useCallback(() => {
    setProducts(getSellerProducts());
  }, []);

  useEffect(() => {
    loadProducts();

    const handler = () => loadProducts();
    window.addEventListener("seller-products-updated", handler);
    return () => window.removeEventListener("seller-products-updated", handler);
  }, [loadProducts]);

  // ---- counts per status ----------------------------------------------------

  const counts = useMemo(() => {
    const all = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const draft = products.filter((p) => p.status === "draft").length;
    const archived = products.filter((p) => p.status === "archived").length;
    return { all, active, draft, archived };
  }, [products]);

  // ---- filter & sort --------------------------------------------------------

  const sortLabels: Record<SortKey, string> = {
    newest: "Newest",
    price: "Price",
    stock: "Stock",
  };

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const results = products.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ? true : p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...results];
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      case "price":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        sorted.sort((a, b) => b.inventory_count - a.inventory_count);
        break;
    }

    return sorted;
  }, [products, searchQuery, statusFilter, sortBy]);

  // ---- archive handler ------------------------------------------------------

  const handleArchive = useCallback(
    (id: string, name: string) => {
      if (window.confirm(`Archive "${name}"? It will no longer be visible to buyers.`)) {
        deleteSellerProduct(id);
        loadProducts();
      }
    },
    [loadProducts]
  );

  // ---- status tab config ----------------------------------------------------

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Draft" },
    { key: "archived", label: "Archived" },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 bg-lvl-carbon rounded-lg p-1">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-display font-bold tracking-wider transition-colors",
              statusFilter === key
                ? "bg-lvl-yellow text-lvl-black"
                : "text-lvl-smoke hover:text-lvl-white"
            )}
          >
            {label}{" "}
            <span
              className={cn(
                "ml-1 text-xs",
                statusFilter === key
                  ? "text-lvl-black/60"
                  : "text-lvl-smoke/60"
              )}
            >
              {counts[key]}
            </span>
          </button>
        ))}
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
            {statusFilter !== "all"
              ? `No ${statusFilter} products match your search`
              : "Try a different search term"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-lvl-carbon rounded-xl p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0 overflow-hidden">
                {product.images.length > 0 && product.images[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement)
                        .parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lvl-smoke"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
                      }
                    }}
                  />
                ) : (
                  <Package className="w-6 h-6 text-lvl-smoke" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium truncate">
                  {product.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lvl-yellow text-sm font-display font-bold">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-lvl-smoke text-xs font-body">
                    {product.inventory_count} in stock
                  </span>
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-display font-bold tracking-wider border",
                      product.status === "active"
                        ? "bg-green-500/20 text-green-400 border-green-500/40"
                        : product.status === "draft"
                          ? "bg-lvl-slate/50 text-lvl-smoke border-lvl-slate"
                          : "bg-red-500/20 text-red-400 border-red-500/40"
                    )}
                  >
                    {product.status === "active"
                      ? "Active"
                      : product.status === "draft"
                        ? "Draft"
                        : "Archived"}
                  </span>
                  {product.is_live_exclusive && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-display font-bold tracking-wider bg-lvl-yellow/20 text-lvl-yellow border border-lvl-yellow/40">
                      LIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/seller/products/${product.id}/edit`}
                  className="w-9 h-9 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-lvl-yellow/20 transition-colors"
                  aria-label={`Edit ${product.title}`}
                >
                  <Edit className="w-4 h-4 text-lvl-smoke" />
                </Link>
                {product.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => handleArchive(product.id, product.title)}
                    className="w-9 h-9 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    aria-label={`Archive ${product.title}`}
                  >
                    <Archive className="w-4 h-4 text-lvl-smoke" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
