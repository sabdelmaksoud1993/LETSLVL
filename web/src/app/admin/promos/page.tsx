"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Search,
  Tag,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  X,
  Percent,
  DollarSign,
  Calendar,
  ShoppingBag,
  Radio,
} from "lucide-react";

interface PromoCode {
  readonly id: string;
  readonly code: string;
  readonly description: string;
  readonly discount_type: "percentage" | "fixed";
  readonly discount_value: number;
  readonly min_order_amount: number;
  readonly max_uses: number | null;
  readonly used_count: number;
  readonly applies_to: "all" | "products" | "auctions";
  readonly is_active: boolean;
  readonly starts_at: string;
  readonly expires_at: string | null;
  readonly created_at: string;
}

type DiscountType = "percentage" | "fixed";
type AppliesTo = "all" | "products" | "auctions";

interface PromoForm {
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  applies_to: AppliesTo;
  expires_at: string;
}

const EMPTY_FORM: PromoForm = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  max_uses: null,
  applies_to: "all",
  expires_at: "",
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos((data as PromoCode[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const filtered = promos.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.code.trim() || form.discount_value <= 0) return;
    setSaving(true);
    const { error } = await supabase.from("promo_codes").insert({
      code: form.code.toUpperCase().replace(/\s/g, ""),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount,
      max_uses: form.max_uses,
      applies_to: form.applies_to,
      expires_at: form.expires_at || null,
    });
    setSaving(false);
    if (!error) {
      setShowCreate(false);
      setForm(EMPTY_FORM);
      fetchPromos();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !isActive }).eq("id", id);
    fetchPromos();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    fetchPromos();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
            Promo Codes
          </h1>
          <p className="font-body text-sm text-lvl-smoke mt-1">
            Create and manage discount codes for customers.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-lvl-yellow text-lvl-black px-5 py-2.5 rounded-lg font-display uppercase tracking-wider text-sm font-bold hover:bg-lvl-yellow/90 transition"
        >
          <Plus size={18} />
          Create Code
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lvl-smoke" />
        <input
          type="text"
          placeholder="Search codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-lvl-carbon border border-lvl-slate/30 rounded-lg pl-10 pr-4 py-2.5 text-sm font-body text-lvl-white placeholder:text-lvl-smoke/50 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-4">
          <p className="font-body text-xs text-lvl-smoke">Total Codes</p>
          <p className="font-display text-2xl font-bold text-lvl-white">{promos.length}</p>
        </div>
        <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-4">
          <p className="font-body text-xs text-lvl-smoke">Active</p>
          <p className="font-display text-2xl font-bold text-green-400">
            {promos.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-4">
          <p className="font-body text-xs text-lvl-smoke">Total Uses</p>
          <p className="font-display text-2xl font-bold text-lvl-yellow">
            {promos.reduce((sum, p) => sum + p.used_count, 0)}
          </p>
        </div>
        <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-4">
          <p className="font-body text-xs text-lvl-smoke">Expired</p>
          <p className="font-display text-2xl font-bold text-lvl-smoke">
            {promos.filter((p) => p.expires_at && new Date(p.expires_at) < new Date()).length}
          </p>
        </div>
      </div>

      {/* Promo List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-lvl-carbon rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-12 text-center">
          <Tag size={40} className="mx-auto text-lvl-slate mb-3" />
          <p className="font-display text-lg font-bold text-lvl-white">No promo codes yet</p>
          <p className="font-body text-sm text-lvl-smoke mt-1">
            Create your first promo code to offer discounts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((promo) => {
            const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
            const isMaxed = promo.max_uses !== null && promo.used_count >= promo.max_uses;
            return (
              <div
                key={promo.id}
                className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display text-lg font-bold text-lvl-white tracking-wider">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="text-lvl-smoke hover:text-lvl-white transition"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === promo.code && (
                        <span className="text-xs text-green-400 font-body">Copied!</span>
                      )}
                      {/* Status badges */}
                      {promo.is_active && !isExpired && !isMaxed ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-body">
                          Active
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-body">
                          Expired
                        </span>
                      ) : isMaxed ? (
                        <span className="px-2 py-0.5 rounded-full bg-lvl-slate text-lvl-smoke text-xs font-body">
                          Max Used
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-lvl-slate text-lvl-smoke text-xs font-body">
                          Inactive
                        </span>
                      )}
                      {/* Applies to badge */}
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lvl-slate/50 text-lvl-smoke text-xs font-body">
                        {promo.applies_to === "auctions" ? (
                          <><Radio size={10} /> Auctions</>
                        ) : promo.applies_to === "products" ? (
                          <><ShoppingBag size={10} /> Products</>
                        ) : (
                          "All"
                        )}
                      </span>
                    </div>
                    {promo.description && (
                      <p className="font-body text-sm text-lvl-smoke">{promo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 font-body text-xs text-lvl-smoke">
                      <span className="flex items-center gap-1">
                        {promo.discount_type === "percentage" ? (
                          <><Percent size={12} /> {promo.discount_value}% off</>
                        ) : (
                          <><DollarSign size={12} /> {formatPrice(promo.discount_value)} off</>
                        )}
                      </span>
                      {promo.min_order_amount > 0 && (
                        <span>Min order: {formatPrice(promo.min_order_amount)}</span>
                      )}
                      <span>
                        Used: {promo.used_count}
                        {promo.max_uses !== null ? ` / ${promo.max_uses}` : ""}
                      </span>
                      {promo.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Expires: {new Date(promo.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(promo.id, promo.is_active)}
                      className="p-2 rounded-lg hover:bg-lvl-slate/50 transition text-lvl-smoke hover:text-lvl-white"
                      title={promo.is_active ? "Deactivate" : "Activate"}
                    >
                      {promo.is_active ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => deletePromo(promo.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition text-lvl-smoke hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-lvl-carbon rounded-2xl border border-lvl-slate/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-lvl-slate/20">
              <h2 className="font-display text-xl font-bold text-lvl-white">
                Create Promo Code
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 rounded-lg hover:bg-lvl-slate/50 text-lvl-smoke"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="font-body text-sm text-lvl-smoke mb-1 block">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LVL20, SUMMER25"
                  className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-display tracking-wider text-lvl-white uppercase placeholder:text-lvl-smoke/40 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-body text-sm text-lvl-smoke mb-1 block">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Summer sale 20% off"
                  className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white placeholder:text-lvl-smoke/40 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                />
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-sm text-lvl-smoke mb-1 block">Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })
                    }
                    className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-sm text-lvl-smoke mb-1 block">
                    {form.discount_type === "percentage" ? "Discount %" : "Amount (AED)"}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    min={0}
                    max={form.discount_type === "percentage" ? 100 : 10000}
                    className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                  />
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label className="font-body text-sm text-lvl-smoke mb-1 block">
                  Applies To
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["all", "products", "auctions"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, applies_to: type })}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-body capitalize transition ${
                        form.applies_to === type
                          ? "bg-lvl-yellow/10 border-lvl-yellow text-lvl-yellow"
                          : "bg-lvl-black border-lvl-slate/30 text-lvl-smoke hover:border-lvl-slate"
                      }`}
                    >
                      {type === "all" ? "All Sales" : type === "products" ? "Products Only" : "Auctions Only"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Order + Max Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-sm text-lvl-smoke mb-1 block">
                    Min Order (AED)
                  </label>
                  <input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                    min={0}
                    className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-lvl-smoke mb-1 block">
                    Max Uses (blank = unlimited)
                  </label>
                  <input
                    type="number"
                    value={form.max_uses ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })
                    }
                    min={1}
                    placeholder="Unlimited"
                    className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white placeholder:text-lvl-smoke/40 focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="font-body text-sm text-lvl-smoke mb-1 block">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white focus:outline-none focus:ring-1 focus:ring-lvl-yellow"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-lvl-slate/20">
              <button
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 rounded-lg border border-lvl-slate text-lvl-smoke font-body text-sm hover:text-lvl-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.code.trim() || form.discount_value <= 0}
                className="px-6 py-2.5 rounded-lg bg-lvl-yellow text-lvl-black font-display uppercase tracking-wider text-sm font-bold hover:bg-lvl-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? "Creating..." : "Create Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
