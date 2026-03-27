"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Undo2,
  Package,
  LogIn,
  Check,
  Loader2,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getSellerProducts, updateProduct } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import type { Product } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditableRow {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  inventory_count: number;
  status: "active" | "draft" | "archived";
  image: string | null;
  currency: string;
}

type EditableField = "title" | "price" | "compare_at_price" | "inventory_count" | "status";

interface CellRef {
  rowIndex: number;
  field: EditableField;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EDITABLE_FIELDS: EditableField[] = [
  "title",
  "price",
  "compare_at_price",
  "inventory_count",
  "status",
];

const STATUS_OPTIONS: { value: Product["status"]; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

function rowFromProduct(p: Product): EditableRow {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    compare_at_price: p.compare_at_price,
    inventory_count: p.inventory_count,
    status: p.status,
    image: p.images.length > 0 ? p.images[0] : null,
    currency: p.currency,
  };
}

function rowsEqual(a: EditableRow, b: EditableRow): boolean {
  return (
    a.title === b.title &&
    a.price === b.price &&
    a.compare_at_price === b.compare_at_price &&
    a.inventory_count === b.inventory_count &&
    a.status === b.status
  );
}

const INPUT_CLS =
  "w-full bg-transparent border border-transparent text-lvl-white font-body text-sm px-2 py-1.5 rounded focus:outline-none focus:border-lvl-yellow focus:bg-lvl-slate/50 transition-colors";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BulkEditPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Original rows (from DB) and current editable rows
  const [originalRows, setOriginalRows] = useState<readonly EditableRow[]>([]);
  const [rows, setRows] = useState<readonly EditableRow[]>([]);

  // Selection
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  // Active cell for keyboard navigation
  const [activeCell, setActiveCell] = useState<CellRef | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // ---- load products -------------------------------------------------------

  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getSellerProducts(user.id);
      const mapped = data.map(rowFromProduct);
      setOriginalRows(mapped);
      setRows(mapped);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadProducts();
  }, [user, loadProducts]);

  // ---- modified rows -------------------------------------------------------

  const modifiedRows = useMemo(() => {
    const modified: EditableRow[] = [];
    for (const row of rows) {
      const original = originalRows.find((o) => o.id === row.id);
      if (original && !rowsEqual(original, row)) {
        modified.push(row);
      }
    }
    return modified;
  }, [rows, originalRows]);

  const modifiedIds = useMemo(
    () => new Set(modifiedRows.map((r) => r.id)),
    [modifiedRows]
  );

  // ---- selection handlers --------------------------------------------------

  const allSelected = rows.length > 0 && selected.size === rows.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }, [allSelected, rows]);

  const toggleRow = useCallback(
    (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setSelected(next);
    },
    [selected]
  );

  // ---- cell edit handlers --------------------------------------------------

  const updateCell = useCallback(
    (id: string, field: EditableField, value: string | number) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          switch (field) {
            case "title":
              return { ...row, title: String(value) };
            case "price":
              return { ...row, price: Number(value) || 0 };
            case "compare_at_price": {
              const num = Number(value);
              return { ...row, compare_at_price: num > 0 ? num : null };
            }
            case "inventory_count":
              return { ...row, inventory_count: Math.max(0, Math.floor(Number(value) || 0)) };
            case "status":
              return { ...row, status: value as Product["status"] };
            default:
              return row;
          }
        })
      );
    },
    []
  );

  // ---- keyboard navigation (Tab between cells) ----------------------------

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, field: EditableField) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const fieldIdx = EDITABLE_FIELDS.indexOf(field);
        const forward = !e.shiftKey;

        let nextRow = rowIndex;
        let nextFieldIdx = forward ? fieldIdx + 1 : fieldIdx - 1;

        if (nextFieldIdx >= EDITABLE_FIELDS.length) {
          nextRow = rowIndex + 1;
          nextFieldIdx = 0;
        } else if (nextFieldIdx < 0) {
          nextRow = rowIndex - 1;
          nextFieldIdx = EDITABLE_FIELDS.length - 1;
        }

        if (nextRow >= 0 && nextRow < rows.length) {
          setActiveCell({ rowIndex: nextRow, field: EDITABLE_FIELDS[nextFieldIdx] });
        }
      }
    },
    [rows.length]
  );

  // Focus active cell when it changes
  useEffect(() => {
    if (!activeCell || !tableRef.current) return;
    const cellId = `cell-${activeCell.rowIndex}-${activeCell.field}`;
    const el = tableRef.current.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement | null;
    if (el) {
      const input = el.querySelector("input, select") as HTMLElement | null;
      if (input) input.focus();
    }
  }, [activeCell]);

  // ---- save ----------------------------------------------------------------

  const handleSave = useCallback(async () => {
    if (modifiedRows.length === 0) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updates = modifiedRows.map((row) =>
        updateProduct(row.id, {
          title: row.title,
          price: row.price,
          compare_at_price: row.compare_at_price,
          inventory_count: row.inventory_count,
          status: row.status,
        })
      );
      await Promise.all(updates);

      // Update original rows to match current
      setOriginalRows([...rows]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save changes:", err);
      alert("Failed to save some changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [modifiedRows, rows]);

  // ---- discard -------------------------------------------------------------

  const handleDiscard = useCallback(() => {
    setRows([...originalRows]);
    setSelected(new Set());
  }, [originalRows]);

  // ---- auth gate -----------------------------------------------------------

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <LogIn className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-wider">
          SIGN IN TO <span className="text-lvl-yellow">BULK EDIT</span>
        </h1>
        <p className="mt-2 text-lvl-smoke font-body text-sm">
          You need to be logged in to manage your products.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest py-3 px-8 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back */}
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wider">
            BULK <span className="text-lvl-yellow">EDIT</span>
          </h1>
          {modifiedRows.length > 0 && (
            <p className="text-lvl-yellow text-sm font-body mt-1">
              {modifiedRows.length} product{modifiedRows.length !== 1 ? "s" : ""} modified
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={modifiedRows.length === 0 || saving}
            className="flex items-center gap-2 border border-lvl-slate text-lvl-smoke font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold hover:text-lvl-white hover:border-lvl-smoke transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
            Discard
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={modifiedRows.length === 0 || saving}
            className={cn(
              "flex items-center gap-2 font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
              saveSuccess
                ? "bg-green-500 text-white"
                : "bg-lvl-yellow text-lvl-black hover:opacity-90"
            )}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading || authLoading ? (
        <div className="bg-lvl-carbon rounded-xl overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-pulse"
              >
                <div className="w-5 h-5 rounded bg-lvl-slate/50" />
                <div className="w-10 h-10 rounded bg-lvl-slate/50" />
                <div className="flex-1 h-4 rounded bg-lvl-slate/50" />
                <div className="w-20 h-4 rounded bg-lvl-slate/50" />
                <div className="w-20 h-4 rounded bg-lvl-slate/50" />
                <div className="w-16 h-4 rounded bg-lvl-slate/50" />
                <div className="w-24 h-4 rounded bg-lvl-slate/50" />
              </div>
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-lvl-slate mb-4" />
          <p className="font-display text-lg font-bold tracking-wide mb-1">
            No products yet
          </p>
          <p className="text-lvl-smoke text-sm font-body">
            Add products first, then come back to bulk edit.
          </p>
          <Link
            href="/seller/products/new"
            className="mt-4 inline-block bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest py-2.5 px-5 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-lvl-carbon rounded-xl overflow-x-auto">
          <table ref={tableRef} className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-lvl-slate/50">
                <th className="w-12 px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      allSelected
                        ? "bg-lvl-yellow border-lvl-yellow"
                        : "border-lvl-slate hover:border-lvl-smoke"
                    )}
                    aria-label="Select all"
                  >
                    {allSelected && <Check className="w-3 h-3 text-lvl-black" />}
                  </button>
                </th>
                <th className="w-14 px-2 py-3" />
                {[
                  { label: "Title", width: "flex-1" },
                  { label: "Price", width: "w-28" },
                  { label: "Compare At", width: "w-28" },
                  { label: "Inventory", width: "w-24" },
                  { label: "Status", width: "w-32" },
                ].map(({ label }) => (
                  <th
                    key={label}
                    className="px-2 py-3 text-left text-xs font-display font-bold tracking-wider text-lvl-smoke uppercase"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const isModified = modifiedIds.has(row.id);
                const isSelected = selected.has(row.id);

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-lvl-slate/20 transition-colors",
                      isModified && "bg-lvl-yellow/5",
                      isSelected && "bg-lvl-yellow/10"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.id)}
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-lvl-yellow border-lvl-yellow"
                            : "border-lvl-slate hover:border-lvl-smoke"
                        )}
                        aria-label={`Select ${row.title}`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-lvl-black" />}
                      </button>
                    </td>

                    {/* Thumbnail */}
                    <td className="px-2 py-2">
                      <div className="w-10 h-10 rounded bg-lvl-slate flex items-center justify-center overflow-hidden">
                        {row.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={row.image}
                            alt={row.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-lvl-smoke" />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td
                      className="px-2 py-2"
                      data-cell-id={`cell-${rowIndex}-title`}
                    >
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateCell(row.id, "title", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "title")}
                        onFocus={() => setActiveCell({ rowIndex, field: "title" })}
                        className={INPUT_CLS}
                      />
                    </td>

                    {/* Price */}
                    <td
                      className="px-2 py-2 w-28"
                      data-cell-id={`cell-${rowIndex}-price`}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price}
                        onChange={(e) => updateCell(row.id, "price", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "price")}
                        onFocus={() => setActiveCell({ rowIndex, field: "price" })}
                        className={cn(INPUT_CLS, "text-right")}
                      />
                    </td>

                    {/* Compare At Price */}
                    <td
                      className="px-2 py-2 w-28"
                      data-cell-id={`cell-${rowIndex}-compare_at_price`}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.compare_at_price ?? ""}
                        onChange={(e) => updateCell(row.id, "compare_at_price", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "compare_at_price")}
                        onFocus={() => setActiveCell({ rowIndex, field: "compare_at_price" })}
                        placeholder="--"
                        className={cn(INPUT_CLS, "text-right")}
                      />
                    </td>

                    {/* Inventory */}
                    <td
                      className="px-2 py-2 w-24"
                      data-cell-id={`cell-${rowIndex}-inventory_count`}
                    >
                      <input
                        type="number"
                        min="0"
                        value={row.inventory_count}
                        onChange={(e) => updateCell(row.id, "inventory_count", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "inventory_count")}
                        onFocus={() => setActiveCell({ rowIndex, field: "inventory_count" })}
                        className={cn(INPUT_CLS, "text-center")}
                      />
                    </td>

                    {/* Status */}
                    <td
                      className="px-2 py-2 w-32"
                      data-cell-id={`cell-${rowIndex}-status`}
                    >
                      <select
                        value={row.status}
                        onChange={(e) => updateCell(row.id, "status", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "status")}
                        onFocus={() => setActiveCell({ rowIndex, field: "status" })}
                        className={cn(
                          INPUT_CLS,
                          "cursor-pointer",
                          row.status === "active" && "text-green-400",
                          row.status === "draft" && "text-lvl-yellow",
                          row.status === "archived" && "text-red-400"
                        )}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-lvl-carbon text-lvl-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
