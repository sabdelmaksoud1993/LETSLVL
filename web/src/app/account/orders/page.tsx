"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingBag,
  LogIn,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getUserOrders } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import type { Order } from "@/types/database";

type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "returned";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  placed: {
    label: "Placed",
    className: "bg-lvl-yellow/20 text-lvl-yellow border-lvl-yellow/40",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  packed: {
    label: "Packed",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  },
  shipped: {
    label: "Shipped",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-500/20 text-green-400 border-green-500/40",
  },
  returned: {
    label: "Returned",
    className: "bg-red-500/20 text-red-400 border-red-500/40",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.placed;
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-bold tracking-wider border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const orderNumber = (order as unknown as Record<string, unknown>).order_number as string | undefined;
  const displayId = orderNumber ?? order.id;

  return (
    <div className="bg-lvl-carbon rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-lvl-slate/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <p className="font-display text-sm font-bold tracking-wide">
              {displayId}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-lvl-smoke text-xs font-body">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="font-display font-bold text-sm">
            {formatPrice(order.total, order.currency)}
          </p>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-lvl-smoke" />
          ) : (
            <ChevronDown className="w-4 h-4 text-lvl-smoke" />
          )}
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-lvl-slate/40 p-4 space-y-3">
          {(order.items ?? []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-lvl-slate shrink-0 flex items-center justify-center">
                <Package className="w-5 h-5 text-lvl-smoke" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body truncate">{item.title}</p>
                <p className="text-lvl-smoke text-xs font-body">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-display font-bold shrink-0">
                {formatPrice(item.price)}
              </p>
            </div>
          ))}

          {order.tracking_number && (
            <div className="pt-2 border-t border-lvl-slate/40">
              <p className="text-lvl-smoke text-xs font-body">
                Tracking: <span className="text-lvl-white">{order.tracking_number}</span>
                {order.carrier && ` (${order.carrier})`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-lvl-carbon rounded-xl p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-lvl-slate/50" />
              <div className="h-3 w-24 rounded bg-lvl-slate/50" />
            </div>
            <div className="h-4 w-20 rounded bg-lvl-slate/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const data = await getUserOrders(user!.id);
        if (!cancelled) setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-2xl mx-auto text-center">
        <LogIn className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-wider">
          SIGN IN TO VIEW <span className="text-lvl-yellow">ORDERS</span>
        </h1>
        <p className="mt-2 text-lvl-smoke font-body text-sm">
          You need to be logged in to see your order history.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest py-3 px-8 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Account
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-wider mb-6">
        MY <span className="text-lvl-yellow">ORDERS</span>
      </h1>

      {loading || authLoading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-lvl-slate mb-4" />
          <p className="font-display text-lg font-bold tracking-wide mb-1">
            No orders yet
          </p>
          <p className="text-lvl-smoke text-sm font-body mb-6">
            Start shopping to see your orders here
          </p>
          <Link
            href="/"
            className="bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest py-3 px-8 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
