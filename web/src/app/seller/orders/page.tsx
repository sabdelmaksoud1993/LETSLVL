"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  readonly id: string;
  readonly product_id: string;
  readonly quantity: number;
  readonly unit_price: number;
  readonly size?: string | null;
  readonly color?: string | null;
  readonly product?: {
    readonly title: string;
    readonly images: readonly string[];
  } | null;
}

interface Order {
  readonly id: string;
  readonly order_number: string;
  readonly status: string;
  readonly payment_status: string;
  readonly total: number;
  readonly shipping_address: Record<string, string> | null;
  readonly created_at: string;
  readonly buyer?: {
    readonly full_name: string | null;
    readonly email?: string;
  } | null;
  readonly order_items: readonly OrderItem[];
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
] as const;

const STATUS_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  placed: { color: "bg-lvl-yellow text-lvl-black", icon: Clock },
  confirmed: { color: "bg-blue-500/20 text-blue-400", icon: CheckCircle2 },
  packed: { color: "bg-purple-500/20 text-purple-400", icon: Package },
  shipped: { color: "bg-orange-500/20 text-orange-400", icon: Truck },
  delivered: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  returned: { color: "bg-red-500/20 text-red-400", icon: RotateCcw },
};

const FILTER_TABS = ["All", "Placed", "Confirmed", "Packed", "Shipped", "Delivered"] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ---- fetch orders --------------------------------------------------------

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();

    // Get products owned by this seller, then orders containing those products
    const { data: sellerProducts } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", user.id);

    if (!sellerProducts?.length) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const productIds = sellerProducts.map((p) => p.id);

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id")
      .in("product_id", productIds);

    if (!orderItems?.length) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];

    const { data } = await supabase
      .from("orders")
      .select(`
        id, order_number, status, payment_status, total,
        shipping_address, created_at,
        buyer:profiles!orders_user_id_fkey(full_name),
        order_items(id, product_id, quantity, unit_price, size, color,
          product:products(title, images)
        )
      `)
      .in("id", orderIds)
      .order("created_at", { ascending: false });

    setOrders((data as unknown as Order[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---- update status -------------------------------------------------------

  const updateStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      setUpdatingId(orderId);
      const supabase = createClient();
      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setUpdatingId(null);
    },
    []
  );

  // ---- filter + search -----------------------------------------------------

  const filtered = orders.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesOrder = o.order_number.toLowerCase().includes(q);
      const matchesBuyer = o.buyer?.full_name?.toLowerCase().includes(q);
      const matchesProduct = o.order_items.some((oi) =>
        oi.product?.title?.toLowerCase().includes(q)
      );
      return matchesOrder || matchesBuyer || matchesProduct;
    }
    return true;
  });

  // ---- loading / empty states ----------------------------------------------

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 bg-lvl-slate/50 rounded-lg animate-pulse w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-lvl-slate/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // ---- render --------------------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="font-display text-3xl font-bold tracking-wider mb-6">
        ORDERS
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 bg-lvl-carbon rounded-lg p-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const count =
              tab === "All"
                ? orders.length
                : orders.filter((o) => o.status === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-body font-medium whitespace-nowrap transition-colors",
                  statusFilter === tab
                    ? "bg-lvl-yellow text-lvl-black"
                    : "text-lvl-smoke hover:text-lvl-white"
                )}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, buyers, products..."
            className="w-full bg-lvl-carbon border border-lvl-slate/30 rounded-lg pl-9 pr-4 py-2 text-sm font-body text-lvl-white placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
          />
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-12 w-12 text-lvl-slate mb-4" />
          <p className="font-body text-lvl-smoke">
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.placed;
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={order.id}
                className="bg-lvl-carbon rounded-xl overflow-hidden"
              >
                {/* Order row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-lvl-slate/20 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm font-bold text-lvl-white">
                        {order.order_number}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider",
                          statusCfg.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs font-body text-lvl-smoke">
                      {order.buyer?.full_name ?? "Guest"} &middot;{" "}
                      {order.order_items.length} item
                      {order.order_items.length !== 1 ? "s" : ""} &middot;{" "}
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-display text-sm font-bold text-lvl-yellow shrink-0">
                    {formatPrice(order.total)}
                  </span>
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-lvl-smoke shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-lvl-smoke shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-lvl-slate/30 p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-body font-medium text-lvl-smoke uppercase tracking-wider mb-2">
                        Items
                      </p>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product?.title ?? "Product"}
                                className="w-10 h-10 rounded-lg object-cover bg-lvl-slate"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-lvl-slate flex items-center justify-center">
                                <Package className="w-5 h-5 text-lvl-smoke" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-body text-lvl-white truncate">
                                {item.product?.title ?? "Product"}
                              </p>
                              <p className="text-xs font-body text-lvl-smoke">
                                Qty: {item.quantity}
                                {item.size ? ` · Size: ${item.size}` : ""}
                                {item.color ? ` · ${item.color}` : ""}
                              </p>
                            </div>
                            <span className="text-sm font-body text-lvl-white shrink-0">
                              {formatPrice(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    {order.shipping_address && (
                      <div>
                        <p className="text-xs font-body font-medium text-lvl-smoke uppercase tracking-wider mb-1">
                          Shipping To
                        </p>
                        <p className="text-sm font-body text-lvl-white">
                          {order.shipping_address.full_name ?? ""}<br />
                          {order.shipping_address.address_1 ?? ""}<br />
                          {order.shipping_address.city ?? ""},{" "}
                          {order.shipping_address.country ?? ""}
                        </p>
                      </div>
                    )}

                    {/* Update status */}
                    <div>
                      <p className="text-xs font-body font-medium text-lvl-smoke uppercase tracking-wider mb-2">
                        Update Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            disabled={
                              order.status === s || updatingId === order.id
                            }
                            onClick={() => updateStatus(order.id, s)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-colors border",
                              order.status === s
                                ? "bg-lvl-yellow/20 text-lvl-yellow border-lvl-yellow/40"
                                : "bg-lvl-slate text-lvl-smoke border-lvl-slate/50 hover:border-lvl-smoke disabled:opacity-50"
                            )}
                          >
                            {updatingId === order.id ? "..." : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
