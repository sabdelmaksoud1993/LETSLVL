"use client";

import { useState, useCallback } from "react";
import { Loader2, Wand2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIBackgroundRemoveProps {
  imageUrl: string;
  onReplace: (newUrl: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIBackgroundRemove({ imageUrl, onReplace }: AIBackgroundRemoveProps) {
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveBackground = useCallback(async () => {
    setProcessing(true);
    setError(null);
    setProcessedUrl(null);

    try {
      const response = await fetch("/api/ai/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to process image");
      }

      const data = await response.json();
      setProcessedUrl(data.processedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setProcessing(false);
    }
  }, [imageUrl]);

  const handleUseProcessed = useCallback(() => {
    if (processedUrl) {
      onReplace(processedUrl);
      setProcessedUrl(null);
    }
  }, [processedUrl, onReplace]);

  const handleReset = useCallback(() => {
    setProcessedUrl(null);
    setError(null);
  }, []);

  // Show before/after comparison when processed
  if (processedUrl) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <p className="text-xs font-display font-bold tracking-wider text-lvl-smoke mb-2 uppercase">
              Original
            </p>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-lvl-slate">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Original"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* After */}
          <div>
            <p className="text-xs font-display font-bold tracking-wider text-lvl-yellow mb-2 uppercase">
              Processed
            </p>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#2a2a2a_0%_50%)] bg-[length:16px_16px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processedUrl}
                alt="Background removed"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUseProcessed}
            className="flex-1 flex items-center justify-center gap-2 bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-sm py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            <Check className="w-4 h-4" />
            Use Processed Image
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 border border-lvl-slate text-lvl-smoke font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold hover:text-lvl-white hover:border-lvl-smoke transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default state: show image with remove background button
  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-lvl-slate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Product image"
          className="w-full h-full object-cover"
        />

        {/* Loading overlay */}
        {processing && (
          <div className="absolute inset-0 bg-lvl-black/70 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-lvl-yellow animate-spin" />
            <p className="text-sm font-body text-lvl-smoke">
              Removing background...
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-400 text-xs font-body">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleRemoveBackground}
        disabled={processing}
        className={cn(
          "w-full flex items-center justify-center gap-2 font-display uppercase tracking-widest text-sm py-2.5 rounded-lg font-bold transition-all",
          "bg-lvl-slate text-lvl-smoke hover:text-lvl-yellow hover:bg-lvl-slate/80",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Wand2 className="w-4 h-4" />
        Remove Background
      </button>
    </div>
  );
}
