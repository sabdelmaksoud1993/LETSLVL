"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Variant {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  inventory: number;
  imageUrl: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VariantManagerProps {
  sizes: string[];
  colors: string[];
  basePrice: number;
  onChange: (variants: Variant[]) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INPUT_CLS =
  "w-full bg-lvl-slate border border-lvl-slate/50 text-lvl-white rounded-lg px-3 py-2 font-body text-sm placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow transition-colors";

function generateId(): string {
  return `var_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateSku(size: string, color: string): string {
  const s = size.toUpperCase().replace(/\s+/g, "");
  const c = color.toUpperCase().replace(/\s+/g, "").slice(0, 3);
  return `${s}-${c}`;
}

function generateCombinations(
  sizes: string[],
  colors: string[],
  basePrice: number,
  existingVariants: readonly Variant[]
): Variant[] {
  const existingKeys = new Set(
    existingVariants.map((v) => `${v.size}|${v.color}`)
  );

  const newVariants: Variant[] = [];

  const sizeList = sizes.length > 0 ? sizes : [""];
  const colorList = colors.length > 0 ? colors : [""];

  for (const size of sizeList) {
    for (const color of colorList) {
      const key = `${size}|${color}`;
      if (!existingKeys.has(key)) {
        newVariants.push({
          id: generateId(),
          size,
          color,
          sku: generateSku(size, color),
          price: basePrice,
          inventory: 0,
          imageUrl: "",
        });
      }
    }
  }

  return newVariants;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VariantManager({
  sizes,
  colors,
  basePrice,
  onChange,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<readonly Variant[]>([]);

  // Auto-generate combinations when sizes/colors change
  useEffect(() => {
    if (sizes.length === 0 && colors.length === 0) return;

    setVariants((prev) => {
      const generated = generateCombinations(sizes, colors, basePrice, prev);
      if (generated.length === 0) return prev;
      const next = [...prev, ...generated];
      // Defer onChange to avoid calling during render
      setTimeout(() => onChange([...next]), 0);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes.join(","), colors.join(",")]);

  // ---- Total inventory ----------------------------------------------------

  const totalInventory = useMemo(
    () => variants.reduce((sum, v) => sum + v.inventory, 0),
    [variants]
  );

  // ---- Update variant field -----------------------------------------------

  const updateVariant = useCallback(
    (id: string, field: keyof Variant, value: string | number) => {
      setVariants((prev) => {
        const next = prev.map((v) => {
          if (v.id !== id) return v;
          switch (field) {
            case "sku":
              return { ...v, sku: String(value) };
            case "price":
              return { ...v, price: Number(value) || 0 };
            case "inventory":
              return { ...v, inventory: Math.max(0, Math.floor(Number(value) || 0)) };
            case "imageUrl":
              return { ...v, imageUrl: String(value) };
            default:
              return v;
          }
        });
        onChange([...next]);
        return next;
      });
    },
    [onChange]
  );

  // ---- Add custom variant -------------------------------------------------

  const addVariant = useCallback(() => {
    const newVariant: Variant = {
      id: generateId(),
      size: "",
      color: "",
      sku: "",
      price: basePrice,
      inventory: 0,
      imageUrl: "",
    };
    setVariants((prev) => {
      const next = [...prev, newVariant];
      onChange([...next]);
      return next;
    });
  }, [basePrice, onChange]);

  // ---- Remove variant -----------------------------------------------------

  const removeVariant = useCallback(
    (id: string) => {
      setVariants((prev) => {
        const next = prev.filter((v) => v.id !== id);
        onChange([...next]);
        return next;
      });
    },
    [onChange]
  );

  // ---- Update custom size/color -------------------------------------------

  const updateVariantOption = useCallback(
    (id: string, field: "size" | "color", value: string) => {
      setVariants((prev) => {
        const next = prev.map((v) => {
          if (v.id !== id) return v;
          return { ...v, [field]: value };
        });
        onChange([...next]);
        return next;
      });
    },
    [onChange]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-bold tracking-wider text-lvl-white uppercase">
          Manage Variants
        </h3>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1.5 text-lvl-yellow text-xs font-display font-bold tracking-wider uppercase hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto w-10 h-10 text-lvl-slate mb-2" />
          <p className="text-sm font-body text-lvl-smoke">
            Select sizes and colors above to auto-generate variant combinations,
            or add custom variants.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-[80px_80px_1fr_100px_80px_40px] gap-2 px-2">
            {["Size", "Color", "SKU", "Price", "Qty", ""].map((label) => (
              <span
                key={label}
                className="text-xs font-display font-bold tracking-wider text-lvl-smoke uppercase"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Variant rows */}
          <div className="space-y-2">
            {variants.map((variant) => {
              const isGenerated =
                (sizes.includes(variant.size) || variant.size === "") &&
                (colors.includes(variant.color) || variant.color === "");

              return (
                <div
                  key={variant.id}
                  className="bg-lvl-slate/30 rounded-lg p-3 sm:p-2"
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-body text-lvl-white">
                        {variant.size && variant.color
                          ? `${variant.size} / ${variant.color}`
                          : variant.size || variant.color || "Custom"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="text-lvl-smoke hover:text-red-400 transition-colors"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-body text-lvl-smoke mb-0.5">SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                          placeholder="SKU"
                          className={INPUT_CLS}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-body text-lvl-smoke mb-0.5">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                          className={INPUT_CLS}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-body text-lvl-smoke mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.inventory}
                          onChange={(e) => updateVariant(variant.id, "inventory", e.target.value)}
                          className={INPUT_CLS}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid sm:grid-cols-[80px_80px_1fr_100px_80px_40px] gap-2 items-center">
                    {/* Size */}
                    {isGenerated && variant.size ? (
                      <span className="text-sm font-body text-lvl-white px-1 truncate">
                        {variant.size}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariantOption(variant.id, "size", e.target.value)}
                        placeholder="Size"
                        className={cn(INPUT_CLS, "text-xs")}
                      />
                    )}

                    {/* Color */}
                    {isGenerated && variant.color ? (
                      <span className="text-sm font-body text-lvl-white px-1 truncate">
                        {variant.color}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariantOption(variant.id, "color", e.target.value)}
                        placeholder="Color"
                        className={cn(INPUT_CLS, "text-xs")}
                      />
                    )}

                    {/* SKU */}
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                      placeholder="SKU"
                      className={cn(INPUT_CLS, "text-xs")}
                    />

                    {/* Price */}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                      className={cn(INPUT_CLS, "text-xs text-right")}
                    />

                    {/* Inventory */}
                    <input
                      type="number"
                      min="0"
                      value={variant.inventory}
                      onChange={(e) => updateVariant(variant.id, "inventory", e.target.value)}
                      className={cn(INPUT_CLS, "text-xs text-center")}
                    />

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="flex items-center justify-center text-lvl-smoke hover:text-red-400 transition-colors"
                      aria-label={`Remove variant ${variant.size} ${variant.color}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total inventory */}
          <div className="flex items-center justify-between pt-2 border-t border-lvl-slate/30">
            <span className="text-sm font-display font-bold tracking-wider text-lvl-smoke uppercase">
              Total Inventory
            </span>
            <span className="text-lg font-display font-bold text-lvl-yellow">
              {totalInventory}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
