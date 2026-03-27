"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Radio,
  Camera,
  Mic,
  Package,
  Sun,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase-browser";
import { ImageUploader } from "@/components/seller/image-uploader";

const CATEGORIES = [
  "Trading Card Games",
  "Sports Cards",
  "Fashion",
  "Toys & Collectibles",
] as const;

const CHECKLIST = [
  { key: "camera", label: "Camera ready", icon: Camera },
  { key: "audio", label: "Audio check", icon: Mic },
  { key: "products", label: "Products organized", icon: Package },
  { key: "lighting", label: "Good lighting", icon: Sun },
] as const;

interface SellerProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
}

export default function GoLivePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImages, setThumbnailImages] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    ReadonlySet<string>
  >(new Set());
  const [checks, setChecks] = useState<Record<string, boolean>>({
    camera: false,
    audio: false,
    products: false,
    lighting: false,
  });
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [goingLive, setGoingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch seller's products from Supabase
  useEffect(() => {
    if (!user) {
      setProductsLoading(false);
      return;
    }

    async function fetchProducts() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, title, price, currency")
        .eq("seller_id", user!.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Failed to fetch products:", fetchError.message);
      } else {
        setSellerProducts(
          (data ?? []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            price: p.price as number,
            currency: (p.currency as string) ?? "AED",
          })),
        );
      }
      setProductsLoading(false);
    }

    fetchProducts();
  }, [user]);

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);
  const canGoLive =
    title.trim().length > 0 &&
    category.length > 0 &&
    selectedProducts.size > 0 &&
    allChecked &&
    !goingLive;

  const handleGoLive = useCallback(async () => {
    if (!user || !canGoLive) return;

    setGoingLive(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: stream, error: insertError } = await supabase
        .from("streams")
        .insert({
          seller_id: user.id,
          title: title.trim(),
          category,
          description: description.trim(),
          thumbnail_url: thumbnailImages[0] ?? null,
          status: "live",
          viewer_count: 0,
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Redirect to the newly created stream
      router.push(`/live/stream/${stream.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start stream.";
      setError(message);
      setGoingLive(false);
    }
  }, [user, canGoLive, title, category, description, thumbnailImages, router]);

  // Auth guard
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-lvl-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lvl-white font-display text-2xl mb-2">
            Sign in required
          </p>
          <p className="text-lvl-smoke font-body text-sm mb-4">
            You need to be signed in as a seller to go live.
          </p>
          <a
            href="/auth/login"
            className="inline-block bg-lvl-yellow text-lvl-black font-display font-bold text-sm uppercase px-6 py-3 rounded-xl hover:bg-lvl-yellow/90 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-lvl-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-lvl-yellow" />
      </div>
    );
  }

  const inputClass =
    "w-full bg-lvl-carbon border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors";

  const displayProducts =
    sellerProducts.length > 0 ? sellerProducts : [];

  return (
    <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/seller/dashboard"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-wider mb-8">
        GO <span className="text-lvl-yellow">LIVE</span>
      </h1>

      {/* Stream Setup Form */}
      <section className="mb-8">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Stream Setup
        </h2>
        <div className="bg-lvl-carbon rounded-xl p-5 space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="stream-title"
              className="block text-sm font-body text-lvl-smoke mb-1.5"
            >
              Stream Title
            </label>
            <input
              id="stream-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pokemon Pack Opening Marathon"
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-body text-lvl-smoke mb-1.5"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(inputClass, "appearance-none")}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-body text-lvl-smoke mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers what to expect..."
              className={cn(inputClass, "resize-none")}
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-body text-lvl-smoke mb-1.5">
              Thumbnail
            </label>
            <ImageUploader
              images={thumbnailImages}
              onChange={setThumbnailImages}
              maxImages={1}
            />
          </div>
        </div>
      </section>

      {/* Product Selector */}
      <section className="mb-8">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Featured Products
        </h2>
        <div className="bg-lvl-carbon rounded-xl divide-y divide-lvl-slate/40">
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-lvl-smoke" />
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-lvl-smoke font-body">
                No products found. Add products to your store first.
              </p>
            </div>
          ) : (
            displayProducts.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              return (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-lvl-slate/20 transition-colors"
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-lvl-yellow border-lvl-yellow"
                        : "border-lvl-slate",
                    )}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-lvl-black" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProduct(product.id)}
                    className="sr-only"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body truncate">{product.title}</p>
                  </div>
                  <p className="text-sm font-display font-bold text-lvl-smoke shrink-0">
                    {product.price} {product.currency}
                  </p>
                </label>
              );
            })
          )}
        </div>
      </section>

      {/* Pre-stream Checklist */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Pre-Stream Checklist
        </h2>
        <div className="bg-lvl-carbon rounded-xl divide-y divide-lvl-slate/40">
          {CHECKLIST.map(({ key, label, icon: Icon }) => {
            const checked = checks[key] ?? false;
            return (
              <label
                key={key}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-lvl-slate/20 transition-colors"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    checked
                      ? "bg-lvl-yellow border-lvl-yellow"
                      : "border-lvl-slate",
                  )}
                >
                  {checked && (
                    <Check className="w-3 h-3 text-lvl-black" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(key)}
                  className="sr-only"
                />
                <Icon className="w-4 h-4 text-lvl-smoke" />
                <span className="text-sm font-body">{label}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 font-body text-center mb-4">
          {error}
        </p>
      )}

      {/* Go Live Button */}
      <button
        type="button"
        disabled={!canGoLive}
        onClick={handleGoLive}
        className={cn(
          "w-full py-4 rounded-xl font-display text-2xl uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-opacity",
          canGoLive
            ? "bg-lvl-yellow text-lvl-black hover:opacity-90"
            : "bg-lvl-yellow/30 text-lvl-black/40 cursor-not-allowed",
        )}
      >
        {goingLive ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Radio className="w-6 h-6" />
        )}
        {goingLive ? "STARTING..." : "GO LIVE"}
      </button>

      <p className="text-center text-lvl-smoke text-xs font-body mt-3">
        Your stream will be visible to all LVL buyers
      </p>
    </div>
  );
}
