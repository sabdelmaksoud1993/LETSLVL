"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  User,
  Store,
  Clock,
  CheckCircle,
  Search as SearchIcon,
  UserCheck,
  ShoppingBag,
  RefreshCw,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Dispute {
  readonly id: string;
  readonly orderNumber: string;
  readonly buyerName: string;
  readonly sellerName: string;
  readonly reason: string;
  readonly description: string;
  readonly status: "open" | "in_review" | "resolved";
  readonly priority: "high" | "medium" | "low";
  readonly createdAt: string;
  readonly assignedTo: string | null;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_DISPUTES: readonly Dispute[] = [
  {
    id: "disp-001",
    orderNumber: "ORD-20260312-001",
    buyerName: "Fatima Al-Rashid",
    sellerName: "Urban Streetwear Co",
    reason: "Item not as described",
    description:
      "Received a size L instead of the size M that was ordered. The listing clearly showed size M. Requesting full refund or exchange.",
    status: "open",
    priority: "high",
    createdAt: "2026-03-25T14:30:00Z",
    assignedTo: null,
  },
  {
    id: "disp-002",
    orderNumber: "ORD-20260310-042",
    buyerName: "Ahmed Hassan",
    sellerName: "Luxury Kicks Dubai",
    reason: "Suspected counterfeit",
    description:
      "The sneakers received do not match the authenticated images. Stitching quality is poor and the box label appears inconsistent with the brand.",
    status: "in_review",
    priority: "high",
    createdAt: "2026-03-23T09:15:00Z",
    assignedTo: "Support Team A",
  },
  {
    id: "disp-003",
    orderNumber: "ORD-20260308-018",
    buyerName: "Sara Mahmoud",
    sellerName: "GCC Cards Trading",
    reason: "Item damaged in transit",
    description:
      "Trading card arrived with a bent corner. The card was not properly protected in the packaging. Value significantly reduced.",
    status: "open",
    priority: "medium",
    createdAt: "2026-03-22T16:45:00Z",
    assignedTo: null,
  },
  {
    id: "disp-004",
    orderNumber: "ORD-20260305-007",
    buyerName: "Khalid Al-Naimi",
    sellerName: "Retro Fashion Hub",
    reason: "Order never received",
    description:
      "Package shows as delivered but buyer never received it. Building security confirmed no delivery was made.",
    status: "in_review",
    priority: "medium",
    createdAt: "2026-03-20T11:00:00Z",
    assignedTo: "Support Team B",
  },
  {
    id: "disp-005",
    orderNumber: "ORD-20260301-033",
    buyerName: "Layla Qasim",
    sellerName: "Vintage Vault ME",
    reason: "Late delivery",
    description:
      "Order was supposed to arrive within 3 days but arrived after 12 days. Buyer wants partial refund for the inconvenience.",
    status: "resolved",
    priority: "low",
    createdAt: "2026-03-15T08:20:00Z",
    assignedTo: "Support Team A",
  },
];

/* ------------------------------------------------------------------ */
/*  Priority Badge                                                     */
/* ------------------------------------------------------------------ */

function PriorityBadge({ priority }: { readonly priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-500/20 text-red-400 border border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    low: "bg-lvl-slate/50 text-lvl-smoke border border-lvl-slate/50",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-body font-bold rounded-full uppercase ${styles[priority] ?? styles.low}`}
    >
      {priority}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function DisputeStatusBadge({ status }: { readonly status: string }) {
  const styles: Record<string, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
    open: { bg: "bg-blue-500/20 text-blue-400", icon: AlertTriangle },
    in_review: { bg: "bg-yellow-500/20 text-yellow-400", icon: Clock },
    resolved: { bg: "bg-green-500/20 text-green-400", icon: CheckCircle },
  };

  const config = styles[status] ?? styles.open;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-bold rounded-full uppercase ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      {status.replace("_", " ")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<readonly Dispute[]>(INITIAL_DISPUTES);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDisputes =
    statusFilter === "all"
      ? disputes
      : disputes.filter((d) => d.status === statusFilter);

  const openCount = disputes.filter((d) => d.status === "open").length;
  const reviewCount = disputes.filter((d) => d.status === "in_review").length;

  const handleAssign = useCallback((disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: "in_review" as const, assignedTo: "Support Team A" }
          : d
      )
    );
  }, []);

  const handleResolveBuyer = useCallback((disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId ? { ...d, status: "resolved" as const } : d
      )
    );
  }, []);

  const handleResolveSeller = useCallback((disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId ? { ...d, status: "resolved" as const } : d
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
          Dispute Resolution
        </h1>
        <p className="font-body text-sm text-lvl-smoke mt-1">
          {openCount} open &middot; {reviewCount} in review &middot;{" "}
          {disputes.length} total
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-lvl-carbon rounded-lg p-1 w-fit">
        {[
          { key: "all", label: "All" },
          { key: "open", label: "Open" },
          { key: "in_review", label: "In Review" },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-1.5 text-sm font-body font-medium rounded-md transition-colors ${
              statusFilter === tab.key
                ? "bg-lvl-yellow text-lvl-black"
                : "text-lvl-smoke hover:text-lvl-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dispute Cards */}
      {filteredDisputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle className="w-12 h-12 text-green-500/50 mb-4" />
          <p className="font-body text-lvl-smoke">
            No disputes in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className={`bg-lvl-carbon rounded-xl border p-5 transition-colors ${
                dispute.priority === "high"
                  ? "border-red-500/30"
                  : dispute.priority === "medium"
                    ? "border-yellow-500/20"
                    : "border-lvl-slate/30"
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-body text-sm text-lvl-yellow font-medium">
                    {dispute.orderNumber}
                  </span>
                  <DisputeStatusBadge status={dispute.status} />
                  <PriorityBadge priority={dispute.priority} />
                </div>
                <span className="font-body text-xs text-lvl-smoke">
                  {new Date(dispute.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Parties */}
              <div className="flex flex-wrap gap-6 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-body text-lvl-smoke">Buyer</p>
                    <p className="text-sm font-body text-lvl-white font-medium">
                      {dispute.buyerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs font-body text-lvl-smoke">Seller</p>
                    <p className="text-sm font-body text-lvl-white font-medium">
                      {dispute.sellerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-3">
                <p className="text-xs font-body text-lvl-smoke uppercase tracking-wider mb-1">
                  Reason
                </p>
                <p className="text-sm font-body text-lvl-white font-medium">
                  {dispute.reason}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm font-body text-lvl-smoke mb-4 leading-relaxed">
                {dispute.description}
              </p>

              {/* Assigned */}
              {dispute.assignedTo && (
                <p className="text-xs font-body text-lvl-smoke mb-4">
                  Assigned to:{" "}
                  <span className="text-lvl-white">{dispute.assignedTo}</span>
                </p>
              )}

              {/* Actions */}
              {dispute.status !== "resolved" && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-lvl-slate/20">
                  {dispute.status === "open" && (
                    <button
                      onClick={() => handleAssign(dispute.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-body font-bold rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Assign to Team
                    </button>
                  )}
                  <button
                    onClick={() => handleResolveBuyer(dispute.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-body font-bold rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Resolve (Buyer)
                  </button>
                  <button
                    onClick={() => handleResolveSeller(dispute.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 text-xs font-body font-bold rounded-lg hover:bg-purple-500/20 transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Resolve (Seller)
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lvl-yellow/10 text-lvl-yellow text-xs font-body font-bold rounded-lg hover:bg-lvl-yellow/20 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Issue Refund
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
