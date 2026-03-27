"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Store,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Ban,
  Eye,
  MessageSquare,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SellerRow {
  readonly id: string;
  readonly full_name: string | null;
  readonly email: string | null;
  readonly avatar_url: string | null;
  readonly country: string | null;
  readonly seller_status: string | null;
  readonly created_at: string;
}

interface SellerExpanded {
  readonly productsCount: number;
  readonly totalRevenue: number;
  readonly streamsCount: number;
  readonly products: readonly { id: string; title: string; price: number }[];
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 bg-lvl-carbon rounded-lg animate-pulse"
        >
          <div className="w-9 h-9 rounded-full bg-lvl-slate/50" />
          <div className="flex-1 h-4 bg-lvl-slate/50 rounded" />
          <div className="w-20 h-4 bg-lvl-slate/30 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { readonly status: string | null }) {
  const normalized = status ?? "pending";
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    suspended: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${styles[normalized] ?? styles.pending}`}
    >
      {normalized === "pending" && <Clock className="w-3 h-3" />}
      {normalized}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<readonly SellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Record<string, SellerExpanded>>({});

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, country, seller_status, created_at")
      .eq("role", "seller")
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (error) console.error("Sellers fetch error:", error);
    setSellers(data ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const pendingSellers = sellers.filter(
    (s) => !s.seller_status || s.seller_status === "pending"
  );
  const activeSellers = sellers.filter(
    (s) => s.seller_status && s.seller_status !== "pending"
  );

  const toggleExpand = useCallback(
    async (sellerId: string) => {
      if (expandedId === sellerId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(sellerId);
      if (expandedData[sellerId]) return;

      const supabase = createClient();
      const [productsRes, revenueRes, streamsRes, productsListRes] =
        await Promise.all([
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("seller_id", sellerId),
          supabase.from("orders").select("total").eq("seller_id", sellerId),
          supabase
            .from("streams")
            .select("id", { count: "exact", head: true })
            .eq("seller_id", sellerId),
          supabase
            .from("products")
            .select("id, title, price")
            .eq("seller_id", sellerId)
            .limit(5),
        ]);

      const totalRevenue = (revenueRes.data ?? []).reduce(
        (sum: number, o: { total: number | null }) => sum + (o.total ?? 0),
        0
      );

      setExpandedData((prev) => ({
        ...prev,
        [sellerId]: {
          productsCount: productsRes.count ?? 0,
          totalRevenue,
          streamsCount: streamsRes.count ?? 0,
          products: (productsListRes.data ?? []) as readonly {
            id: string;
            title: string;
            price: number;
          }[],
        },
      }));
    },
    [expandedId, expandedData]
  );

  const handleApprove = useCallback(
    async (sellerId: string) => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ seller_status: "active" })
        .eq("id", sellerId);
      fetchSellers();
    },
    [fetchSellers]
  );

  const handleReject = useCallback(
    async (sellerId: string) => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ seller_status: "suspended", role: "shopper" })
        .eq("id", sellerId);
      fetchSellers();
    },
    [fetchSellers]
  );

  const handleSuspend = useCallback(
    async (sellerId: string) => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ seller_status: "suspended" })
        .eq("id", sellerId);
      fetchSellers();
    },
    [fetchSellers]
  );

  const renderRow = (seller: SellerRow, showActions: boolean) => {
    const isExpanded = expandedId === seller.id;
    const detail = expandedData[seller.id];
    return (
      <Fragment key={seller.id}>
        <tr
          className="bg-lvl-carbon hover:bg-lvl-slate/30 transition-colors cursor-pointer"
          onClick={() => toggleExpand(seller.id)}
        >
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-lvl-smoke">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-lvl-slate flex items-center justify-center text-xs font-body font-bold text-lvl-white">
                  {seller.full_name?.charAt(0)?.toUpperCase() ?? "S"}
                </div>
              )}
              <span className="font-body text-sm text-lvl-white font-medium">
                {seller.full_name ?? "Unknown Seller"}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
            {seller.email ?? "-"}
          </td>
          <td className="px-4 py-3">
            <StatusBadge status={seller.seller_status} />
          </td>
          <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
            {seller.country ?? "-"}
          </td>
          <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
            {new Date(seller.created_at).toLocaleDateString()}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {showActions ? (
                <>
                  <button
                    onClick={() => handleApprove(seller.id)}
                    className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(seller.id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSuspend(seller.id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Suspend"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-lvl-white transition-colors" title="View Dashboard">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-lvl-white transition-colors" title="Message">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
        {isExpanded && (
          <tr className="bg-lvl-slate/10">
            <td colSpan={6} className="px-8 py-4">
              {detail ? (
                <div className="space-y-3">
                  <div className="flex gap-8 font-body text-sm">
                    <div>
                      <span className="text-lvl-smoke">Products: </span>
                      <span className="text-lvl-white font-medium">
                        {detail.productsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-lvl-smoke">Revenue: </span>
                      <span className="text-lvl-yellow font-medium">
                        {formatPrice(detail.totalRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-lvl-smoke">Streams: </span>
                      <span className="text-lvl-white font-medium">
                        {detail.streamsCount}
                      </span>
                    </div>
                  </div>
                  {detail.products.length > 0 && (
                    <div>
                      <p className="text-xs font-body text-lvl-smoke mb-2 uppercase tracking-wider">
                        Recent Products
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {detail.products.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-1 bg-lvl-slate/30 rounded text-xs font-body text-lvl-white"
                          >
                            {p.title} - {formatPrice(p.price)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-body text-lvl-smoke">
                  <div className="w-4 h-4 border-2 border-lvl-yellow border-t-transparent rounded-full animate-spin" />
                  Loading details...
                </div>
              )}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
          Seller Management
        </h1>
        <p className="font-body text-sm text-lvl-smoke mt-1">
          {sellers.length} total sellers &middot; {pendingSellers.length} pending
          approval
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
        <input
          type="text"
          placeholder="Search sellers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-sm font-body text-lvl-white placeholder:text-lvl-smoke focus:outline-none focus:ring-2 focus:ring-lvl-yellow focus:border-transparent"
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="w-12 h-12 text-lvl-slate mb-4" />
          <p className="font-body text-lvl-smoke">No sellers found.</p>
        </div>
      ) : (
        <>
          {/* Pending Sellers */}
          {pendingSellers.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-lvl-yellow flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approval ({pendingSellers.length})
              </h2>
              <div className="overflow-x-auto rounded-xl border border-lvl-yellow/20">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-lvl-yellow/5">
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Country
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lvl-slate/20">
                    {pendingSellers.map((s) => renderRow(s, true))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active / All Sellers */}
          {activeSellers.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-lvl-white">
                All Sellers ({activeSellers.length})
              </h2>
              <div className="overflow-x-auto rounded-xl border border-lvl-slate/30">
                <table className="w-full min-w-[700px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-lvl-slate/30">
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Country
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lvl-slate/20">
                    {activeSellers.map((s) => renderRow(s, false))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
