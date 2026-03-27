"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Share2,
  Users,
  Loader2,
} from "lucide-react";
import { cn, formatViewerCount, formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";
import { subscribeToStream } from "@/lib/realtime";
import { ChatOverlay } from "@/components/live/chat-overlay";
import { AuctionPanel } from "@/components/live/auction-panel";
import { Badge } from "@/components/ui/badge";
import type { Stream, Auction, Product } from "@/types/database";

interface StreamWithSeller extends Omit<Stream, "seller" | "country_flag"> {
  seller: {
    full_name: string;
    avatar_url: string | null;
  };
  country_flag: string;
}

function StreamViewerPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;

  const [stream, setStream] = useState<StreamWithSeller | null>(null);
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [notFound, setNotFound] = useState(false);

  // Fetch stream, auction, and products from Supabase
  useEffect(() => {
    const supabase = createClient();
    let unsubStream: (() => void) | null = null;

    async function loadStream() {
      setLoading(true);

      // Fetch stream with seller profile
      const { data: streamData, error: streamError } = await supabase
        .from("streams")
        .select(
          `
          id,
          created_at,
          seller_id,
          title,
          description,
          category,
          thumbnail_url,
          status,
          viewer_count,
          stream_url,
          scheduled_at,
          started_at,
          ended_at,
          profiles:seller_id (
            full_name,
            avatar_url,
            country
          )
        `,
        )
        .eq("id", streamId)
        .single();

      if (streamError || !streamData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const profileRaw = streamData.profiles as unknown;
      const profile = (Array.isArray(profileRaw) ? profileRaw[0] : profileRaw) as {
        full_name: string | null;
        avatar_url: string | null;
        country: string | null;
      } | null;

      const countryCode = profile?.country ?? "AE";
      const countryFlags: Record<string, string> = {
        AE: "\u{1F1E6}\u{1F1EA}",
        SA: "\u{1F1F8}\u{1F1E6}",
        QA: "\u{1F1F6}\u{1F1E6}",
        KW: "\u{1F1F0}\u{1F1FC}",
        OM: "\u{1F1F4}\u{1F1F2}",
        BH: "\u{1F1E7}\u{1F1ED}",
      };

      const mappedStream: StreamWithSeller = {
        id: streamData.id as string,
        created_at: streamData.created_at as string,
        seller_id: streamData.seller_id as string,
        title: streamData.title as string,
        description: (streamData.description as string) ?? "",
        category: (streamData.category as string) ?? "",
        thumbnail_url: (streamData.thumbnail_url as string) ?? null,
        status: streamData.status as Stream["status"],
        viewer_count: streamData.viewer_count as number,
        stream_url: (streamData.stream_url as string) ?? null,
        scheduled_at: (streamData.scheduled_at as string) ?? null,
        started_at: (streamData.started_at as string) ?? null,
        ended_at: (streamData.ended_at as string) ?? null,
        seller: {
          full_name: profile?.full_name ?? "Seller",
          avatar_url: profile?.avatar_url ?? null,
        },
        country_flag: countryFlags[countryCode] ?? "\u{1F30D}",
      };

      setStream(mappedStream);
      setViewerCount(mappedStream.viewer_count);

      // Fetch active auction for this stream
      const { data: auctionData } = await supabase
        .from("auctions")
        .select(
          `
          id,
          stream_id,
          product_id,
          start_price,
          current_bid,
          bid_increment,
          currency,
          status,
          winner_id,
          end_time,
          bid_count,
          products:product_id (
            id,
            created_at,
            updated_at,
            title,
            slug,
            description,
            price,
            compare_at_price,
            currency,
            category_id,
            brand,
            images,
            sizes,
            colors,
            tags,
            inventory_count,
            is_featured,
            is_live_exclusive,
            seller_id,
            status
          )
        `,
        )
        .eq("stream_id", streamId)
        .in("status", ["active", "closing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (auctionData) {
        const product = auctionData.products as unknown as Product;
        setActiveAuction({
          id: auctionData.id as string,
          stream_id: auctionData.stream_id as string,
          product_id: auctionData.product_id as string,
          product,
          start_price: auctionData.start_price as number,
          current_bid: auctionData.current_bid as number,
          bid_increment: auctionData.bid_increment as number,
          currency: auctionData.currency as string,
          status: auctionData.status as Auction["status"],
          winner_id: (auctionData.winner_id as string) ?? null,
          end_time: auctionData.end_time as string,
          bid_count: auctionData.bid_count as number,
        });
      }

      // Fetch featured products for this stream's seller
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", streamData.seller_id)
        .eq("status", "active")
        .limit(5);

      if (productsData) {
        setFeaturedProducts(productsData as Product[]);
      }

      setLoading(false);

      // Increment viewer count
      await supabase
        .from("streams")
        .update({
          viewer_count: (streamData.viewer_count as number) + 1,
        })
        .eq("id", streamId);

      setViewerCount((streamData.viewer_count as number) + 1);

      // Subscribe to stream viewer count updates
      unsubStream = subscribeToStream(streamId, (update) => {
        if (update.viewer_count !== undefined) {
          setViewerCount(update.viewer_count);
        }
        if (update.status !== undefined) {
          setStream((prev) =>
            prev ? { ...prev, status: update.status as Stream["status"] } : null,
          );
        }
      });
    }

    loadStream();

    // Cleanup: decrement viewer count and unsubscribe
    return () => {
      if (unsubStream) unsubStream();

      const supabaseCleanup = createClient();
      // Decrement viewer count on unmount
      supabaseCleanup
        .from("streams")
        .select("viewer_count")
        .eq("id", streamId)
        .single()
        .then(({ data }) => {
          if (data) {
            const count = Math.max(0, (data.viewer_count as number) - 1);
            supabaseCleanup
              .from("streams")
              .update({ viewer_count: count })
              .eq("id", streamId);
          }
        });
    };
  }, [streamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lvl-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-lvl-yellow" />
      </div>
    );
  }

  if (notFound || !stream) {
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
              {stream.status === "live" && <Badge variant="live">LIVE</Badge>}

              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Eye size={14} className="text-white/70" />
                <span className="text-white text-xs font-semibold font-body">
                  {formatViewerCount(viewerCount)}
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
        {featuredProducts.length > 0 && (
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
        )}
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
