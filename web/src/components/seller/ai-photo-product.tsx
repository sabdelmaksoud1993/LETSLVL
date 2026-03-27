"use client";

import { useState, useCallback, useRef } from "react";
import { Camera, Loader2, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiPhotoProductProps {
  readonly onApply: (data: {
    title: string;
    brand: string;
    description: string;
    tags: string[];
    suggestedPrice: number;
  }) => void;
}

interface Suggestions {
  readonly title: string;
  readonly brand: string;
  readonly category: string;
  readonly description: string;
  readonly tags: string[];
  readonly suggestedPrice: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AiPhotoProduct({ onApply }: AiPhotoProductProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    setError(null);
    setSuggestions(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      // Send to API
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/ai/analyze-product-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to analyze image");
        }

        const data = (await response.json()) as Suggestions;
        setSuggestions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to analyze image"
        );
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleApply = useCallback(() => {
    if (suggestions) {
      onApply({
        title: suggestions.title,
        brand: suggestions.brand,
        description: suggestions.description,
        tags: [...suggestions.tags],
        suggestedPrice: suggestions.suggestedPrice,
      });
    }
  }, [suggestions, onApply]);

  const handleReset = useCallback(() => {
    setPreview(null);
    setSuggestions(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="rounded-xl border border-dashed border-lvl-yellow/40 bg-lvl-yellow/5 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-5 h-5 text-lvl-yellow" />
        <span className="font-display font-bold tracking-wider text-lvl-yellow">
          QUICK START — PHOTO TO PRODUCT
        </span>
      </div>
      <p className="text-xs font-body text-lvl-smoke mb-4">
        Upload a product photo and AI will suggest title, description, tags, and
        pricing for you.
      </p>

      {!preview && !suggestions && (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 cursor-pointer transition-colors",
            dragOver
              ? "border-lvl-yellow bg-lvl-yellow/10"
              : "border-lvl-slate/50 hover:border-lvl-smoke"
          )}
        >
          <Upload className="w-8 h-8 text-lvl-smoke" />
          <div className="text-center">
            <p className="text-sm font-body text-lvl-white">
              Drop an image here or{" "}
              <span className="text-lvl-yellow">browse</span>
            </p>
            <p className="text-xs font-body text-lvl-smoke mt-1">
              JPEG, PNG, or WebP (max 10MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Loading state */}
      {loading && preview && (
        <div className="flex items-center gap-4 rounded-lg bg-lvl-carbon p-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-lvl-yellow animate-spin" />
            <span className="text-sm font-body text-lvl-smoke">
              Analyzing image...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3">
          <p className="text-red-400 text-xs font-body">{error}</p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 text-xs font-body text-lvl-yellow hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Suggestions preview */}
      {suggestions && !loading && (
        <div className="space-y-3">
          <div className="flex gap-4 rounded-lg bg-lvl-carbon p-4">
            {preview && (
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Uploaded product"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold text-lvl-white truncate">
                {suggestions.title}
              </p>
              <p className="text-xs font-body text-lvl-smoke mt-0.5">
                {suggestions.brand} &middot; {suggestions.category}
              </p>
              <p className="text-xs font-body text-lvl-white/80 mt-2 line-clamp-2">
                {suggestions.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestions.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-body bg-lvl-yellow/20 text-lvl-yellow"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm font-display font-bold text-lvl-yellow mt-2">
                ~{suggestions.suggestedPrice} AED
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 py-2 px-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase bg-lvl-yellow text-lvl-black hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              USE THESE DETAILS
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase border border-lvl-slate text-lvl-smoke hover:text-lvl-white transition-colors"
            >
              DISCARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
