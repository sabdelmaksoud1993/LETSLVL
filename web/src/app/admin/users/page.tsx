"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import { Search, Download, ChevronDown, ChevronRight, Users as UsersIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserRow {
  readonly id: string;
  readonly full_name: string | null;
  readonly email: string | null;
  readonly avatar_url: string | null;
  readonly role: string | null;
  readonly tier: string | null;
  readonly country: string | null;
  readonly wallet_balance: number | null;
  readonly created_at: string;
}

interface UserExpanded {
  readonly ordersCount: number;
  readonly wishlistCount: number;
  readonly totalSpent: number;
}

const ROLE_TABS = ["All", "Shoppers", "Sellers", "Admins"] as const;
type RoleTab = (typeof ROLE_TABS)[number];

const ROLE_FILTER_MAP: Record<RoleTab, string | null> = {
  All: null,
  Shoppers: "shopper",
  Sellers: "seller",
  Admins: "admin",
};

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRoleBadgeClasses(role: string | null): string {
  switch (role) {
    case "admin":
      return "bg-red-500/20 text-red-400";
    case "seller":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-lvl-slate/50 text-lvl-smoke";
  }
}

/* ------------------------------------------------------------------ */
/*  Table Skeleton                                                     */
/* ------------------------------------------------------------------ */

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 bg-lvl-carbon rounded-lg animate-pulse"
        >
          <div className="w-9 h-9 rounded-full bg-lvl-slate/50" />
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<readonly UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState<RoleTab>("All");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Record<string, UserExpanded>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const roleFilter = ROLE_FILTER_MAP[roleTab];
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, tier, country, wallet_balance, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (roleFilter) {
      query = query.eq("role", roleFilter);
    }

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
      );
    }

    const { data, count, error } = await query;
    if (error) {
      console.error("Users fetch error:", error);
    }
    setUsers(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [roleTab, page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [roleTab, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleExpand = useCallback(
    async (userId: string) => {
      if (expandedId === userId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(userId);

      if (expandedData[userId]) return;

      const supabase = createClient();
      const [ordersRes, wishlistRes, spentRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("wishlist")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase.from("orders").select("total").eq("user_id", userId),
      ]);

      const totalSpent = (spentRes.data ?? []).reduce(
        (sum: number, o: { total: number | null }) => sum + (o.total ?? 0),
        0
      );

      setExpandedData((prev) => ({
        ...prev,
        [userId]: {
          ordersCount: ordersRes.count ?? 0,
          wishlistCount: wishlistRes.count ?? 0,
          totalSpent,
        },
      }));
    },
    [expandedId, expandedData]
  );

  const handleRoleChange = useCallback(
    async (userId: string, newRole: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        console.error("Role update error:", error);
        return;
      }
      fetchUsers();
    },
    [fetchUsers]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
            User Management
          </h1>
          <p className="font-body text-sm text-lvl-smoke mt-1">
            {totalCount} total users
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-sm font-body font-medium text-lvl-smoke hover:text-lvl-white hover:border-lvl-slate transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-lvl-carbon border border-lvl-slate/30 rounded-lg text-sm font-body text-lvl-white placeholder:text-lvl-smoke focus:outline-none focus:ring-2 focus:ring-lvl-yellow focus:border-transparent"
        />
      </div>

      {/* Role tabs */}
      <div className="flex gap-1 bg-lvl-carbon rounded-lg p-1 w-fit">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setRoleTab(tab)}
            className={`px-4 py-1.5 text-sm font-body font-medium rounded-md transition-colors ${
              roleTab === tab
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
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UsersIcon className="w-12 h-12 text-lvl-slate mb-4" />
          <p className="font-body text-lvl-smoke">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-lvl-slate/30">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-lvl-slate/30">
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Tier
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Country
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Wallet
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
              {users.map((user) => {
                const isExpanded = expandedId === user.id;
                const detail = expandedData[user.id];
                return (
                  <Fragment key={user.id}>
                    <tr
                      className="bg-lvl-carbon hover:bg-lvl-slate/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(user.id)}
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
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-lvl-slate flex items-center justify-center text-xs font-body font-bold text-lvl-white">
                              {user.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <span className="font-body text-sm text-lvl-white font-medium">
                            {user.full_name ?? "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                        {user.email ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${getRoleBadgeClasses(user.role)}`}
                        >
                          {user.role ?? "shopper"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                        {user.tier ?? "Standard"}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                        {user.country ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-lvl-white">
                        {formatPrice(user.wallet_balance ?? 0)}
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role ?? "shopper"}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="bg-lvl-slate/50 text-lvl-white text-xs font-body rounded px-2 py-1 border border-lvl-slate/30 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                        >
                          <option value="shopper">Shopper</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-lvl-slate/10">
                        <td colSpan={8} className="px-8 py-4">
                          {detail ? (
                            <div className="flex gap-8 font-body text-sm">
                              <div>
                                <span className="text-lvl-smoke">Orders: </span>
                                <span className="text-lvl-white font-medium">
                                  {detail.ordersCount}
                                </span>
                              </div>
                              <div>
                                <span className="text-lvl-smoke">Wishlist: </span>
                                <span className="text-lvl-white font-medium">
                                  {detail.wishlistCount}
                                </span>
                              </div>
                              <div>
                                <span className="text-lvl-smoke">Total Spent: </span>
                                <span className="text-lvl-yellow font-medium">
                                  {formatPrice(detail.totalSpent)}
                                </span>
                              </div>
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
