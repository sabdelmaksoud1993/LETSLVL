"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Share2,
  Users,
} from "lucide-react";
import { cn, formatViewerCount, formatPrice } from "@/lib/utils";
import { streams, auctions, products } from "@/lib/mock-data";
import { ChatOverlay } from "@/components/live/chat-overlay";
import { AuctionPanel } from "@/components/live/auction-panel";
import { Badge } from "@/components/ui/badge";

function StreamViewerPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;

  const stream = useMemo(
    () => streams.find((s) => s.id === streamId),
    [streamId],
  );

  const activeAuction = useMemo(
    () =>
      auctions.find((a) => a.stream_id === streamId) ?? auctions[0],
    [streamId],
  );

  const featuredProducts = useMemo(() => products.slice(0, 5), []);

  if (!stream) {
    return (
      <div className="min-h-screen bg-lvl-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lvl-white font-display text-2xl mb-2">
            Stream not found
          </p>
          <Link
            href="/live"
            className="text-lvl-yellow font-body text-sm underline"
          >
            Back to live streams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvl-black flex flex-col lg:flex-row">
      {/* Video area + overlays */}
      <div className="relative flex-1 lg:h-screen">
        {/* Mock video placeholder */}
        <div className="w-full h-[60vh] lg:h-full bg-gradient-to-b from-gray-900 via-gray-800 to-lvl-black relative overflow-hidden">
          {stream.thumbnail_url && (
            <Image
              src={stream.thumbnail_url}
              alt={stream.title}
              fill
              className="object-cover opacity-30 blur-sm"
              sizes="100vw"
              priority
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

          {/* Top overlay header */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/live")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                aria-label="Back to live streams"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="min-w-0">
                <h1 className="text-white font-semibold text-sm line-clamp-1 font-body">
                  {stream.title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/70 text-xs font-body">
                    {stream.seller.full_name}
                  </span>
                  <span className="text-xs">{stream.country_flag}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="live">LIVE</Badge>

              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Eye size={14} className="text-white/70" />
                <span className="text-white text-xs font-semibold font-body">
                  {formatViewerCount(stream.viewer_count)}
                </span>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                aria-label="Share stream"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Center play indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-white/30">
              <Users size={48} />
              <span className="font-body text-sm">Live stream</span>
            </div>
          </div>
        </div>

        {/* Product shelf (below video on mobile, overlaid on desktop) */}
        <div className="lg:absolute lg:bottom-4 lg:inset-x-0 lg:z-10 bg-lvl-black lg:bg-transparent px-4 py-3">
          <p className="text-xs text-lvl-smoke uppercase tracking-wider font-body mb-2">
            Featured Products
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 bg-lvl-carbon rounded-xl p-2 shrink-0 min-w-[180px]"
              >
                <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={product.images[0] ?? ""}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium line-clamp-1 font-body">
                    {product.title}
                  </p>
                  <p className="text-xs text-lvl-yellow font-semibold font-body mt-0.5">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat sidebar (right on desktop, below on mobile) */}
      <div className="w-full lg:w-96 lg:h-screen flex flex-col bg-lvl-black/95 lg:border-l lg:border-lvl-slate/30">
        <div className="px-4 py-3 border-b border-lvl-slate/30">
          <h2 className="text-white font-display text-sm font-bold uppercase tracking-wider">
            Live Chat
          </h2>
        </div>
        <div className="flex-1 px-4 py-2 min-h-[200px] lg:min-h-0">
          <ChatOverlay streamId={streamId} />
        </div>
      </div>

      {/* Auction panel */}
      {activeAuction && <AuctionPanel auction={activeAuction} />}
    </div>
  );
}

export default StreamViewerPage;
