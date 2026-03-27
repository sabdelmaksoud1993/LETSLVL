"use client";

import { useState, useMemo } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { streams } from "@/lib/mock-data";
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

  const filteredStreams = useMemo(() => {
    return streams.filter((stream: Stream) => {
      const matchesStatus = stream.status === activeStatus;
      const matchesCategory =
        activeCategory === "All" || stream.category === activeCategory;
      return matchesStatus && matchesCategory;
    });
  }, [activeCategory, activeStatus]);

  const liveCount = useMemo(
    () => streams.filter((s) => s.status === "live").length,
    [],
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
        {filteredStreams.length > 0 ? (
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
