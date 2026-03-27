"use client";

import { useCallback } from "react";
import { Sparkles, Layers, Trophy, Shirt, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveCategoryPillsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const LIVE_CATEGORIES = [
  { label: "All", value: "All", icon: Sparkles },
  { label: "Trading Card Games", value: "Trading Card Games", icon: Layers },
  { label: "Sports Cards", value: "Sports Cards", icon: Trophy },
  { label: "Fashion", value: "Fashion", icon: Shirt },
  { label: "Toys & Collectibles", value: "Toys & Collectibles", icon: Package },
] as const;

function LiveCategoryPills({
  activeCategory,
  onCategoryChange,
}: LiveCategoryPillsProps) {
  const handleClick = useCallback(
    (value: string) => {
      onCategoryChange(value);
    },
    [onCategoryChange],
  );

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
      role="tablist"
      aria-label="Stream categories"
    >
      {LIVE_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.value;

        return (
          <button
            key={cat.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(cat.value)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold font-body whitespace-nowrap shrink-0 transition-colors",
              isActive
                ? "bg-lvl-yellow text-lvl-black"
                : "bg-white text-lvl-black border border-gray-200 hover:bg-gray-50",
            )}
          >
            <Icon size={16} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export { LiveCategoryPills, type LiveCategoryPillsProps };
