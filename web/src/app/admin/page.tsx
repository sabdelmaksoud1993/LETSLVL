"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  UserPlus,
  Radio,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardStats {
  readonly totalUsers: number;
  readonly totalSellers: number;
  readonly totalOrders: number;
  readonly totalRevenue: number;
}

interface DailyOrderCount {
  readonly date: string;
  readonly count: number;
}

interface ActivityItem {
  readonly id: string;
  readonly type: "user" | "order" | "seller" | "stream";
  readonly message: string;
  readonly timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  readonly label: string;
  readonly value: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly trend?: string;
}) {
  return (
    <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-lvl-yellow/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-lvl-yellow" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-body text-green-400">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-lvl-white">{value}</p>
      <p className="font-body text-sm text-lvl-smoke mt-1">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bar Chart (CSS-only)                                               */
/* ------------------------------------------------------------------ */

function OrdersBarChart({
  data,
}: {
  readonly data: readonly DailyOrderCount[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5">
      <h3 className="font-display text-lg font-bold text-lvl-white mb-4">
        Orders (Last 7 Days)
      </h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((day) => {
          const heightPct = (day.count / maxCount) * 100;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs font-body text-lvl-smoke">
                {day.count}
              </span>
              <div className="w-full relative" style={{ height: "120px" }}>
                <div
                  className="absolute bottom-0 w-full bg-lvl-yellow/80 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className="text-[10px] font-body text-lvl-smoke">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue Dot Chart (CSS-only)                                       */
/* ------------------------------------------------------------------ */

function RevenueDotChart({
  data,
}: {
  readonly data: readonly DailyOrderCount[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5">
      <h3 className="font-display text-lg font-bold text-lvl-white mb-4">
        Revenue Trend (Last 7 Days)
      </h3>
      <div className="relative h-40">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-lvl-slate/20 w-full" />
          ))}
        </div>
        {/* Dots and connecting line */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Line */}
          <polyline
            fill="none"
            stroke="#F5C518"
            strokeWidth="1.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            points={data
              .map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100;
                const y = 100 - (d.count / maxCount) * 80 - 10;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* Dots */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = 100 - (d.count / maxCount) * 80 - 10;
            return (
              <circle
                key={d.date}
                cx={x}
                cy={y}
                r="2"
                fill="#F5C518"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {data.map((day) => (
            <span key={day.date} className="text-[10px] font-body text-lvl-smoke">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Feed                                                      */
/* ------------------------------------------------------------------ */

const ACTIVITY_ICONS = {
  user: UserPlus,
  order: ShoppingBag,
  seller: Store,
  stream: Radio,
} as const;

function ActivityFeed({
  items,
  loading,
}: {
  readonly items: readonly ActivityItem[];
  readonly loading: boolean;
}) {
  return (
    <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5">
      <h3 className="font-display text-lg font-bold text-lvl-white mb-4">
        Recent Activity
      </h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-lvl-slate/50" />
              <div className="flex-1 h-4 bg-lvl-slate/50 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm font-body text-lvl-smoke">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = ACTIVITY_ICONS[item.type];
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2 border-b border-lvl-slate/20 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-lvl-slate/50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-lvl-smoke" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-lvl-white">
                    {item.message}
                  </p>
                  <p className="text-xs font-body text-lvl-smoke mt-0.5">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Action Button                                                */
/* ------------------------------------------------------------------ */

function QuickAction({
  label,
  icon: Icon,
  onClick,
}: {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 bg-lvl-carbon rounded-xl border border-lvl-slate/30 hover:border-lvl-yellow/30 hover:bg-lvl-slate/20 transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-lvl-yellow/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-lvl-yellow" />
      </div>
      <span className="font-body text-sm font-medium text-lvl-white flex-1 text-left">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 text-lvl-smoke group-hover:text-lvl-yellow transition-colors" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function StatSkeleton() {
  return (
    <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-lvl-slate/50" />
      </div>
      <div className="h-8 w-24 bg-lvl-slate/50 rounded mb-2" />
      <div className="h-4 w-20 bg-lvl-slate/30 rounded" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyOrders, setDailyOrders] = useState<readonly DailyOrderCount[]>(
    []
  );
  const [activity, setActivity] = useState<readonly ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    const supabase = createClient();

    try {
      // Fetch stats in parallel
      const [usersRes, sellersRes, ordersRes, revenueRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "seller"),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);

      const totalRevenue = (revenueRes.data ?? []).reduce(
        (sum: number, o: { total: number | null }) => sum + (o.total ?? 0),
        0
      );

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalSellers: sellersRes.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
        totalRevenue,
      });

      // Build daily orders for last 7 days
      const days: DailyOrderCount[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { count } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", dateStr)
          .lt("created_at", nextDate.toISOString().split("T")[0]);

        days.push({ date: dateStr, count: count ?? 0 });
      }
      setDailyOrders(days);

      // Fetch recent activity - new users
      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, created_at, total")
        .order("created_at", { ascending: false })
        .limit(5);

      const activityItems: ActivityItem[] = [];

      (recentUsers ?? []).forEach(
        (u: { id: string; full_name: string | null; created_at: string }) => {
          activityItems.push({
            id: `user-${u.id}`,
            type: "user",
            message: `New user registered: ${u.full_name ?? "Unknown"}`,
            timestamp: u.created_at,
          });
        }
      );

      (recentOrders ?? []).forEach(
        (o: { id: string; created_at: string; total: number | null }) => {
          activityItems.push({
            id: `order-${o.id}`,
            type: "order",
            message: `New order placed: ${formatPrice(o.total ?? 0)}`,
            timestamp: o.created_at,
          });
        }
      );

      // Sort by timestamp descending and take 10
      activityItems.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setActivity(activityItems.slice(0, 10));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
          Dashboard Overview
        </h1>
        <p className="font-body text-sm text-lvl-smoke mt-1">
          Welcome back. Here is what is happening on the platform.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !stats ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              trend="+12%"
            />
            <StatCard
              label="Total Sellers"
              value={stats.totalSellers.toLocaleString()}
              icon={Store}
              trend="+5%"
            />
            <StatCard
              label="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              icon={ShoppingBag}
              trend="+18%"
            />
            <StatCard
              label="Total Revenue"
              value={formatPrice(stats.totalRevenue)}
              icon={DollarSign}
              trend="+22%"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <>
            <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5 h-56 animate-pulse" />
            <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-5 h-56 animate-pulse" />
          </>
        ) : (
          <>
            <OrdersBarChart data={dailyOrders} />
            <RevenueDotChart data={dailyOrders} />
          </>
        )}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActivityFeed items={activity} loading={loading} />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-lvl-white">
            Quick Actions
          </h3>
          <QuickAction label="Approve Seller" icon={CheckCircle} />
          <QuickAction label="View Flagged Content" icon={AlertTriangle} />
          <QuickAction label="Export Report" icon={TrendingUp} />
        </div>
      </div>
    </div>
  );
}
