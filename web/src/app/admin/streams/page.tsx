"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  Search,
  Radio,
  Eye,
  Ban,
  Flag,
  MessageSquareOff,
  Clock,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StreamRow {
  readonly id: string;
  readonly title: string;
  readonly seller_id: string;
  readonly seller_name: string | null;
  readonly category: string | null;
  readonly status: string | null;
  readonly viewer_count: number | null;
  readonly started_at: string | null;
  readonly ended_at: string | null;
  readonly created_at: string;
}

const STATUS_TABS = ["All", "Live", "Scheduled", "Ended"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StreamStatusBadge({ status }: { readonly status: string | null }) {
  const normalized = (status ?? "scheduled").toLowerCase();

  if (normalized === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-body font-bold rounded-full uppercase bg-red-600 text-white animate-live-pulse">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        LIVE
      </span>
    );
  }

  const styles: Record<string, string> = {
    scheduled: "bg-blue-500/20 text-blue-400",
    ended: "bg-lvl-slate/50 text-lvl-smoke",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${styles[normalized] ?? styles.scheduled}`}
    >
      {normalized === "scheduled" && <Clock className="w-3 h-3" />}
      {normalized}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Duration Helper                                                    */
/* ------------------------------------------------------------------ */

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt) return "-";
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const diffMs = end - start;
  if (diffMs < 0) return "-";

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
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

export default function AdminStreamsPage() {
  const [streams, setStreams] = useState<readonly StreamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("All");

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("streams")
      .select(
        "id, title, seller_id, category, status, viewer_count, started_at, ended_at, created_at, profiles!streams_seller_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false });

    if (statusTab !== "All") {
      query = query.eq("status", statusTab.toLowerCase());
    }

    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Streams fetch error:", error);
      // Fallback without join
      const fallback = await supabase
        .from("streams")
        .select(
          "id, title, seller_id, category, status, viewer_count, started_at, ended_at, created_at"
        )
        .order("created_at", { ascending: false });

      const mapped = (fallback.data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        seller_name: null,
      }));
      setStreams(mapped as unknown as readonly StreamRow[]);
    } else {
      const mapped = (data ?? []).map((s: Record<string, unknown>) => {
        const profilesData = s.profiles as { full_name: string | null } | null;
        return {
          ...s,
          seller_name: profilesData?.full_name ?? null,
          profiles: undefined,
        };
      });
      setStreams(mapped as unknown as readonly StreamRow[]);
    }

    setLoading(false);
  }, [statusTab, search]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const handleEndStream = useCallback(
    async (streamId: string) => {
      const supabase = createClient();
      await supabase
        .from("streams")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", streamId);
      fetchStreams();
    },
    [fetchStreams]
  );

  const liveCount = streams.filter(
    (s) => s.status?.toLowerCase() === "live"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
          Stream Management
        </h1>
        <p className="font-body text-sm text-lvl-smoke mt-1">
          {streams.length} total streams &middot;{" "}
          <span className="text-red-400">{liveCount} live now</span>
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
        <input
          type="text"
          placeholder="Search streams..."
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
            {tab === "Live" && liveCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded-full">
                {liveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Radio className="w-12 h-12 text-lvl-slate mb-4" />
          <p className="font-body text-lvl-smoke">No streams found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-lvl-slate/30">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-lvl-slate/30">
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Seller
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Viewers
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Started
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Duration
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-lvl-smoke uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lvl-slate/20">
              {streams.map((stream) => {
                const isLive = stream.status?.toLowerCase() === "live";
                return (
                  <tr
                    key={stream.id}
                    className={`transition-colors ${
                      isLive
                        ? "bg-red-500/5 hover:bg-red-500/10"
                        : "bg-lvl-carbon hover:bg-lvl-slate/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-body text-sm text-lvl-white font-medium">
                        {stream.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                      {stream.seller_name ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
                      {stream.category ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StreamStatusBadge status={stream.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-body text-sm text-lvl-smoke">
                        <Users className="w-3.5 h-3.5" />
                        {stream.viewer_count ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-lvl-smoke">
                      {stream.started_at
                        ? new Date(stream.started_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-lvl-smoke">
                      {formatDuration(stream.started_at, stream.ended_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isLive && (
                          <button
                            onClick={() => handleEndStream(stream.id)}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="End Stream"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-lvl-white transition-colors"
                          title="View Stream"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-yellow-400 transition-colors"
                          title="Flag Stream"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded bg-lvl-slate/30 text-lvl-smoke hover:text-red-400 transition-colors"
                          title="Mute Chat"
                        >
                          <MessageSquareOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
