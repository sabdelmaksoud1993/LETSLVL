"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SavedFilter {
  readonly status: string;
  readonly search: string;
  readonly sort: string;
}

interface SavedView {
  readonly id: string;
  readonly name: string;
  readonly filters: SavedFilter;
  readonly isDefault: boolean;
}

interface SavedFiltersProps {
  readonly onApply: (filters: SavedFilter) => void;
  readonly currentFilters: SavedFilter;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "lvl_saved_filter_views";

const DEFAULT_VIEWS: readonly SavedView[] = [
  {
    id: "default_all",
    name: "All Products",
    filters: { status: "all", search: "", sort: "newest" },
    isDefault: true,
  },
  {
    id: "default_active",
    name: "Active",
    filters: { status: "active", search: "", sort: "newest" },
    isDefault: true,
  },
  {
    id: "default_draft",
    name: "Draft",
    filters: { status: "draft", search: "", sort: "newest" },
    isDefault: true,
  },
  {
    id: "default_low_stock",
    name: "Low Stock",
    filters: { status: "low_stock", search: "", sort: "stock" },
    isDefault: true,
  },
  {
    id: "default_live",
    name: "Live Exclusive",
    filters: { status: "live_exclusive", search: "", sort: "newest" },
    isDefault: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadCustomViews(): readonly SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

function saveCustomViews(views: readonly SavedView[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

function generateId(): string {
  return `view_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function filtersMatch(a: SavedFilter, b: SavedFilter): boolean {
  return a.status === b.status && a.search === b.search && a.sort === b.sort;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function SavedFilters({ onApply, currentFilters }: SavedFiltersProps) {
  const [customViews, setCustomViews] = useState<readonly SavedView[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  // Load custom views
  useEffect(() => {
    setCustomViews(loadCustomViews());
  }, []);

  const allViews = [...DEFAULT_VIEWS, ...customViews];

  // Save current view
  const handleSave = useCallback(() => {
    const name = newViewName.trim();
    if (!name) return;

    const newView: SavedView = {
      id: generateId(),
      name,
      filters: { ...currentFilters },
      isDefault: false,
    };

    const updated = [...customViews, newView];
    setCustomViews(updated);
    saveCustomViews(updated);
    setNewViewName("");
    setShowSaveModal(false);
  }, [newViewName, currentFilters, customViews]);

  // Delete a custom view
  const handleDelete = useCallback(
    (id: string) => {
      const updated = customViews.filter((v) => v.id !== id);
      setCustomViews(updated);
      saveCustomViews(updated);
    },
    [customViews]
  );

  // Check if a view is active
  const isActive = useCallback(
    (view: SavedView): boolean => filtersMatch(view.filters, currentFilters),
    [currentFilters]
  );

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* View pills */}
        {allViews.map((view) => (
          <div key={view.id} className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => onApply(view.filters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold tracking-wider border transition-colors whitespace-nowrap",
                isActive(view)
                  ? "bg-lvl-yellow text-lvl-black border-lvl-yellow"
                  : "bg-lvl-carbon text-lvl-smoke border-lvl-slate hover:border-lvl-smoke hover:text-lvl-white"
              )}
            >
              {view.name}
            </button>
            {/* Delete button for custom views */}
            {!view.isDefault && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(view.id);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lvl-slate flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50"
                aria-label={`Delete ${view.name} view`}
              >
                <X className="w-2.5 h-2.5 text-lvl-white" />
              </button>
            )}
          </div>
        ))}

        {/* Save current view button */}
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold tracking-wider border border-dashed border-lvl-slate text-lvl-smoke hover:text-lvl-yellow hover:border-lvl-yellow/50 transition-colors shrink-0 whitespace-nowrap"
        >
          <Bookmark className="w-3 h-3" />
          Save View
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowSaveModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-lvl-carbon border border-lvl-slate/30 rounded-xl w-full max-w-sm p-5">
            <h3 className="font-display text-lg font-bold tracking-wider mb-4">
              SAVE <span className="text-lvl-yellow">VIEW</span>
            </h3>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="View name..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setShowSaveModal(false);
              }}
              className="w-full bg-lvl-black border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-display font-bold tracking-wider text-lvl-smoke hover:text-lvl-white bg-lvl-slate hover:bg-lvl-slate/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!newViewName.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-display font-bold tracking-wider transition-colors",
                  newViewName.trim()
                    ? "bg-lvl-yellow text-lvl-black hover:opacity-90"
                    : "bg-lvl-slate text-lvl-smoke cursor-not-allowed"
                )}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { SavedFilters };
