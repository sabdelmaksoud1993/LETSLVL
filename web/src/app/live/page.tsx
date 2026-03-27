"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Radio, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";
import { StreamCard } from "@/components/live/stream-card";
import { LiveCategoryPills } from "@/components/live/live-category-pills";
import type { Stream } from "@/types/database";

const STATUS_TABS = [
  { label: "LIVE", value: "live" },
  { label: "Upcoming", value: "scheduled" },
  { label: "Ended", value: "ended" },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]["value"];

function LiveFeedPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("live");
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch streams from Supabase
  const fetchStreams = useCallback(async () => {
    const supabase = createClient();

    let query = supabase
      .from("streams")
      .select(
        `
        id,
        created_at,
        seller_id,
        title,
        description,
        category,
        thumbnail_url,
        status,
        viewer_count,
        stream_url,
        scheduled_at,
        started_at,
        ended_at,
        profiles:seller_id (
          full_name,
          avatar_url,
          country
        )
      `,
      )
      .order("viewer_count", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch streams:", error.message);
      setLoading(false);
      return;
    }

    const countryFlags: Record<string, string> = {
      AE: "\u{1F1E6}\u{1F1EA}",
      SA: "\u{1F1F8}\u{1F1E6}",
      QA: "\u{1F1F6}\u{1F1E6}",
      KW: "\u{1F1F0}\u{1F1FC}",
      OM: "\u{1F1F4}\u{1F1F2}",
      BH: "\u{1F1E7}\u{1F1ED}",
    };

    const mapped: Stream[] = (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.profiles as {
        full_name: string | null;
        avatar_url: string | null;
        country: string | null;
      } | null;

      const countryCode = profile?.country ?? "AE";

      return {
        id: row.id as string,
        created_at: row.created_at as string,
        seller_id: row.seller_id as string,
        title: row.title as string,
        description: (row.description as string) ?? "",
        category: (row.category as string) ?? "",
        thumbnail_url: (row.thumbnail_url as string) ?? null,
        status: row.status as Stream["status"],
        viewer_count: (row.viewer_count as number) ?? 0,
        stream_url: (row.stream_url as string) ?? null,
        scheduled_at: (row.scheduled_at as string) ?? null,
        started_at: (row.started_at as string) ?? null,
        ended_at: (row.ended_at as string) ?? null,
        seller: {
          full_name: profile?.full_name ?? "Seller",
          avatar_url: profile?.avatar_url ?? null,
        },
        country_flag: countryFlags[countryCode] ?? "\u{1F30D}",
      };
    });

    setStreams(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // Subscribe to stream status changes (new streams going live)
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("streams-feed")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "streams",
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>;
          setStreams((prev) =>
            prev.map((s) =>
              s.id === updated.id
                ? {
                    ...s,
                    status: updated.status as Stream["status"],
                    viewer_count: (updated.viewer_count as number) ?? s.viewer_count,
                    started_at: (updated.started_at as string) ?? s.started_at,
                    ended_at: (updated.ended_at as string) ?? s.ended_at,
                  }
                : s,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "streams",
        },
        () => {
          // Refetch all streams when a new stream is created
          fetchStreams();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStreams]);

  const filteredStreams = useMemo(() => {
    return streams.filter((stream: Stream) => {
      const matchesStatus = stream.status === activeStatus;
      const matchesCategory =
        activeCategory === "All" || stream.category === activeCategory;
      return matchesStatus && matchesCategory;
    });
  }, [streams, activeCategory, activeStatus]);

  const liveCount = useMemo(
    () => streams.filter((s) => s.status === "live").length,
    [streams],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-1">
            <span className="font-display text-xl font-bold uppercase tracking-tight text-gray-900">
              LET&apos;S
            </span>
            <span className="font-display text-xl font-bold uppercase tracking-tight text-lvl-yellow">
              LVL
            </span>
          </div>
          <span
            className="font-body text-sm text-gray-500"
            dir="rtl"
            lang="ar"
          >
            &#1604;&#1610;&#1578;&#1587; &#1575;&#1604; &#1601;&#1610; &#1575;&#1604;
          </span>
        </div>
      </header>

      {/* Category pills */}
      <LiveCategoryPills
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Status tabs */}
      <div className="flex gap-1 px-4 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveStatus(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold font-body transition-colors",
              activeStatus === tab.value
                ? "bg-lvl-black text-white"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live count */}
      {activeStatus === "live" && (
        <div className="flex items-center gap-1.5 px-4 pb-3">
          <Radio size={14} className="text-red-500" />
          <span className="text-xs font-semibold text-gray-600 font-body">
            {liveCount} stream{liveCount !== 1 ? "s" : ""} live now
          </span>
        </div>
      )}

      {/* Stream list */}
      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-lvl-yellow" />
          </div>
        ) : filteredStreams.length > 0 ? (
          filteredStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))
        ) : (
          <div className="text-center py-16">
            <Radio size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-body font-semibold">
              No {activeStatus === "live" ? "live" : activeStatus} streams
              {activeCategory !== "All"
                ? ` in ${activeCategory}`
                : ""}
            </p>
            <p className="text-gray-400 text-sm font-body mt-1">
              Check back later for more streams
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveFeedPage;
