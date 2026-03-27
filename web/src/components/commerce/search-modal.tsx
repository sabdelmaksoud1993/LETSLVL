"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/database";

interface SearchModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready after animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    // Reset state when modal closes
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setIsLoading(false);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .ilike("title", `%${searchTerm.trim()}%`)
        .limit(10);

      if (error) {
        console.error("Search error:", error.message);
        setResults([]);
        return;
      }

      setResults(data ?? []);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Clear previous debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce timer
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    },
    [performSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleResultClick = useCallback(
    (productId: string) => {
      onClose();
      router.push(`/product/${productId}`);
    },
    [onClose, router]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-lvl-black/95 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-lvl-smoke" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for products, brands, or categories..."
            className="w-full h-14 pl-12 pr-12 bg-lvl-carbon border border-lvl-slate rounded-xl text-lvl-white placeholder:text-lvl-smoke font-body text-base focus:outline-none focus:border-lvl-yellow/50 focus:ring-1 focus:ring-lvl-yellow/30 transition-colors"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-lvl-slate/50 transition-colors"
          >
            <X className="h-4 w-4 text-lvl-smoke" />
          </button>
        </div>

        {/* Results area */}
        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-lvl-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state - before any search */}
          {!isLoading && !hasSearched && (
            <div className="text-center py-12">
              <Search className="h-10 w-10 text-lvl-slate mx-auto mb-3" />
              <p className="text-lvl-smoke font-body text-sm">
                Search for products, brands, or categories
              </p>
            </div>
          )}

          {/* No results */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lvl-smoke font-body text-sm">
                No products found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleResultClick(product.id)}
                  className="flex items-center gap-4 p-3 bg-lvl-carbon rounded-xl hover:bg-lvl-slate/30 transition-colors text-left w-full"
                >
                  {/* Product image */}
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-lvl-slate/20">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <Search className="h-4 w-4 text-lvl-slate" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-lvl-smoke text-xs uppercase tracking-wider font-body">
                      {product.brand}
                    </p>
                    <h4 className="text-lvl-white font-medium text-sm mt-0.5 truncate font-body">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lvl-white font-semibold text-sm font-body">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      {product.compare_at_price !== null && (
                        <span className="text-lvl-smoke text-xs line-through font-body">
                          {formatPrice(product.compare_at_price, product.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { SearchModal, type SearchModalProps };
