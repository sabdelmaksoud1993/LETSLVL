import Link from "next/link";
import Image from "next/image";
import { Eye, Bookmark, MoreVertical } from "lucide-react";
import { cn, formatViewerCount } from "@/lib/utils";
import type { Stream } from "@/types/database";

interface StreamCardProps {
  stream: Stream;
}

function StreamCard({ stream }: StreamCardProps) {
  const isLive = stream.status === "live";
  const isScheduled = stream.status === "scheduled";

  return (
    <Link
      href={`/live/stream/${stream.id}`}
      className="group flex gap-3 bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-36 shrink-0 aspect-video rounded-xl overflow-hidden">
        <Image
          src={stream.thumbnail_url ?? ""}
          alt={stream.title}
          fill
          className="object-cover"
          sizes="144px"
        />

        {/* Status badge */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            LIVE
          </div>
        )}

        {isScheduled && (
          <div className="absolute top-2 left-2 bg-lvl-yellow text-lvl-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            UPCOMING
          </div>
        )}

        {/* Bookmark */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          aria-label="Bookmark stream"
        >
          <Bookmark size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Seller row */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-lvl-yellow to-orange-500 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-black">
                {stream.seller.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-800 truncate font-body">
              {stream.seller.full_name}
            </span>
            <span className="text-xs">{stream.country_flag}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug font-body">
            {stream.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed font-body">
            {stream.description}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-2">
          {isLive && (
            <div className="flex items-center gap-1 text-gray-500">
              <Eye size={13} />
              <span className="text-xs font-medium font-body">
                {formatViewerCount(stream.viewer_count)}
              </span>
            </div>
          )}

          {isScheduled && stream.scheduled_at && (
            <span className="text-xs text-gray-500 font-body">
              {new Date(stream.scheduled_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {!isLive && !isScheduled && <div />}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export { StreamCard, type StreamCardProps };
