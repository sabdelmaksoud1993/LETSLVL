"use client";

import {
  useState,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Plus, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  type SellerProduct,
} from "@/lib/seller-store";

// ---------------------------------------------------------------------------
// Constants (shared with new page — could extract to shared module later)
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Streetwear",
  "Vintage",
  "Sneakers",
  "Trading Card Games",
  "Sports Cards",
  "Activewear",
  "Accessories",
  "Toys & Collectibles",
] as const;

const CURRENCIES = ["AED", "SAR", "KWD"] as const;

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45", "46"] as const;

const INPUT_CLS =
  "w-full bg-lvl-slate border border-lvl-slate/50 text-lvl-white rounded-lg px-4 py-2.5 font-body text-sm placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow transition-colors";

const CHIP_CLS =
  "inline-flex items-center gap-1.5 bg-lvl-yellow/20 text-lvl-yellow rounded-full px-3 py-1 text-xs font-body";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");

  // Pricing
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [currency, setCurrency] = useState<string>("AED");

  // Category
  const [category, setCategory] = useState<string>("");

  // Inventory
  const [sku, setSku] = useState("");
  const [inventoryCount, setInventoryCount] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("draft");

  // Variants
  const [selectedSizes, setSelectedSizes] = useState<readonly string[]>([]);
  const [colors, setColors] = useState<readonly string[]>([]);
  const [colorInput, setColorInput] = useState("");

  // Images
  const [images, setImages] = useState<readonly string[]>([""]);

  // Options
  const [tags, setTags] = useState<readonly string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLiveExclusive, setIsLiveExclusive] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ---- load existing product ------------------------------------------------

  useEffect(() => {
    const product = getSellerProduct(productId);
    if (!product) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setTitle(product.title);
    setDescription(product.description);
    setBrand(product.brand);
    setPrice(String(product.price));
    setCompareAtPrice(
      product.compare_at_price !== null ? String(product.compare_at_price) : ""
    );
    setCurrency(product.currency);
    setCategory(product.category);
    setSku(product.sku);
    setInventoryCount(String(product.inventory_count));
    setStatus(product.status === "archived" ? "draft" : product.status);
    setSelectedSizes([...product.sizes]);
    setColors([...product.colors]);
    setImages(product.images.length > 0 ? [...product.images] : [""]);
    setTags([...product.tags]);
    setIsLiveExclusive(product.is_live_exclusive);
    setLoading(false);
  }, [productId]);

  // ---- size helpers ---------------------------------------------------------

  const isShoeSizeCategory = category === "Sneakers";
  const availableSizes = isShoeSizeCategory ? SHOE_SIZES : CLOTHING_SIZES;

  const toggleSize = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  // ---- chip helpers ---------------------------------------------------------

  const addChip = useCallback(
    (
      value: string,
      list: readonly string[],
      setList: (v: readonly string[]) => void,
      setInput: (v: string) => void
    ) => {
      const trimmed = value.trim();
      if (trimmed && !list.includes(trimmed)) {
        setList([...list, trimmed]);
      }
      setInput("");
    },
    []
  );

  const removeChip = useCallback(
    (
      value: string,
      list: readonly string[],
      setList: (v: readonly string[]) => void
    ) => {
      setList(list.filter((v2) => v2 !== value));
    },
    []
  );

  const chipKeyDown = useCallback(
    (
      e: KeyboardEvent<HTMLInputElement>,
      value: string,
      list: readonly string[],
      setList: (v: readonly string[]) => void,
      setInput: (v: string) => void
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addChip(value, list, setList, setInput);
      }
    },
    [addChip]
  );

  // ---- image helpers --------------------------------------------------------

  const updateImage = useCallback(
    (index: number, url: string) => {
      const next = images.map((img, i) => (i === index ? url : img));
      setImages(next);
    },
    [images]
  );

  const addImageSlot = useCallback(() => {
    if (images.length < 5) {
      setImages([...images, ""]);
    }
  }, [images]);

  const removeImageSlot = useCallback(
    (index: number) => {
      setImages(images.filter((_, i) => i !== index));
    },
    [images]
  );

  // ---- validation -----------------------------------------------------------

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (!price || Number(price) <= 0) next.price = "A valid price is required";
    if (!category) next.category = "Select a category";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [title, price, category]);

  // ---- submit ---------------------------------------------------------------

  const handleSave = useCallback(() => {
    if (!validate()) return;
    setSubmitting(true);

    const filteredImages = images.filter((u) => u.trim() !== "");

    const data: Partial<SellerProduct> = {
      title: title.trim(),
      description: description.trim(),
      brand: brand.trim(),
      price: Number(price),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      currency,
      category,
      images: filteredImages,
      sizes: [...selectedSizes],
      colors: [...colors],
      tags: [...tags],
      inventory_count: inventoryCount ? Number(inventoryCount) : 0,
      sku: sku.trim(),
      status,
      is_live_exclusive: isLiveExclusive,
    };

    updateSellerProduct(productId, data);
    router.push("/seller/products");
  }, [
    validate,
    productId,
    title,
    description,
    brand,
    price,
    compareAtPrice,
    currency,
    category,
    images,
    selectedSizes,
    colors,
    tags,
    inventoryCount,
    sku,
    status,
    isLiveExclusive,
    router,
  ]);

  const handleArchive = useCallback(() => {
    if (window.confirm("Are you sure you want to archive this product?")) {
      deleteSellerProduct(productId);
      router.push("/seller/products");
    }
  }, [productId, router]);

  const onFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      handleSave();
    },
    [handleSave]
  );

  // ---- loading / not found --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-lvl-black flex items-center justify-center">
        <p className="text-lvl-smoke font-body text-sm">Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-3xl mx-auto">
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="font-display text-2xl font-bold tracking-wider mb-2">
            PRODUCT NOT FOUND
          </h1>
          <p className="text-lvl-smoke text-sm font-body mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/seller/products"
            className="bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Heading */}
      <h1 className="font-display text-3xl font-bold tracking-wider mb-1">
        EDIT <span className="text-lvl-yellow">PRODUCT</span>
      </h1>
      <p className="text-lvl-smoke text-xs font-body mb-8">ID: {productId}</p>

      <form onSubmit={onFormSubmit} className="space-y-6">
        {/* ── Basic Info ───────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            BASIC INFO
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vintage Nike Air Jordan 1"
                className={cn(INPUT_CLS, errors.title && "ring-1 ring-red-500")}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1 font-body">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell buyers about condition, authenticity, sizing..."
                className={cn(INPUT_CLS, "resize-none")}
              />
            </div>

            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Nike, Pokemon, Fear of God"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            PRICING
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Price <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={cn(INPUT_CLS, errors.price && "ring-1 ring-red-500")}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1 font-body">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Compare at Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Optional"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={INPUT_CLS}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Category ─────────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            CATEGORY
          </h2>

          <div>
            <label className="block text-sm font-body text-lvl-smoke mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelectedSizes([]);
              }}
              className={cn(
                INPUT_CLS,
                errors.category && "ring-1 ring-red-500"
              )}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-xs mt-1 font-body">
                {errors.category}
              </p>
            )}
          </div>
        </section>

        {/* ── Inventory ────────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            INVENTORY
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SNK-AJ1-001"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Inventory Count
              </label>
              <input
                type="number"
                min="0"
                value={inventoryCount}
                onChange={(e) => setInventoryCount(e.target.value)}
                placeholder="0"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-sm font-body text-lvl-smoke mb-1.5">
                Status
              </label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-display font-bold tracking-wider transition-colors",
                    status === "active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/40"
                      : "bg-lvl-slate text-lvl-smoke border border-lvl-slate/50"
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-display font-bold tracking-wider transition-colors",
                    status === "draft"
                      ? "bg-lvl-yellow/20 text-lvl-yellow border border-lvl-yellow/40"
                      : "bg-lvl-slate text-lvl-smoke border border-lvl-slate/50"
                  )}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Variants ─────────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            VARIANTS
          </h2>

          {/* Sizes */}
          <div className="mb-5">
            <label className="block text-sm font-body text-lvl-smoke mb-2">
              Sizes {isShoeSizeCategory ? "(EU)" : ""}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const selected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-display font-bold tracking-wider transition-colors border",
                      selected
                        ? "bg-lvl-yellow/20 text-lvl-yellow border-lvl-yellow/40"
                        : "bg-lvl-slate text-lvl-smoke border-lvl-slate/50 hover:border-lvl-smoke"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-body text-lvl-smoke mb-2">
              Colors
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {colors.map((color) => (
                <span key={color} className={CHIP_CLS}>
                  {color}
                  <button
                    type="button"
                    onClick={() => removeChip(color, colors, setColors)}
                    className="hover:text-lvl-white transition-colors"
                    aria-label={`Remove ${color}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) =>
                chipKeyDown(e, colorInput, colors, setColors, setColorInput)
              }
              placeholder="Type a color and press Enter"
              className={cn(INPUT_CLS, "max-w-xs")}
            />
          </div>
        </section>

        {/* ── Images ───────────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            IMAGES
          </h2>
          <p className="text-lvl-smoke text-xs font-body mb-4">
            Add up to 5 image URLs. Paste links from Unsplash, Imgur, etc.
          </p>

          <div className="space-y-3">
            {images.map((url, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0 overflow-hidden">
                  {url.trim() ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-lvl-smoke" />
                  )}
                </div>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateImage(i, e.target.value)}
                  placeholder="https://..."
                  className={cn(INPUT_CLS, "flex-1")}
                />

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageSlot(i)}
                    className="mt-2 text-lvl-smoke hover:text-red-400 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {images.length < 5 && (
            <button
              type="button"
              onClick={addImageSlot}
              className="mt-3 inline-flex items-center gap-1.5 text-lvl-yellow text-sm font-body hover:opacity-80 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add another image
            </button>
          )}
        </section>

        {/* ── Options ──────────────────────────────────────────────────────── */}
        <section className="bg-lvl-carbon rounded-xl p-6">
          <h2 className="font-display text-lg font-bold tracking-wider mb-4">
            OPTIONS
          </h2>

          {/* Tags */}
          <div className="mb-5">
            <label className="block text-sm font-body text-lvl-smoke mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className={CHIP_CLS}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeChip(tag, tags, setTags)}
                    className="hover:text-lvl-white transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) =>
                chipKeyDown(e, tagInput, tags, setTags, setTagInput)
              }
              placeholder="Type a tag and press Enter"
              className={cn(INPUT_CLS, "max-w-xs")}
            />
          </div>

          {/* Live Exclusive toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-lvl-white">
                Live Exclusive
              </p>
              <p className="text-xs font-body text-lvl-smoke mt-0.5">
                Only available during live streams
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isLiveExclusive}
              onClick={() => setIsLiveExclusive((prev) => !prev)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                isLiveExclusive ? "bg-lvl-yellow" : "bg-lvl-slate"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-lvl-black rounded-full transition-transform",
                  isLiveExclusive && "translate-x-5"
                )}
              />
            </button>
          </div>
        </section>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handleArchive}
            className="py-3 px-6 rounded-lg font-display font-bold text-sm tracking-widest uppercase bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            ARCHIVE PRODUCT
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-lg font-display font-bold text-sm tracking-widest uppercase bg-lvl-yellow text-lvl-black hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
}
