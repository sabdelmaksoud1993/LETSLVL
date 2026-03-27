"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Calendar,
  RefreshCw,
  StickyNote,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrderRow {
  readonly id: string;
  readonly order_number: string | null;
  readonly user_id: string;
  readonly total: number | null;
  readonly status: string | null;
  readonly payment_status: string | null;
  readonly created_at: string;
  readonly items_count: number | null;
  readonly customer_name: string | null;
  readonly customer_email: string | null;
}

interface OrderDetail {
  readonly items: readonly { id: string; title: string; quantity: number; price: number }[];
  readonly shipping_address: string | null;
  readonly payment_method: string | null;
  readonly notes: string | null;
}

const STATUS_TABS = [
  "All",
  "Placed",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Returned",
] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function OrderStatusBadge({ status }: { readonly status: string | null }) {
  const normalized = (status ?? "placed").toLowerCase();
  const styles: Record<string, string> = {
    placed: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-cyan-500/20 text-cyan-400",
    shipped: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    returned: "bg-red-500/20 text-red-400",
    cancelled: "bg-lvl-slate/50 text-lvl-smoke",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${styles[normalized] ?? styles.placed}`}
    >
      {normalized}
    </span>
  );
}

function PaymentBadge({ status }: { readonly status: string | null }) {
  const normalized = (status ?? "pending").toLowerCase();
  const styles: Record<string, string> = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    refunded: "bg-red-500/20 text-red-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${styles[normalized] ?? styles.pending}`}
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
          <div className="w-20 h-4 bg-lvl-slate/50 rounded" />
          <div className="flex-1 h-4 bg-lvl-slate/50 rounded" />
          <div className="w-16 h-4 bg-lvl-slate/30 rounded" />
          <div className="w-16 h-4 bg-lvl-slate/30 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<readonly OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("All");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Record<string, OrderDetail>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("orders")
      .select(
        "id, order_number, user_id, total, status, payment_status, created_at, items_count, customer_name, customer_email",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusTab !== "All") {
      query = query.eq("status", statusTab.toLowerCase());
    }

    if (search.trim()) {
      query = query.or(
        `order_number.ilike.%${search.trim()}%,customer_name.ilike.%${search.trim()}%`
      );
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59");
    }

    const { data, count, error } = await query;
    if (error) console.error("Orders fetch error:", error);
    setOrders(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [statusTab, page, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(0);
  }, [statusTab, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleExpand = useCallback(
    async (orderId: string) => {
      if (expandedId === orderId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(orderId);
      if (expandedData[orderId]) return;

      const supabase = createClient();
      const [orderRes, itemsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("shipping_address, payment_method, notes")
          .eq("id", orderId)
          .single(),
        supabase
          .from("order_items")
          .select("id, title, quantity, price")
          .eq("order_id", orderId),
      ]);

      setExpandedData((prev) => ({
        ...prev,
        [orderId]: {
          items: (itemsRes.data ?? []) as readonly {
            id: string;
            title: string;
            quantity: number;
            price: number;
          }[],
          shipping_address: orderRes.data?.shipping_address ?? null,
          payment_method: orderRes.data?.payment_method ?? null,
          notes: orderRes.data?.notes ?? null,
        },
      }));
    },
    [expandedId, expandedData]
  );

  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: string) => {
      const supabase = createClient();
      await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      fetchOrders();
    },
    [fetchOrders]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
          Order Management
        </h1>
        <p className="font-body text-sm text-lvl-smoke mt-1">
          {totalCount} total orders
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-sm font-body text-lvl-white placeholder:text-lvl-smoke focus:outline-none focus:ring-2 focus:ring-lvl-yellow focus:border-transparent"
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-lvl-smoke shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-lvl-carbon border border-lvl-slate/30 rounded-lg px-3 py-2 text-sm font-body text-lvl-white focus:outline-none focus:ring-2 focus:ring-lvl-yellow"
          />
          <span className="text-lvl-smoke text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-lvl-carbon border border-lvl-slate/30 rounded-lg px-3 py-2 text-sm font-body text-lvl-white focus:outline-none focus:ring-2 focus:ring-lvl-yellow"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-lvl-carbon rounded-lg p-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-1.5 text-sm font-body font-medium rounded-md transition-colors whitespace-nowrap ${
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
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-lvl-slate mb-4" />
          <p className="font-body text-lvl-smoke">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-lvl-slate/30">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-lvl-slate/30">
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Payment
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
              {orders.map((order) => {
                const isExpanded = expandedId === order.id;
                const detail = expandedData[order.id];
                return (
                  <Fragment key={order.id}>
                    <tr
                      className="bg-lvl-carbon hover:bg-lvl-slate/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lvl-smoke">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                          <span className="font-body text-sm text-lvl-yellow font-medium">
                            #{order.order_number ?? order.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-white">
                        {order.customer_name ?? "Guest"}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-smoke text-center">
                        {order.items_count ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-white font-medium">
                        {formatPrice(order.total ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PaymentBadge status={order.payment_status} />
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={order.status ?? "placed"}
                            onChange={(e) =>
                              handleStatusUpdate(order.id, e.target.value)
                            }
                            className="bg-lvl-slate/50 text-lvl-white text-xs font-body rounded px-2 py-1 border border-lvl-slate/30 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="returned">Returned</option>
                          </select>
                          <button
                            className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-red-400 transition-colors"
                            title="Issue Refund"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-lvl-white transition-colors"
                            title="Add Note"
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-lvl-slate/10">
                        <td colSpan={8} className="px-8 py-4">
                          {detail ? (
                            <div className="space-y-4">
                              {/* Items */}
                              {detail.items.length > 0 && (
                                <div>
                                  <p className="text-xs font-body text-lvl-smoke mb-2 uppercase tracking-wider">
                                    Order Items
                                  </p>
                                  <div className="space-y-1">
                                    {detail.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex justify-between items-center py-1 px-3 bg-lvl-carbon/50 rounded text-sm font-body"
                                      >
                                        <span className="text-lvl-white">
                                          {item.title} x{item.quantity}
                                        </span>
                                        <span className="text-lvl-yellow">
                                          {formatPrice(item.price * item.quantity)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Details */}
                              <div className="flex flex-wrap gap-6 text-sm font-body">
                                {detail.shipping_address && (
                                  <div>
                                    <span className="text-lvl-smoke">Shipping: </span>
                                    <span className="text-lvl-white">
                                      {detail.shipping_address}
                                    </span>
                                  </div>
                                )}
                                {detail.payment_method && (
                                  <div>
                                    <span className="text-lvl-smoke">Payment: </span>
                                    <span className="text-lvl-white">
                                      {detail.payment_method}
                                    </span>
                                  </div>
                                )}
                                {detail.notes && (
                                  <div>
                                    <span className="text-lvl-smoke">Notes: </span>
                                    <span className="text-lvl-white">{detail.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm font-body text-lvl-smoke">
                              <div className="w-4 h-4 border-2 border-lvl-yellow border-t-transparent rounded-full animate-spin" />
                              Loading order details...
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
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
