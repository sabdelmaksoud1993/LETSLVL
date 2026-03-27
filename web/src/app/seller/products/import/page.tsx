"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Check,
  Loader2,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSellerProducts, createProduct, getCategories } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import type { Category } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedRow {
  readonly title: string;
  readonly description: string;
  readonly brand: string;
  readonly price: string;
  readonly compare_at_price: string;
  readonly currency: string;
  readonly category: string;
  readonly sizes: string;
  readonly colors: string;
  readonly tags: string;
  readonly inventory_count: string;
  readonly status: string;
  readonly images: string;
}

interface ValidatedRow {
  readonly data: ParsedRow;
  readonly errors: readonly string[];
  readonly rowIndex: number;
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

const CSV_HEADERS = [
  "title",
  "description",
  "brand",
  "price",
  "compare_at_price",
  "currency",
  "category",
  "sizes",
  "colors",
  "tags",
  "inventory_count",
  "status",
  "images",
] as const;

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateRow(row: ParsedRow, index: number): ValidatedRow {
  const errors: string[] = [];

  if (!row.title.trim()) {
    errors.push("Title is required");
  }

  const price = Number(row.price);
  if (!row.price || isNaN(price) || price <= 0) {
    errors.push("Valid price is required");
  }

  if (
    row.status &&
    !["active", "draft"].includes(row.status.toLowerCase().trim())
  ) {
    errors.push("Status must be active or draft");
  }

  if (row.currency && !["AED", "SAR", "KWD"].includes(row.currency.toUpperCase().trim())) {
    errors.push("Currency must be AED, SAR, or KWD");
  }

  return { data: row, errors, rowIndex: index };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMPLATE_CSV = `title,description,brand,price,compare_at_price,currency,category,sizes,colors,tags,inventory_count,status,images
"Vintage Nike Air Jordan 1","Authentic Air Jordan 1 in excellent condition","Nike",850,,AED,Sneakers,"40;41;42;43","White;Red","sneakers;jordan;vintage",5,draft,
"Fear of God Essentials Hoodie","Premium cotton hoodie, oversized fit","Fear of God",450,600,AED,Hoodies,"S;M;L;XL","Black;Grey","hoodie;streetwear;essentials",10,draft,`;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ImportExportPage() {
  const { user, loading: authLoading } = useAuth();

  // Export state
  const [exporting, setExporting] = useState(false);

  // Import state
  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<readonly ValidatedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories for mapping
  const [categories, setCategories] = useState<Category[]>([]);

  // ---- load categories on first need ----------------------------------------

  const loadCategoriesIfNeeded = useCallback(async () => {
    if (categories.length === 0) {
      const cats = await getCategories();
      setCategories(cats);
      return cats;
    }
    return categories;
  }, [categories]);

  // ---- Export ----------------------------------------------------------------

  const handleExport = useCallback(async () => {
    if (!user) return;
    setExporting(true);

    try {
      const cats = await loadCategoriesIfNeeded();
      const products = await getSellerProducts(user.id);

      const categoryMap = new Map(cats.map((c) => [c.id, c.name]));

      const lines = [CSV_HEADERS.join(",")];

      for (const p of products) {
        const row = [
          escapeCSV(p.title),
          escapeCSV(p.description),
          escapeCSV(p.brand),
          String(p.price),
          p.compare_at_price !== null ? String(p.compare_at_price) : "",
          p.currency,
          escapeCSV(categoryMap.get(p.category_id) || ""),
          escapeCSV(p.sizes.join(";")),
          escapeCSV(p.colors.join(";")),
          escapeCSV(p.tags.join(";")),
          String(p.inventory_count),
          p.status,
          escapeCSV(p.images.join(";")),
        ];
        lines.push(row.join(","));
      }

      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lvl-products-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [user, loadCategoriesIfNeeded]);

  // ---- Download template ----------------------------------------------------

  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([TEMPLATE_CSV], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lvl-products-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // ---- Parse CSV ------------------------------------------------------------

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

      if (lines.length < 2) {
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);

      const rows: ValidatedRow[] = dataLines.map((line, i) => {
        const fields = parseCSVLine(line);

        const row: ParsedRow = {
          title: fields[0] || "",
          description: fields[1] || "",
          brand: fields[2] || "",
          price: fields[3] || "",
          compare_at_price: fields[4] || "",
          currency: fields[5] || "AED",
          category: fields[6] || "",
          sizes: fields[7] || "",
          colors: fields[8] || "",
          tags: fields[9] || "",
          inventory_count: fields[10] || "0",
          status: fields[11] || "draft",
          images: fields[12] || "",
        };

        return validateRow(row, i + 2); // +2 for 1-indexed + header
      });

      setParsedRows(rows);
      setImportResult(null);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  // ---- Import ---------------------------------------------------------------

  const validRows = useMemo(
    () => parsedRows.filter((r) => r.errors.length === 0),
    [parsedRows]
  );

  const handleImport = useCallback(async () => {
    if (!user || validRows.length === 0) return;

    setImporting(true);
    setImportProgress(0);
    setImportResult(null);

    const cats = await loadCategoriesIfNeeded();
    const categoryMap = new Map(
      cats.map((c) => [c.name.toLowerCase(), c.id])
    );

    let success = 0;
    let failed = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i].data;

      try {
        const catId = categoryMap.get(row.category.toLowerCase().trim()) || "";

        await createProduct({
          title: row.title.trim(),
          slug: generateSlug(row.title),
          description: row.description.trim(),
          brand: row.brand.trim(),
          price: Number(row.price),
          compare_at_price: row.compare_at_price
            ? Number(row.compare_at_price)
            : null,
          currency: row.currency.toUpperCase().trim() || "AED",
          category_id: catId,
          images: row.images
            ? row.images.split(";").filter((s) => s.trim() !== "")
            : [],
          sizes: row.sizes
            ? row.sizes.split(";").filter((s) => s.trim() !== "")
            : [],
          colors: row.colors
            ? row.colors.split(";").filter((s) => s.trim() !== "")
            : [],
          tags: row.tags
            ? row.tags.split(";").filter((s) => s.trim() !== "")
            : [],
          inventory_count: Number(row.inventory_count) || 0,
          status:
            row.status.toLowerCase().trim() === "active" ? "active" : "draft",
          is_live_exclusive: false,
          is_featured: false,
          seller_id: user.id,
        });
        success++;
      } catch (err) {
        console.error(`Failed to import row ${validRows[i].rowIndex}:`, err);
        failed++;
      }

      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportResult({ success, failed });
    setImporting(false);
  }, [user, validRows, loadCategoriesIfNeeded]);

  // ---- Auth gate ------------------------------------------------------------

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <LogIn className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-wider">
          SIGN IN TO <span className="text-lvl-yellow">IMPORT/EXPORT</span>
        </h1>
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
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Heading */}
      <h1 className="font-display text-3xl font-bold tracking-wider mb-8">
        IMPORT / <span className="text-lvl-yellow">EXPORT</span>
      </h1>

      {/* ── Export Section ──────────────────────────────────────────────── */}
      <section className="bg-lvl-carbon rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-lvl-yellow" />
          <h2 className="font-display text-lg font-bold tracking-wider">
            EXPORT PRODUCTS
          </h2>
        </div>
        <p className="text-sm font-body text-lvl-smoke mb-4">
          Download all your products as a CSV file. You can edit the file and
          re-import it later.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 py-3 px-6 rounded-lg font-display font-bold text-sm tracking-widest uppercase bg-lvl-yellow text-lvl-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              EXPORTING...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              EXPORT ALL PRODUCTS
            </>
          )}
        </button>
      </section>

      {/* ── Import Section ──────────────────────────────────────────────── */}
      <section className="bg-lvl-carbon rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-lvl-yellow" />
          <h2 className="font-display text-lg font-bold tracking-wider">
            IMPORT PRODUCTS
          </h2>
        </div>

        <p className="text-sm font-body text-lvl-smoke mb-4">
          Upload a CSV file to bulk-import products. Use semicolons (;) to
          separate multiple values in sizes, colors, tags, and images columns.
        </p>

        {/* Template download */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-lvl-yellow text-sm font-body hover:underline mb-4"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download CSV Template
        </button>

        {/* Drop zone */}
        {parsedRows.length === 0 && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 cursor-pointer transition-colors",
              dragOver
                ? "border-lvl-yellow bg-lvl-yellow/10"
                : "border-lvl-slate/50 bg-lvl-slate/30 hover:border-lvl-smoke"
            )}
          >
            <Upload className="w-8 h-8 text-lvl-smoke" />
            <div className="text-center">
              <p className="text-sm font-body text-lvl-white">
                Drop a CSV file here or{" "}
                <span className="text-lvl-yellow">browse</span>
              </p>
              <p className="text-xs font-body text-lvl-smoke mt-1">
                .csv files only
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Preview table */}
        {parsedRows.length > 0 && !importResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-body text-lvl-smoke">
                {parsedRows.length} rows parsed &middot;{" "}
                <span className="text-green-400">{validRows.length} valid</span>{" "}
                &middot;{" "}
                <span className="text-red-400">
                  {parsedRows.length - validRows.length} errors
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs font-body text-lvl-smoke hover:text-lvl-white"
              >
                Clear
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-lvl-slate/50">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="bg-lvl-slate/50">
                    <th className="text-left text-lvl-smoke px-3 py-2 font-bold">
                      Row
                    </th>
                    <th className="text-left text-lvl-smoke px-3 py-2 font-bold">
                      Title
                    </th>
                    <th className="text-left text-lvl-smoke px-3 py-2 font-bold">
                      Brand
                    </th>
                    <th className="text-left text-lvl-smoke px-3 py-2 font-bold">
                      Price
                    </th>
                    <th className="text-left text-lvl-smoke px-3 py-2 font-bold">
                      Status
                    </th>
                    <th className="text-left text-lvl-smoke px-3 py-2 font-bold">
                      Issues
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={cn(
                        "border-t border-lvl-slate/30",
                        row.errors.length > 0
                          ? "bg-red-500/10"
                          : "hover:bg-lvl-slate/20"
                      )}
                    >
                      <td className="px-3 py-2 text-lvl-smoke">
                        {row.rowIndex}
                      </td>
                      <td className="px-3 py-2 text-lvl-white truncate max-w-[200px]">
                        {row.data.title || "—"}
                      </td>
                      <td className="px-3 py-2 text-lvl-smoke">
                        {row.data.brand || "—"}
                      </td>
                      <td className="px-3 py-2 text-lvl-yellow">
                        {row.data.price || "—"}
                      </td>
                      <td className="px-3 py-2 text-lvl-smoke">
                        {row.data.status || "draft"}
                      </td>
                      <td className="px-3 py-2">
                        {row.errors.length > 0 ? (
                          <div className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{row.errors.join(", ")}</span>
                          </div>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progress bar */}
            {importing && (
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-lvl-slate overflow-hidden">
                  <div
                    className="h-full bg-lvl-yellow rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-xs font-body text-lvl-smoke text-center">
                  Importing... {importProgress}%
                </p>
              </div>
            )}

            {/* Import button */}
            {!importing && (
              <button
                type="button"
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="flex items-center gap-2 py-3 px-6 rounded-lg font-display font-bold text-sm tracking-widest uppercase bg-lvl-yellow text-lvl-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                IMPORT {validRows.length} PRODUCTS
              </button>
            )}
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <div className="rounded-lg border border-lvl-slate/50 bg-lvl-slate/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-sm font-display font-bold tracking-wider text-lvl-white">
                IMPORT COMPLETE
              </span>
            </div>
            <p className="text-sm font-body text-lvl-smoke">
              <span className="text-green-400 font-bold">
                {importResult.success}
              </span>{" "}
              products imported successfully
              {importResult.failed > 0 && (
                <>
                  {" "}
                  &middot;{" "}
                  <span className="text-red-400 font-bold">
                    {importResult.failed}
                  </span>{" "}
                  failed
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Link
                href="/seller/products"
                className="py-2 px-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase bg-lvl-yellow text-lvl-black hover:opacity-90 transition-opacity"
              >
                VIEW PRODUCTS
              </Link>
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setImportResult(null);
                  setImportProgress(0);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="py-2 px-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase border border-lvl-slate text-lvl-smoke hover:text-lvl-white transition-colors"
              >
                IMPORT MORE
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
