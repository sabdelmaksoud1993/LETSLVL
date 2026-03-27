import Link from "next/link";
import {
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Radio,
  Edit,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PayoutSetup } from "@/components/seller/payout-setup";

const STATS = [
  {
    label: "Total Revenue",
    value: formatPrice(34_500),
    icon: DollarSign,
    change: "+12%",
  },
  { label: "Active Products", value: "28", icon: Package, change: "+3" },
  { label: "Stream Hours", value: "46h", icon: Clock, change: "+8h" },
  {
    label: "Conversion Rate",
    value: "4.2%",
    icon: TrendingUp,
    change: "+0.5%",
  },
] as const;

const RECENT_ORDERS = [
  {
    id: "LVL-9201",
    buyer: "Sara K.",
    product: "Pokemon Base Set Booster",
    total: 1200,
    status: "shipped",
  },
  {
    id: "LVL-9198",
    buyer: "Omar R.",
    product: "One Piece Manga Box Set",
    total: 850,
    status: "confirmed",
  },
  {
    id: "LVL-9195",
    buyer: "Fatima H.",
    product: "Digimon Card Game Booster",
    total: 320,
    status: "placed",
  },
] as const;

const ACTIVE_PRODUCTS = [
  { id: "p1", name: "Pokemon SV Booster Box", price: 850, stock: 12 },
  { id: "p2", name: "One Piece TCG Display", price: 2100, stock: 5 },
  { id: "p3", name: "Yu-Gi-Oh! Starter Deck", price: 180, stock: 30 },
] as const;

const UPCOMING_STREAMS = [
  {
    id: "s1",
    title: "Pokemon Pack Opening Marathon",
    date: "2026-03-28",
    time: "8:00 PM GST",
  },
  {
    id: "s2",
    title: "One Piece TCG New Arrivals",
    date: "2026-03-30",
    time: "9:00 PM GST",
  },
] as const;

function StatusDot({ status }: { status: string }) {
  const color: Record<string, string> = {
    placed: "bg-lvl-yellow",
    confirmed: "bg-blue-400",
    shipped: "bg-orange-400",
    delivered: "bg-green-400",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color[status] ?? "bg-lvl-smoke"}`}
    />
  );
}

export default function SellerDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold tracking-wider">
          SELLER <span className="text-lvl-yellow">DASHBOARD</span>
        </h1>
        <Link
          href="/seller/go-live"
          className="flex items-center gap-2 bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <Radio className="w-4 h-4" />
          Go Live
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-lvl-carbon rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-lvl-yellow" />
              <span className="text-lvl-smoke text-xs font-body">
                {stat.label}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-green-400 text-xs font-body mt-1">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold tracking-wide">
              Recent Orders
            </h2>
            <Link
              href="/seller/orders"
              className="text-lvl-yellow text-xs font-body hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-lvl-carbon rounded-xl divide-y divide-lvl-slate/40">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-4"
              >
                <StatusDot status={order.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">
                    {order.product}
                  </p>
                  <p className="text-lvl-smoke text-xs font-body">
                    {order.buyer} &middot; {order.id}
                  </p>
                </div>
                <p className="font-display text-sm font-bold shrink-0">
                  {formatPrice(order.total)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold tracking-wide">
              Active Products
            </h2>
            <Link
              href="/seller/products"
              className="text-lvl-yellow text-xs font-body hover:underline flex items-center gap-1"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {ACTIVE_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="bg-lvl-carbon rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-lvl-smoke" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">{product.name}</p>
                  <p className="text-lvl-smoke text-xs font-body">
                    {formatPrice(product.price)} &middot; {product.stock} in
                    stock
                  </p>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-lvl-yellow/20 transition-colors shrink-0"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit className="w-4 h-4 text-lvl-smoke" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Upcoming Streams */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold tracking-wide mb-3">
          Upcoming Streams
        </h2>
        <div className="space-y-2">
          {UPCOMING_STREAMS.map((stream) => (
            <div
              key={stream.id}
              className="bg-lvl-carbon rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-lvl-yellow/10 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-lvl-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium truncate">
                  {stream.title}
                </p>
                <p className="text-lvl-smoke text-xs font-body">
                  {new Date(stream.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at {stream.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Performance Chart Placeholder */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold tracking-wide">
            Performance
          </h2>
          <Link
            href="/seller/analytics"
            className="text-lvl-yellow text-xs font-body hover:underline flex items-center gap-1"
          >
            Full Analytics <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-lvl-carbon rounded-xl p-6 h-48 flex items-center justify-center relative overflow-hidden">
          {/* Gradient bars to simulate chart */}
          <div className="absolute inset-0 flex items-end gap-2 px-6 pb-6">
            {[40, 55, 35, 70, 60, 80, 65, 90, 75, 85, 50, 95].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-lvl-yellow/40 to-lvl-yellow/10"
                  style={{ height: `${h}%` }}
                />
              )
            )}
          </div>
          <p className="relative z-10 text-lvl-smoke text-xs font-body bg-lvl-carbon/80 px-3 py-1.5 rounded-full">
            Revenue over last 12 months
          </p>
        </div>
      </section>
      {/* Payouts */}
      <section className="mt-6">
        <PayoutSetup />
      </section>

      {/* View Full Analytics */}
      <Link href="/seller/analytics" className="block mt-6">
        <div className="bg-lvl-carbon rounded-xl p-4 flex items-center gap-4 hover:ring-1 hover:ring-lvl-yellow/40 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-lvl-yellow/10 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-lvl-yellow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-medium">View Full Analytics</p>
            <p className="text-lvl-smoke text-xs font-body">
              View detailed analytics, revenue charts, and customer insights
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-lvl-smoke group-hover:text-lvl-yellow transition-colors shrink-0" />
        </div>
      </Link>
    </div>
  );
}
