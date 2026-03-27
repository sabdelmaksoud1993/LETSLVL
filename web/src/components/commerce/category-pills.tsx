"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
}

function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mb-2">
        <Link
          href="/"
          className={cn(
            "shrink-0 snap-start rounded-full px-4 py-2 text-sm font-body font-medium transition-colors whitespace-nowrap",
            activeSlug === undefined
              ? "bg-lvl-yellow text-lvl-black"
              : "bg-lvl-slate text-lvl-white hover:bg-lvl-slate/80"
          )}
        >
          All
        </Link>
        {categories.map((category) => {
          const isActive = activeSlug === category.slug;
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={cn(
                "shrink-0 snap-start rounded-full px-4 py-2 text-sm font-body font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-lvl-yellow text-lvl-black"
                  : "bg-lvl-slate text-lvl-white hover:bg-lvl-slate/80"
              )}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {/* Hide scrollbar utility */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export { CategoryPills, type CategoryPillsProps };
