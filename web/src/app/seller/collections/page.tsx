"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Layers,
  Search,
  Trash2,
  Edit,
  X,
  Zap,
  Hand,
  ChevronDown,
  Check,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getSellerProducts } from "@/lib/supabase-data";
import type { Product } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SmartRule {
  readonly id: string;
  readonly field: "tag" | "brand" | "price" | "category" | "status";
  readonly operator: "equals" | "contains" | "greater_than" | "less_than";
  readonly value: string;
}

interface Collection {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly image: string;
  readonly type: "manual" | "smart";
  readonly productIds: readonly string[];
  readonly rules: readonly SmartRule[];
  readonly matchType: "all" | "any";
  readonly createdAt: string;
}

type ModalMode = "create" | "edit" | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "lvl_seller_collections";

function loadCollections(sellerId: string): readonly Collection[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${sellerId}`);
    return raw ? (JSON.parse(raw) as Collection[]) : [];
  } catch {
    return [];
  }
}

function saveCollections(
  sellerId: string,
  collections: readonly Collection[]
): void {
  localStorage.setItem(
    `${STORAGE_KEY}_${sellerId}`,
    JSON.stringify(collections)
  );
}

function generateId(): string {
  return `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function productMatchesRules(
  product: Product,
  rules: readonly SmartRule[],
  matchType: "all" | "any"
): boolean {
  const check = (rule: SmartRule): boolean => {
    switch (rule.field) {
      case "tag":
        if (rule.operator === "equals")
          return product.tags.some(
            (t) => t.toLowerCase() === rule.value.toLowerCase()
          );
        if (rule.operator === "contains")
          return product.tags.some((t) =>
            t.toLowerCase().includes(rule.value.toLowerCase())
          );
        return false;
      case "brand":
        if (rule.operator === "equals")
          return product.brand.toLowerCase() === rule.value.toLowerCase();
        if (rule.operator === "contains")
          return product.brand
            .toLowerCase()
            .includes(rule.value.toLowerCase());
        return false;
      case "price":
        if (rule.operator === "greater_than")
          return product.price > Number(rule.value);
        if (rule.operator === "less_than")
          return product.price < Number(rule.value);
        if (rule.operator === "equals")
          return product.price === Number(rule.value);
        return false;
      case "category":
        if (rule.operator === "equals")
          return product.category_id === rule.value;
        return false;
      case "status":
        if (rule.operator === "equals") return product.status === rule.value;
        return false;
      default:
        return false;
    }
  };

  return matchType === "all" ? rules.every(check) : rules.some(check);
}

function countSmartProducts(
  products: readonly Product[],
  rules: readonly SmartRule[],
  matchType: "all" | "any"
): number {
  if (rules.length === 0) return 0;
  return products.filter((p) => productMatchesRules(p, rules, matchType))
    .length;
}

// ---------------------------------------------------------------------------
// Field / Operator config
// ---------------------------------------------------------------------------

const FIELD_OPTIONS: readonly { value: SmartRule["field"]; label: string }[] = [
  { value: "tag", label: "Tag" },
  { value: "brand", label: "Brand" },
  { value: "price", label: "Price" },
  { value: "category", label: "Category" },
  { value: "status", label: "Status" },
];

const OPERATOR_OPTIONS: readonly {
  value: SmartRule["operator"];
  label: string;
}[] = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SellerCollectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [collections, setCollections] = useState<readonly Collection[]>([]);
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formType, setFormType] = useState<"manual" | "smart">("manual");
  const [formProductIds, setFormProductIds] = useState<readonly string[]>([]);
  const [formRules, setFormRules] = useState<readonly SmartRule[]>([]);
  const [formMatchType, setFormMatchType] = useState<"all" | "any">("all");
  const [productSearch, setProductSearch] = useState("");

  // Load data
  useEffect(() => {
    if (!user) return;
    setCollections(loadCollections(user.id));
    getSellerProducts(user.id).then((data) => setProducts(data));
  }, [user]);

  // Filtered products for manual picker
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title.toLowerCase().includes(q));
  }, [products, productSearch]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormName("");
    setFormDescription("");
    setFormImage("");
    setFormType("manual");
    setFormProductIds([]);
    setFormRules([]);
    setFormMatchType("all");
    setProductSearch("");
    setEditingId(null);
  }, []);

  // Open create modal
  const openCreate = useCallback(() => {
    resetForm();
    setModalMode("create");
  }, [resetForm]);

  // Open edit modal
  const openEdit = useCallback(
    (col: Collection) => {
      resetForm();
      setFormName(col.name);
      setFormDescription(col.description);
      setFormImage(col.image);
      setFormType(col.type);
      setFormProductIds(col.productIds);
      setFormRules(col.rules);
      setFormMatchType(col.matchType);
      setEditingId(col.id);
      setModalMode("edit");
    },
    [resetForm]
  );

  // Close modal
  const closeModal = useCallback(() => {
    setModalMode(null);
    resetForm();
  }, [resetForm]);

  // Save
  const handleSave = useCallback(() => {
    if (!user || !formName.trim()) return;

    const now = new Date().toISOString();

    if (modalMode === "create") {
      const newCollection: Collection = {
        id: generateId(),
        name: formName.trim(),
        description: formDescription.trim(),
        image: formImage.trim(),
        type: formType,
        productIds: formType === "manual" ? formProductIds : [],
        rules: formType === "smart" ? formRules : [],
        matchType: formMatchType,
        createdAt: now,
      };
      const updated = [...collections, newCollection];
      setCollections(updated);
      saveCollections(user.id, updated);
    } else if (modalMode === "edit" && editingId) {
      const updated = collections.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: formName.trim(),
              description: formDescription.trim(),
              image: formImage.trim(),
              type: formType,
              productIds: formType === "manual" ? formProductIds : c.productIds,
              rules: formType === "smart" ? formRules : c.rules,
              matchType: formMatchType,
            }
          : c
      );
      setCollections(updated);
      saveCollections(user.id, updated);
    }

    closeModal();
  }, [
    user,
    formName,
    formDescription,
    formImage,
    formType,
    formProductIds,
    formRules,
    formMatchType,
    modalMode,
    editingId,
    collections,
    closeModal,
  ]);

  // Delete
  const handleDelete = useCallback(
    (id: string) => {
      if (!user) return;
      const updated = collections.filter((c) => c.id !== id);
      setCollections(updated);
      saveCollections(user.id, updated);
      setDeleteConfirm(null);
    },
    [user, collections]
  );

  // Toggle product in manual selection
  const toggleProduct = useCallback(
    (productId: string) => {
      setFormProductIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    },
    []
  );

  // Add smart rule
  const addRule = useCallback(() => {
    const newRule: SmartRule = {
      id: generateId(),
      field: "tag",
      operator: "equals",
      value: "",
    };
    setFormRules((prev) => [...prev, newRule]);
  }, []);

  // Update a rule field
  const updateRule = useCallback(
    (ruleId: string, updates: Partial<SmartRule>) => {
      setFormRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
      );
    },
    []
  );

  // Remove a rule
  const removeRule = useCallback((ruleId: string) => {
    setFormRules((prev) => prev.filter((r) => r.id !== ruleId));
  }, []);

  // Get product count for display
  const getProductCount = useCallback(
    (col: Collection): number => {
      if (col.type === "manual") return col.productIds.length;
      return countSmartProducts(products, col.rules, col.matchType);
    },
    [products]
  );

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <LogIn className="mx-auto h-16 w-16 text-lvl-slate" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-wider">
          SIGN IN TO MANAGE{" "}
          <span className="text-lvl-yellow">COLLECTIONS</span>
        </h1>
        <p className="mt-2 text-lvl-smoke font-body text-sm">
          You need to be logged in to manage your collections.
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/seller/dashboard"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold tracking-wider">
          MY <span className="text-lvl-yellow">COLLECTIONS</span>
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-sm py-2.5 px-5 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* Collections List */}
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers className="w-16 h-16 text-lvl-slate mb-4" />
          <p className="font-display text-lg font-bold tracking-wide mb-1">
            No collections yet
          </p>
          <p className="text-lvl-smoke text-sm font-body">
            Create a collection to group your products together.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-lvl-carbon rounded-xl p-4 flex items-center gap-4"
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0 overflow-hidden">
                {col.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Layers className="w-6 h-6 text-lvl-smoke" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium truncate">
                  {col.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-display font-bold tracking-wider border",
                      col.type === "smart"
                        ? "bg-lvl-yellow/20 text-lvl-yellow border-lvl-yellow/40"
                        : "bg-lvl-slate/50 text-lvl-smoke border-lvl-slate"
                    )}
                  >
                    {col.type === "smart" ? (
                      <Zap className="w-3 h-3" />
                    ) : (
                      <Hand className="w-3 h-3" />
                    )}
                    {col.type === "smart" ? "Smart" : "Manual"}
                  </span>
                  <span className="text-lvl-smoke text-xs font-body">
                    {getProductCount(col)} products
                  </span>
                  <span className="text-lvl-smoke/60 text-xs font-body">
                    {new Date(col.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(col)}
                  className="w-9 h-9 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-lvl-yellow/20 transition-colors"
                  aria-label={`Edit ${col.name}`}
                >
                  <Edit className="w-4 h-4 text-lvl-smoke" />
                </button>
                {deleteConfirm === col.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(col.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-display font-bold hover:bg-red-500/30 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg bg-lvl-slate text-lvl-smoke text-xs font-display font-bold hover:bg-lvl-slate/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(col.id)}
                    className="w-9 h-9 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    aria-label={`Delete ${col.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-lvl-smoke" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative bg-lvl-carbon border border-lvl-slate/30 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-lvl-carbon border-b border-lvl-slate/30 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="font-display text-xl font-bold tracking-wider">
                {modalMode === "create" ? "CREATE" : "EDIT"}{" "}
                <span className="text-lvl-yellow">COLLECTION</span>
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-lvl-slate flex items-center justify-center hover:bg-lvl-slate/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-lvl-smoke" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Summer Essentials"
                  className="w-full bg-lvl-black border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe this collection..."
                  className="w-full bg-lvl-black border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
                  Collection Image URL
                </label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-lvl-black border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors"
                />
              </div>

              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
                  Collection Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("manual")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-display font-bold tracking-wider border transition-colors",
                      formType === "manual"
                        ? "bg-lvl-yellow/10 text-lvl-yellow border-lvl-yellow/40"
                        : "bg-lvl-black text-lvl-smoke border-lvl-slate hover:border-lvl-smoke"
                    )}
                  >
                    <Hand className="w-4 h-4" />
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("smart")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-display font-bold tracking-wider border transition-colors",
                      formType === "smart"
                        ? "bg-lvl-yellow/10 text-lvl-yellow border-lvl-yellow/40"
                        : "bg-lvl-black text-lvl-smoke border-lvl-slate hover:border-lvl-smoke"
                    )}
                  >
                    <Zap className="w-4 h-4" />
                    Smart (Auto)
                  </button>
                </div>
              </div>

              {/* Manual: Product Picker */}
              {formType === "manual" && (
                <div>
                  <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
                    Select Products ({formProductIds.length} selected)
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-lvl-black border border-lvl-slate rounded-lg py-2.5 pl-10 pr-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-lvl-slate rounded-lg divide-y divide-lvl-slate/40">
                    {filteredProducts.length === 0 ? (
                      <p className="py-4 text-center text-lvl-smoke text-xs font-body">
                        No products found
                      </p>
                    ) : (
                      filteredProducts.map((product) => {
                        const selected = formProductIds.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleProduct(product.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-lvl-slate/30 transition-colors",
                              selected && "bg-lvl-yellow/5"
                            )}
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                selected
                                  ? "bg-lvl-yellow border-lvl-yellow"
                                  : "border-lvl-slate"
                              )}
                            >
                              {selected && (
                                <Check className="w-3 h-3 text-lvl-black" />
                              )}
                            </div>
                            <span className="text-sm font-body text-lvl-white truncate">
                              {product.title}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Smart: Rule Builder */}
              {formType === "smart" && (
                <div>
                  <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
                    Conditions
                  </label>

                  {/* Match type */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs font-body text-lvl-smoke">
                      Match:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="matchType"
                        checked={formMatchType === "all"}
                        onChange={() => setFormMatchType("all")}
                        className="accent-lvl-yellow"
                      />
                      <span className="text-sm font-body text-lvl-white">
                        All conditions
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="matchType"
                        checked={formMatchType === "any"}
                        onChange={() => setFormMatchType("any")}
                        className="accent-lvl-yellow"
                      />
                      <span className="text-sm font-body text-lvl-white">
                        Any condition
                      </span>
                    </label>
                  </div>

                  {/* Rules */}
                  <div className="space-y-2 mb-3">
                    {formRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center gap-2 bg-lvl-black border border-lvl-slate rounded-lg p-2"
                      >
                        <select
                          value={rule.field}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              field: e.target.value as SmartRule["field"],
                            })
                          }
                          className="bg-lvl-carbon border border-lvl-slate rounded-md px-2 py-1.5 text-sm font-body text-lvl-white focus:outline-none focus:border-lvl-yellow"
                        >
                          {FIELD_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              operator:
                                e.target.value as SmartRule["operator"],
                            })
                          }
                          className="bg-lvl-carbon border border-lvl-slate rounded-md px-2 py-1.5 text-sm font-body text-lvl-white focus:outline-none focus:border-lvl-yellow"
                        >
                          {OPERATOR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(rule.id, { value: e.target.value })
                          }
                          placeholder="Value"
                          className="flex-1 bg-lvl-carbon border border-lvl-slate rounded-md px-2 py-1.5 text-sm font-body text-lvl-white placeholder:text-lvl-smoke/50 focus:outline-none focus:border-lvl-yellow min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeRule(rule.id)}
                          className="w-7 h-7 rounded-md bg-lvl-slate flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0"
                          aria-label="Remove rule"
                        >
                          <X className="w-3.5 h-3.5 text-lvl-smoke" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addRule}
                    className="flex items-center gap-1.5 text-sm font-body text-lvl-yellow hover:text-lvl-yellow/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add condition
                  </button>

                  {/* Smart preview count */}
                  {formRules.length > 0 && (
                    <p className="mt-3 text-xs font-body text-lvl-smoke">
                      Preview:{" "}
                      <span className="text-lvl-yellow font-bold">
                        {countSmartProducts(
                          products as Product[],
                          formRules,
                          formMatchType
                        )}
                      </span>{" "}
                      products match
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-lvl-carbon border-t border-lvl-slate/30 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg text-sm font-display font-bold tracking-wider text-lvl-smoke hover:text-lvl-white bg-lvl-slate hover:bg-lvl-slate/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formName.trim()}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-display font-bold tracking-wider transition-colors",
                  formName.trim()
                    ? "bg-lvl-yellow text-lvl-black hover:opacity-90"
                    : "bg-lvl-slate text-lvl-smoke cursor-not-allowed"
                )}
              >
                {modalMode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
