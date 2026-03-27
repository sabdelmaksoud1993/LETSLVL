"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiDescriptionProps {
  readonly title: string;
  readonly brand: string;
  readonly category: string;
  readonly onApply: (description: string) => void;
}

interface GeneratedDescriptions {
  readonly english: string;
  readonly arabic: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AiDescriptionGenerator({
  title,
  brand,
  category,
  onApply,
}: AiDescriptionProps) {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descriptions, setDescriptions] = useState<GeneratedDescriptions | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!title.trim()) {
      setError("Enter a product title first");
      return;
    }

    setLoading(true);
    setError(null);
    setDescriptions(null);

    try {
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brand, category, keywords }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate description");
      }

      const data = (await response.json()) as GeneratedDescriptions;
      setDescriptions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate description"
      );
    } finally {
      setLoading(false);
    }
  }, [title, brand, category, keywords]);

  const handleApplyEnglish = useCallback(() => {
    if (descriptions) {
      onApply(descriptions.english);
    }
  }, [descriptions, onApply]);

  const handleApplyArabic = useCallback(() => {
    if (descriptions) {
      onApply(descriptions.arabic);
    }
  }, [descriptions, onApply]);

  const handleApplyBoth = useCallback(() => {
    if (descriptions) {
      onApply(`${descriptions.english}\n\n---\n\n${descriptions.arabic}`);
    }
  }, [descriptions, onApply]);

  return (
    <div className="mt-3 rounded-lg border border-lvl-slate/50 bg-lvl-slate/20 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-lvl-yellow" />
        <span className="text-sm font-display font-bold tracking-wider text-lvl-yellow">
          AI DESCRIPTION GENERATOR
        </span>
      </div>

      {/* Keywords input */}
      <div className="mb-3">
        <label className="block text-xs font-body text-lvl-smoke mb-1">
          Keywords (optional, comma-separated)
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. limited edition, authentic, streetwear"
          className="w-full bg-lvl-slate border border-lvl-slate/50 text-lvl-white rounded-lg px-3 py-2 font-body text-sm placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow transition-colors"
        />
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !title.trim()}
        className={cn(
          "flex items-center gap-2 py-2 px-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all",
          loading || !title.trim()
            ? "bg-lvl-slate text-lvl-smoke cursor-not-allowed opacity-50"
            : "bg-lvl-yellow text-lvl-black hover:opacity-90"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            GENERATING...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            GENERATE DESCRIPTION
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="mt-2 text-red-400 text-xs font-body">{error}</p>
      )}

      {/* Results */}
      {descriptions && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English */}
            <div className="rounded-lg border border-lvl-slate/50 bg-lvl-carbon p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Languages className="w-3.5 h-3.5 text-lvl-smoke" />
                <span className="text-xs font-display font-bold tracking-wider text-lvl-smoke">
                  ENGLISH
                </span>
              </div>
              <p className="text-sm font-body text-lvl-white/90 leading-relaxed">
                {descriptions.english}
              </p>
            </div>

            {/* Arabic */}
            <div
              className="rounded-lg border border-lvl-slate/50 bg-lvl-carbon p-3"
              dir="rtl"
            >
              <div className="flex items-center gap-1.5 mb-2" dir="ltr">
                <Languages className="w-3.5 h-3.5 text-lvl-smoke" />
                <span className="text-xs font-display font-bold tracking-wider text-lvl-smoke">
                  ARABIC
                </span>
              </div>
              <p className="text-sm font-body text-lvl-white/90 leading-relaxed">
                {descriptions.arabic}
              </p>
            </div>
          </div>

          {/* Apply buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApplyEnglish}
              className="py-1.5 px-3 rounded-lg text-xs font-display font-bold tracking-wider border border-lvl-yellow text-lvl-yellow hover:bg-lvl-yellow/10 transition-colors"
            >
              USE ENGLISH
            </button>
            <button
              type="button"
              onClick={handleApplyArabic}
              className="py-1.5 px-3 rounded-lg text-xs font-display font-bold tracking-wider border border-lvl-yellow text-lvl-yellow hover:bg-lvl-yellow/10 transition-colors"
            >
              USE ARABIC
            </button>
            <button
              type="button"
              onClick={handleApplyBoth}
              className="py-1.5 px-3 rounded-lg text-xs font-display font-bold tracking-wider bg-lvl-yellow text-lvl-black hover:opacity-90 transition-opacity"
            >
              USE BOTH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
