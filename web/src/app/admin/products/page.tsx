"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Package,
  Star,
  Archive,
  Eye,
  CheckSquare,
  Square,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductRow {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly stock: number | null;
  readonly category: string | null;
  readonly status: string | null;
  readonly featured: boolean | null;
  readonly image_url: string | null;
  readonly created_at: string;
  readonly seller_id: string;
  readonly seller_name: string | null;
}

const STATUS_TABS = ["All", "Active", "Draft", "Archived"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function ProductStatusBadge({ status }: { readonly status: string | null }) {
  const normalized = (status ?? "active").toLowerCase();
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    draft: "bg-yellow-500/20 text-yellow-400",
    archived: "bg-lvl-slate/50 text-lvl-smoke",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${styles[normalized] ?? styles.active}`}
    >
      {normalized}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 bg-lvl-carbon rounded-lg animate-pulse"
        >
          <div className="w-10 h-10 rounded bg-lvl-slate/50" />
          <div className="flex-1 h-4 bg-lvl-slate/50 rounded" />
          <div className="w-20 h-4 bg-lvl-slate/30 rounded" />
          <div className="w-16 h-4 bg-lvl-slate/30 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminProductsPage() {
  const [products, setProducts] = useState<readonly ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("All");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // We fetch products and join seller name from profiles
    let query = supabase
      .from("products")
      .select(
        "id, title, price, stock, category, status, featured, image_url, created_at, seller_id, profiles!products_seller_id_fkey(full_name)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusTab !== "All") {
      query = query.eq("status", statusTab.toLowerCase());
    }

    if (search.trim()) {
      query = query.or(
        `title.ilike.%${search.trim()}%,category.ilike.%${search.trim()}%`
      );
    }

    const { data, count, error } = await query;
    if (error) {
      console.error("Products fetch error:", error);
      // Fallback: try without join
      const fallbackQuery = supabase
        .from("products")
        .select(
          "id, title, price, stock, category, status, featured, image_url, created_at, seller_id",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      const fallback = await fallbackQuery;
      const mapped = (fallback.data ?? []).map((p: Record<string, unknown>) => ({
        ...p,
        seller_name: null,
      }));
      setProducts(mapped as unknown as readonly ProductRow[]);
      setTotalCount(fallback.count ?? 0);
    } else {
      const mapped = (data ?? []).map((p: Record<string, unknown>) => {
        const profilesData = p.profiles as { full_name: string | null } | null;
        return {
          ...p,
          seller_name: profilesData?.full_name ?? null,
          profiles: undefined,
        };
      });
      setProducts(mapped as unknown as readonly ProductRow[]);
      setTotalCount(count ?? 0);
    }

    setLoading(false);
  }, [statusTab, page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [statusTab, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  }, [products, selected.size]);

  const handleToggleFeatured = useCallback(
    async (productId: string, currentFeatured: boolean | null) => {
      const supabase = createClient();
      await supabase
        .from("products")
        .update({ featured: !currentFeatured })
        .eq("id", productId);
      fetchProducts();
    },
    [fetchProducts]
  );

  const handleArchive = useCallback(
    async (productId: string) => {
      const supabase = createClient();
      await supabase
        .from("products")
        .update({ status: "archived" })
        .eq("id", productId);
      fetchProducts();
    },
    [fetchProducts]
  );

  const handleBulkFeature = useCallback(async () => {
    if (selected.size === 0) return;
    const supabase = createClient();
    const ids = Array.from(selected);
    await supabase.from("products").update({ featured: true }).in("id", ids);
    setSelected(new Set());
    fetchProducts();
  }, [selected, fetchProducts]);

  const handleBulkArchive = useCallback(async () => {
    if (selected.size === 0) return;
    const supabase = createClient();
    const ids = Array.from(selected);
    await supabase
      .from("products")
      .update({ status: "archived" })
      .in("id", ids);
    setSelected(new Set());
    fetchProducts();
  }, [selected, fetchProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
            Product Management
          </h1>
          <p className="font-body text-sm text-lvl-smoke mt-1">
            {totalCount} total products
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-body text-lvl-smoke">
              {selected.size} selected
            </span>
            <button
              onClick={handleBulkFeature}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lvl-yellow/10 text-lvl-yellow text-sm font-body font-medium rounded-lg hover:bg-lvl-yellow/20 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              Feature Selected
            </button>
            <button
              onClick={handleBulkArchive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lvl-slate/50 text-lvl-smoke text-sm font-body font-medium rounded-lg hover:bg-lvl-slate/70 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive Selected
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
        <input
          type="text"
          placeholder="Search by title or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-sm font-body text-lvl-white placeholder:text-lvl-smoke focus:outline-none focus:ring-2 focus:ring-lvl-yellow focus:border-transparent"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-lvl-carbon rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-1.5 text-sm font-body font-medium rounded-md transition-colors ${
              statusTab === tab
                ? "bg-lvl-yellow text-lvl-black"
                : "text-lvl-smoke hover:text-lvl-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-lvl-slate mb-4" />
          <p className="font-body text-lvl-smoke">No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-lvl-slate/30">
          <table className="w-full min-w-[1000px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-lvl-slate/30">
                <th className="px-4 py-3 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-lvl-smoke hover:text-lvl-white"
                  >
                    {selected.size === products.length && products.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-lvl-yellow" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Seller
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Featured
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lvl-slate/20">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="bg-lvl-carbon hover:bg-lvl-slate/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(product.id)}
                      className="text-lvl-smoke hover:text-lvl-white"
                    >
                      {selected.has(product.id) ? (
                        <CheckSquare className="w-4 h-4 text-lvl-yellow" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-lvl-slate"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-lvl-slate flex items-center justify-center">
                          <Package className="w-4 h-4 text-lvl-smoke" />
                        </div>
                      )}
                      <span className="font-body text-sm text-lvl-white font-medium truncate max-w-[180px]">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                    {product.seller_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-lvl-white font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                    {product.stock ?? 0}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
                    {product.category ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleToggleFeatured(product.id, product.featured)
                      }
                      className={`p-1 rounded transition-colors ${
                        product.featured
                          ? "text-lvl-yellow"
                          : "text-lvl-slate hover:text-lvl-yellow"
                      }`}
                      title={product.featured ? "Unfeature" : "Feature"}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={product.featured ? "currentColor" : "none"}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-lvl-white transition-colors"
                        title="View Product"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(product.id)}
                        className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-red-400 transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-body text-sm text-lvl-smoke">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 text-sm font-body bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-lvl-smoke hover:text-lvl-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm font-body bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-lvl-smoke hover:text-lvl-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
