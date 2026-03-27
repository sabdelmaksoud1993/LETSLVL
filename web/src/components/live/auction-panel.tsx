"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Gavel, ShoppingBag, Loader2 } from "lucide-react";
import { cn, formatPrice, formatTimeRemaining } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeToBids,
  subscribeToAuction,
  fetchRecentBids,
  placeBid,
} from "@/lib/realtime";
import type { Auction, Bid } from "@/types/database";

interface AuctionPanelProps {
  auction: Auction;
}

function AuctionPanel({ auction }: AuctionPanelProps) {
  const { user } = useAuth();
  const [currentBid, setCurrentBid] = useState(auction.current_bid);
  const [bidCount, setBidCount] = useState(auction.bid_count);
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(auction.end_time),
  );
  const [endTime, setEndTime] = useState(auction.end_time);
  const [isUrgent, setIsUrgent] = useState(false);
  const [bidFlash, setBidFlash] = useState(false);
  const [recentBids, setRecentBids] = useState<readonly Bid[]>([]);
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const nextBidAmount = currentBid + auction.bid_increment;
  const buyNowPrice = auction.product.compare_at_price;

  // Load initial bids and subscribe to realtime updates
  useEffect(() => {
    let unsubBids: (() => void) | null = null;
    let unsubAuction: (() => void) | null = null;

    async function init() {
      const bids = await fetchRecentBids(auction.id);
      setRecentBids(bids.slice(0, 3));

      // Subscribe to new bids
      unsubBids = subscribeToBids(auction.id, (newBid) => {
        setRecentBids((prev) => {
          const updated = [
            newBid,
            ...prev.map((b) => ({ ...b, status: "outbid" as const })),
          ].slice(0, 3);
          return updated;
        });
        setCurrentBid(newBid.amount);
        setBidCount((prev) => prev + 1);
        setBidFlash(true);
        setTimeout(() => setBidFlash(false), 500);
      });

      // Subscribe to auction updates
      unsubAuction = subscribeToAuction(auction.id, (update) => {
        if (update.current_bid !== undefined) {
          setCurrentBid(update.current_bid);
        }
        if (update.bid_count !== undefined) {
          setBidCount(update.bid_count);
        }
        if (update.end_time !== undefined) {
          setEndTime(update.end_time);
        }
      });
    }

    init();

    return () => {
      if (unsubBids) unsubBids();
      if (unsubAuction) unsubAuction();
    };
  }, [auction.id]);

  // Countdown timer synced with server end_time
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      setTimeRemaining(formatTimeRemaining(endTime));
      setIsUrgent(diff > 0 && diff < 30000);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const handleBid = useCallback(async () => {
    if (!user) return;

    setBidding(true);
    setBidError(null);

    const result = await placeBid(auction.id, user.id, nextBidAmount);

    if (!result.success) {
      setBidError(result.error ?? "Failed to place bid.");
    }

    setBidding(false);
  }, [auction.id, user, nextBidAmount]);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-lvl-carbon/95 backdrop-blur-lg rounded-t-2xl border-t border-lvl-slate/50">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
        {/* Product info row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
            <Image
              src={auction.product.images[0] ?? ""}
              alt={auction.product.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white line-clamp-1 font-body">
              {auction.product.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-lvl-smoke font-body">
                {bidCount} bids
              </span>
              <span className="text-lvl-smoke">-</span>
              <span
                className={cn(
                  "text-xs font-bold font-body",
                  isUrgent
                    ? "text-lvl-error animate-live-pulse"
                    : "text-lvl-smoke",
                )}
              >
                {timeRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Current bid */}
        <div
          className={cn(
            "text-center py-2 rounded-xl mb-3 transition-colors",
            bidFlash && "animate-bid-flash",
          )}
        >
          <p className="text-xs text-lvl-smoke uppercase tracking-wider font-body">
            Current Bid
          </p>
          <p className="text-3xl font-display font-bold text-lvl-yellow mt-0.5">
            {formatPrice(currentBid, auction.currency)}
          </p>
        </div>

        {/* Bid history */}
        <div className="space-y-1.5 mb-4">
          {recentBids.slice(0, 3).map((bid) => (
            <div
              key={bid.id}
              className="flex items-center justify-between text-xs px-2"
            >
              <span
                className={cn(
                  "font-body",
                  bid.status === "active"
                    ? "text-lvl-yellow font-bold"
                    : "text-lvl-smoke",
                )}
              >
                {bid.user_name}
              </span>
              <span
                className={cn(
                  "font-body font-semibold",
                  bid.status === "active" ? "text-white" : "text-lvl-smoke",
                )}
              >
                {formatPrice(bid.amount, auction.currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Bid error */}
        {bidError && (
          <p className="text-xs text-red-400 font-body text-center mb-2">
            {bidError}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {user ? (
            <button
              type="button"
              onClick={handleBid}
              disabled={bidding}
              className="flex-1 flex items-center justify-center gap-2 bg-lvl-yellow text-lvl-black font-display font-bold text-lg uppercase py-3.5 rounded-xl hover:bg-lvl-yellow/90 active:bg-lvl-yellow/80 disabled:opacity-60 transition-colors"
              aria-label={`Place bid for ${formatPrice(nextBidAmount, auction.currency)}`}
            >
              {bidding ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Gavel size={20} />
              )}
              BID {formatPrice(nextBidAmount, auction.currency)}
            </button>
          ) : (
            <a
              href="/auth/login"
              className="flex-1 flex items-center justify-center gap-2 bg-lvl-yellow text-lvl-black font-display font-bold text-lg uppercase py-3.5 rounded-xl hover:bg-lvl-yellow/90 transition-colors"
            >
              <Gavel size={20} />
              SIGN IN TO BID
            </a>
          )}

          {buyNowPrice !== null && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white text-black font-display font-bold text-sm uppercase px-5 py-3.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label={`Buy now for ${formatPrice(buyNowPrice, auction.currency)}`}
            >
              <ShoppingBag size={18} />
              BUY {formatPrice(buyNowPrice, auction.currency)}
            </button>
          )}
        </div>
      </div>

      {/* Safe area spacer */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

export { AuctionPanel, type AuctionPanelProps };
