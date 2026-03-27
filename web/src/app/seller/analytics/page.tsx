"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Radio,
  Eye,
  Users,
  Trophy,
  Package,
  Plus,
  Clock,
  ChevronRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MONTHLY_REVENUE = [
  { month: "Apr", value: 18_200 },
  { month: "May", value: 21_400 },
  { month: "Jun", value: 19_800 },
  { month: "Jul", value: 24_100 },
  { month: "Aug", value: 22_600 },
  { month: "Sep", value: 28_900 },
  { month: "Oct", value: 26_300 },
  { month: "Nov", value: 31_500 },
  { month: "Dec", value: 38_200 },
  { month: "Jan", value: 29_800 },
  { month: "Feb", value: 30_700 },
  { month: "Mar", value: 34_500 },
];

const WEEKLY_REVENUE = [
  { month: "Mon", value: 4_200 },
  { month: "Tue", value: 5_100 },
  { month: "Wed", value: 3_800 },
  { month: "Thu", value: 6_200 },
  { month: "Fri", value: 7_800 },
  { month: "Sat", value: 4_500 },
  { month: "Sun", value: 2_900 },
];

const THIRTY_DAY_REVENUE = [
  { month: "W1", value: 7_200 },
  { month: "W2", value: 8_900 },
  { month: "W3", value: 9_400 },
  { month: "W4", value: 9_000 },
];

const NINETY_DAY_REVENUE = [
  { month: "Jan", value: 29_800 },
  { month: "Feb", value: 30_700 },
  { month: "Mar", value: 34_500 },
];

const CHART_DATA_MAP: Record<string, readonly { month: string; value: number }[]> = {
  "7D": WEEKLY_REVENUE,
  "30D": THIRTY_DAY_REVENUE,
  "90D": NINETY_DAY_REVENUE,
  "12M": MONTHLY_REVENUE,
};

const TOP_PRODUCTS = [
  { rank: 1, name: "Pokemon SV Booster Box", units: 42, revenue: 35_700 },
  { rank: 2, name: "One Piece TCG Display", units: 31, revenue: 27_900 },
  { rank: 3, name: "Yu-Gi-Oh! Starter Deck", units: 28, revenue: 5_040 },
  { rank: 4, name: "Digimon Card Game Booster", units: 24, revenue: 7_680 },
  { rank: 5, name: "Dragon Ball Super Box", units: 18, revenue: 6_480 },
];

const ORDER_STATUSES = [
  { label: "Delivered", count: 98, pct: 63, color: "bg-green-400" },
  { label: "Shipped", count: 27, pct: 17, color: "bg-orange-400" },
  { label: "Confirmed", count: 19, pct: 12, color: "bg-blue-400" },
  { label: "Placed", count: 12, pct: 8, color: "bg-lvl-yellow" },
];

type ActivityEventType = "order" | "product" | "stream" | "auction";

interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  text: string;
  time: string;
}

const RECENT_ACTIVITY: readonly ActivityEvent[] = [
  { id: "a1", type: "order", text: "Order #LVL-9201 shipped to Sara K.", time: "2h ago" },
  { id: "a2", type: "product", text: 'New product listed: "Pokemon Box"', time: "3h ago" },
  { id: "a3", type: "stream", text: "Live stream ended: 340 viewers", time: "5h ago" },
  { id: "a4", type: "auction", text: "Auction won by Sara K: 1,200 AED", time: "5h ago" },
  { id: "a5", type: "order", text: "Order #LVL-9198 confirmed by Omar R.", time: "8h ago" },
  { id: "a6", type: "product", text: 'Price updated: "One Piece TCG Display"', time: "12h ago" },
  { id: "a7", type: "stream", text: "Scheduled stream: Pokemon Pack Opening", time: "1d ago" },
  { id: "a8", type: "auction", text: "Auction started: Yu-Gi-Oh! Rare Collection", time: "1d ago" },
  { id: "a9", type: "order", text: "Order #LVL-9190 delivered to Khalid M.", time: "2d ago" },
  { id: "a10", type: "order", text: "Order #LVL-9185 placed by Noura A.", time: "3d ago" },
];

const ACTIVITY_ICONS: Record<ActivityEventType, typeof Package> = {
  order: Package,
  product: Plus,
  stream: Radio,
  auction: Trophy,
};

const ACTIVITY_COLORS: Record<ActivityEventType, string> = {
  order: "bg-blue-400/10 text-blue-400",
  product: "bg-green-400/10 text-green-400",
  stream: "bg-lvl-yellow/10 text-lvl-yellow",
  auction: "bg-purple-400/10 text-purple-400",
};

const TOP_CUSTOMERS = [
  { name: "Sara K.", orders: 14, spent: 8_400 },
  { name: "Omar R.", orders: 11, spent: 6_200 },
  { name: "Khalid M.", orders: 9, spent: 5_800 },
  { name: "Fatima H.", orders: 8, spent: 4_100 },
  { name: "Noura A.", orders: 7, spent: 3_900 },
];

const CUSTOMER_LOCATIONS = [
  { country: "UAE", pct: 45, color: "bg-lvl-yellow" },
  { country: "Saudi", pct: 30, color: "bg-blue-400" },
  { country: "Kuwait", pct: 12, color: "bg-green-400" },
  { country: "Other", pct: 13, color: "bg-purple-400" },
];

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Last 12 months"] as const;
const CHART_PERIODS = ["7D", "30D", "90D", "12M"] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SellerAnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>("Last 12 months");
  const [chartPeriod, setChartPeriod] = useState<string>("12M");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const chartData = CHART_DATA_MAP[chartPeriod] ?? MONTHLY_REVENUE;
  const maxRevenue = Math.max(...chartData.map((d) => d.value));
  const topProductRevenue = TOP_PRODUCTS[0].revenue;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center gap-1.5 text-lvl-smoke text-sm font-body hover:text-lvl-yellow transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-wider">
            ANALY<span className="text-lvl-yellow">TICS</span>
          </h1>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-lvl-smoke" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-lvl-carbon border border-lvl-slate rounded-lg px-3 py-1.5 text-sm font-body text-lvl-white focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
            >
              {DATE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Top Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Total Revenue",
            value: formatPrice(34_500),
            change: "+12%",
            positive: true,
            icon: DollarSign,
          },
          {
            label: "Total Orders",
            value: "156",
            change: "+18 this month",
            positive: true,
            icon: ShoppingBag,
          },
          {
            label: "Avg Order Value",
            value: formatPrice(221),
            change: "+5.2%",
            positive: true,
            icon: TrendingUp,
          },
          {
            label: "Conversion Rate",
            value: "4.2%",
            change: "+0.5%",
            positive: true,
            icon: BarChart3,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-lvl-carbon rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-lvl-yellow" />
              <span className="text-lvl-smoke text-xs font-body">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-bold">{stat.value}</p>
            <p
              className={`text-xs font-body mt-1 ${
                stat.positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Section 2: Revenue Chart */}
      <section className="bg-lvl-carbon rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="font-display text-lg font-bold tracking-wide">Revenue Overview</h2>
          <div className="flex bg-lvl-slate/50 rounded-lg p-0.5">
            {CHART_PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 text-xs font-body rounded-md transition-colors ${
                  chartPeriod === period
                    ? "bg-lvl-yellow text-lvl-black font-bold"
                    : "text-lvl-smoke hover:text-lvl-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-right pr-2 pb-6 shrink-0">
            {["40K", "30K", "20K", "10K", "0"].map((label) => (
              <span key={label} className="text-[10px] text-lvl-smoke font-body leading-none">
                {label}
              </span>
            ))}
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end gap-1 sm:gap-2 h-56 relative">
            {chartData.map((item, i) => {
              const heightPct = maxRevenue > 0 ? (item.value / 40_000) * 100 : 0;
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-1 relative"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {hoveredBar === i && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-lvl-black border border-lvl-slate rounded-lg px-2.5 py-1 text-xs font-body whitespace-nowrap z-10 shadow-lg">
                      <span className="text-lvl-yellow font-bold">
                        {item.value.toLocaleString()} AED
                      </span>
                    </div>
                  )}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-lvl-yellow rounded-t transition-all duration-200 hover:bg-lvl-yellow/80 cursor-pointer"
                      style={{
                        height: `${Math.min(heightPct, 100)}%`,
                        minHeight: heightPct > 0 ? "4px" : "0px",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-lvl-smoke font-body">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Top Products */}
      <section className="bg-lvl-carbon rounded-xl mb-8 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-display text-lg font-bold tracking-wide">Top Products</h2>
          <Link
            href="/seller/products"
            className="text-lvl-yellow text-xs font-body hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-lvl-slate/30">
          {TOP_PRODUCTS.map((product) => {
            const barWidth = topProductRevenue > 0 ? (product.revenue / topProductRevenue) * 100 : 0;
            return (
              <div key={product.rank} className="flex items-center gap-4 px-5 py-3">
                <span className="text-lvl-smoke font-display text-sm w-6 text-center shrink-0">
                  #{product.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">{product.name}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-lvl-slate/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-lvl-yellow transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-bold">
                    {formatPrice(product.revenue)}
                  </p>
                  <p className="text-lvl-smoke text-xs font-body">{product.units} sold</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Live Stream Performance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Streams", value: "24", icon: Radio },
          { label: "Watch Hours", value: "186h", icon: Eye },
          { label: "Avg Viewers", value: "340", icon: Users },
          { label: "Auction Win Rate", value: "87%", icon: Trophy },
        ].map((stat) => (
          <div key={stat.label} className="bg-lvl-carbon rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-lvl-yellow" />
              <span className="text-lvl-smoke text-xs font-body">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Section 5: Order Status Breakdown */}
      <section className="bg-lvl-carbon rounded-xl p-6 mb-8">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">Order Status</h2>

        {/* Stacked bar */}
        <div className="flex h-6 rounded-full overflow-hidden mb-4">
          {ORDER_STATUSES.map((status) => (
            <div
              key={status.label}
              className={`${status.color} transition-all duration-300`}
              style={{ width: `${status.pct}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ORDER_STATUSES.map((status) => (
            <div key={status.label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${status.color} shrink-0`} />
              <div>
                <p className="text-sm font-body">
                  {status.label}{" "}
                  <span className="text-lvl-smoke">({status.pct}%)</span>
                </p>
                <p className="text-lvl-smoke text-xs font-body">{status.count} orders</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Recent Activity Feed */}
      <section className="bg-lvl-carbon rounded-xl mb-8 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-display text-lg font-bold tracking-wide">Recent Activity</h2>
          <Clock className="w-4 h-4 text-lvl-smoke" />
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-lvl-slate/30">
          {RECENT_ACTIVITY.map((event) => {
            const IconComp = ACTIVITY_ICONS[event.type];
            const colorClass = ACTIVITY_COLORS[event.type];
            return (
              <div key={event.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">{event.text}</p>
                </div>
                <span className="text-lvl-smoke text-xs font-body shrink-0">{event.time}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 7: Customer Insights */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Customers */}
        <section className="bg-lvl-carbon rounded-xl overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="font-display text-lg font-bold tracking-wide">Top Customers</h2>
          </div>
          <div className="divide-y divide-lvl-slate/30">
            {TOP_CUSTOMERS.map((customer, i) => (
              <div key={customer.name} className="flex items-center gap-3 px-5 py-3">
                <span className="w-6 h-6 rounded-full bg-lvl-slate flex items-center justify-center text-[10px] font-display font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">{customer.name}</p>
                  <p className="text-lvl-smoke text-xs font-body">{customer.orders} orders</p>
                </div>
                <p className="font-display text-sm font-bold shrink-0">
                  {formatPrice(customer.spent)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Locations */}
        <section className="bg-lvl-carbon rounded-xl p-5">
          <h2 className="font-display text-lg font-bold tracking-wide mb-4">
            Customer Locations
          </h2>
          <div className="space-y-3">
            {CUSTOMER_LOCATIONS.map((loc) => (
              <div key={loc.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-body">{loc.country}</span>
                  <span className="text-lvl-smoke text-xs font-body">{loc.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-lvl-slate/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${loc.color} transition-all duration-500`}
                    style={{ width: `${loc.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
