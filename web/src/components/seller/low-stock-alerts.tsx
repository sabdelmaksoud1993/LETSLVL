"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getSellerProducts } from "@/lib/supabase-data";
import type { Product } from "@/types/database";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_DISMISSED = "lvl_low_stock_dismissed";
const STORAGE_KEY_THRESHOLD = "lvl_low_stock_threshold";
const DEFAULT_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function LowStockAlerts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempThreshold, setTempThreshold] = useState<string>(
    String(DEFAULT_THRESHOLD)
  );
  const [loaded, setLoaded] = useState(false);

  // Load threshold and dismissed state from localStorage
  useEffect(() => {
    try {
      const savedThreshold = localStorage.getItem(STORAGE_KEY_THRESHOLD);
      if (savedThreshold) {
        const parsed = Number(savedThreshold);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setThreshold(parsed);
          setTempThreshold(String(parsed));
        }
      }
      const savedDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (savedDismissed === "true") {
        setDismissed(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Fetch products
  useEffect(() => {
    if (!user) return;
    getSellerProducts(user.id).then((data) => {
      setProducts(data);
      setLoaded(true);
    });
  }, [user]);

  // Filter low stock
  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (p) => p.inventory_count <= threshold && p.status !== "archived"
      ),
    [products, threshold]
  );

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
    } catch {
      // Ignore
    }
  }, []);

  // Save threshold
  const handleSaveThreshold = useCallback(() => {
    const parsed = Number(tempThreshold);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setThreshold(parsed);
      try {
        localStorage.setItem(STORAGE_KEY_THRESHOLD, String(parsed));
      } catch {
        // Ignore
      }
    }
    setShowSettings(false);
  }, [tempThreshold]);

  // Don't render if no low stock products, dismissed, or not loaded
  if (!loaded || dismissed || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Alert Banner */}
      <div className="bg-lvl-carbon border border-orange-500/40 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="flex-1 text-sm font-body text-lvl-white">
            <span className="font-bold text-orange-400">
              {lowStockProducts.length}
            </span>{" "}
            {lowStockProducts.length === 1 ? "product" : "products"} running low
            on stock
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Settings gear */}
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-lvl-slate/50 transition-colors"
              aria-label="Alert settings"
            >
              <Settings className="w-3.5 h-3.5 text-lvl-smoke" />
            </button>
            {/* Expand/collapse */}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-lvl-slate/50 transition-colors"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-lvl-smoke" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-lvl-smoke" />
              )}
            </button>
            {/* Dismiss */}
            <button
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-lvl-slate/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-lvl-smoke" />
            </button>
          </div>
        </div>

        {/* Settings popover */}
        {showSettings && (
          <div className="px-4 pb-3">
            <div className="bg-lvl-black border border-lvl-slate rounded-lg p-3 flex items-center gap-3">
              <label className="text-xs font-body text-lvl-smoke shrink-0">
                Alert when stock &le;
              </label>
              <input
                type="number"
                min={1}
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="w-16 bg-lvl-carbon border border-lvl-slate rounded-md px-2 py-1 text-sm font-body text-lvl-white text-center focus:outline-none focus:border-lvl-yellow"
              />
              <button
                type="button"
                onClick={handleSaveThreshold}
                className="px-3 py-1 rounded-md bg-lvl-yellow text-lvl-black text-xs font-display font-bold hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Expanded product list */}
        {expanded && (
          <div className="border-t border-lvl-slate/30 divide-y divide-lvl-slate/30">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0 overflow-hidden">
                  {product.images.length > 0 && product.images[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-lvl-smoke" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body truncate">{product.title}</p>
                  <p
                    className={cn(
                      "text-xs font-display font-bold",
                      product.inventory_count === 0
                        ? "text-red-400"
                        : "text-orange-400"
                    )}
                  >
                    {product.inventory_count === 0
                      ? "Out of stock"
                      : `${product.inventory_count} left`}
                  </p>
                </div>

                {/* Restock link */}
                <Link
                  href={`/seller/products/${product.id}/edit`}
                  className="text-xs font-display font-bold text-lvl-yellow hover:text-lvl-yellow/80 transition-colors shrink-0"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { LowStockAlerts };
