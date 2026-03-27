"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Radio,
  Camera,
  Mic,
  Package,
  Sun,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Trading Card Games",
  "Sports Cards",
  "Fashion",
  "Toys & Collectibles",
] as const;

const MOCK_PRODUCTS = [
  { id: "p1", name: "Pokemon SV Booster Box", price: 850 },
  { id: "p2", name: "One Piece TCG Display", price: 2100 },
  { id: "p3", name: "Yu-Gi-Oh! Starter Deck", price: 180 },
  { id: "p4", name: "Digimon Card Game Booster", price: 320 },
  { id: "p5", name: "Dragon Ball Super Card Pack", price: 95 },
] as const;

const CHECKLIST = [
  { key: "camera", label: "Camera ready", icon: Camera },
  { key: "audio", label: "Audio check", icon: Mic },
  { key: "products", label: "Products organized", icon: Package },
  { key: "lighting", label: "Good lighting", icon: Sun },
] as const;

export default function GoLivePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ReadonlySet<string>
  >(new Set());
  const [checks, setChecks] = useState<Record<string, boolean>>({
    camera: false,
    audio: false,
    products: false,
    lighting: false,
  });

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
    allChecked;

  const inputClass =
    "w-full bg-lvl-carbon border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors";

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
            <button
              type="button"
              className="w-full h-36 border-2 border-dashed border-lvl-slate rounded-xl flex flex-col items-center justify-center gap-2 hover:border-lvl-yellow/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-lvl-smoke" />
              <span className="text-sm text-lvl-smoke font-body">
                Click to upload thumbnail
              </span>
              <span className="text-xs text-lvl-smoke/60 font-body">
                16:9 recommended, max 5 MB
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Product Selector */}
      <section className="mb-8">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Featured Products
        </h2>
        <div className="bg-lvl-carbon rounded-xl divide-y divide-lvl-slate/40">
          {MOCK_PRODUCTS.map((product) => {
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
                      : "border-lvl-slate"
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
                  <p className="text-sm font-body truncate">{product.name}</p>
                </div>
                <p className="text-sm font-display font-bold text-lvl-smoke shrink-0">
                  {product.price} AED
                </p>
              </label>
            );
          })}
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
                      : "border-lvl-slate"
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

      {/* Go Live Button */}
      <button
        type="button"
        disabled={!canGoLive}
        className={cn(
          "w-full py-4 rounded-xl font-display text-2xl uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-opacity",
          canGoLive
            ? "bg-lvl-yellow text-lvl-black hover:opacity-90"
            : "bg-lvl-yellow/30 text-lvl-black/40 cursor-not-allowed"
        )}
      >
        <Radio className="w-6 h-6" />
        GO LIVE
      </button>

      <p className="text-center text-lvl-smoke text-xs font-body mt-3">
        Your stream will be visible to all LVL buyers
      </p>
    </div>
  );
}
