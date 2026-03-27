"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingBag,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered";

interface OrderItem {
  readonly name: string;
  readonly image: string;
  readonly price: number;
  readonly quantity: number;
}

interface Order {
  readonly id: string;
  readonly date: string;
  readonly status: OrderStatus;
  readonly total: number;
  readonly items: readonly OrderItem[];
}

const STATUS_CONFIG: Record<
  OrderStatus,
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
  shipped: {
    label: "Shipped",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-500/20 text-green-400 border-green-500/40",
  },
};

const MOCK_ORDERS: readonly Order[] = [
  {
    id: "LVL-20260301",
    date: "2026-03-01",
    status: "delivered",
    total: 1250,
    items: [
      {
        name: "Pokemon Booster Box - Scarlet & Violet",
        image: "/placeholder.jpg",
        price: 850,
        quantity: 1,
      },
      {
        name: "Card Sleeves Ultra Pro x100",
        image: "/placeholder.jpg",
        price: 400,
        quantity: 1,
      },
    ],
  },
  {
    id: "LVL-20260315",
    date: "2026-03-15",
    status: "shipped",
    total: 2100,
    items: [
      {
        name: "One Piece TCG Display Box",
        image: "/placeholder.jpg",
        price: 2100,
        quantity: 1,
      },
    ],
  },
  {
    id: "LVL-20260325",
    date: "2026-03-25",
    status: "placed",
    total: 680,
    items: [
      {
        name: "Yu-Gi-Oh! Structure Deck",
        image: "/placeholder.jpg",
        price: 180,
        quantity: 2,
      },
      {
        name: "Deck Protector Binder",
        image: "/placeholder.jpg",
        price: 320,
        quantity: 1,
      },
    ],
  },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
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
              {order.id}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-lvl-smoke text-xs font-body">
            {new Date(order.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="font-display font-bold text-sm">
            {formatPrice(order.total)}
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
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-lvl-slate shrink-0 flex items-center justify-center">
                <Package className="w-5 h-5 text-lvl-smoke" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body truncate">{item.name}</p>
                <p className="text-lvl-smoke text-xs font-body">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-display font-bold shrink-0">
                {formatPrice(item.price)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const orders = MOCK_ORDERS;

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

      {orders.length === 0 ? (
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
