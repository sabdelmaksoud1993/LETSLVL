import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/commerce/product-card";
import { CategoryPills } from "@/components/commerce/category-pills";
import { formatViewerCount } from "@/lib/utils";
import { products, categories, streams } from "@/lib/mock-data";

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lvl-carbon via-lvl-black to-lvl-carbon">
      {/* Gradient overlay accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-lvl-yellow/10 via-transparent to-lvl-yellow/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lvl-yellow/10 blur-3xl pointer-events-none" />

      <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-32">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-lvl-white leading-none">
          Built for
          <br />
          <span className="text-lvl-yellow">the bold.</span>
        </h1>
        <p className="mt-4 max-w-md text-lvl-smoke text-base sm:text-lg font-body leading-relaxed">
          Dubai&apos;s boldest destination for fashion, merchandise, and live
          auctions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/category/streetwear">
            <Button variant="primary" size="lg" className="font-display uppercase tracking-wider">
              Shop Now
            </Button>
          </Link>
          <Link href="/live">
            <Button variant="outline" size="lg" className="font-display uppercase tracking-wider">
              <Radio className="h-4 w-4" />
              Join Live
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function LiveNowBanner() {
  const liveStreams = streams.filter((s) => s.status === "live");
  if (liveStreams.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="live">LIVE</Badge>
          <h2 className="font-display text-xl uppercase tracking-wider text-lvl-white">
            Live Now
          </h2>
        </div>
        <Link
          href="/live"
          className="flex items-center gap-1 text-lvl-yellow text-sm font-body hover:underline"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {liveStreams.map((stream) => (
          <Link
            key={stream.id}
            href="/live"
            className="shrink-0 snap-start w-64 group"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-lvl-carbon">
              {stream.thumbnail_url && (
                <Image
                  src={stream.thumbnail_url}
                  alt={stream.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="256px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-lvl-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge variant="live">LIVE</Badge>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-lvl-white text-xs font-body font-medium truncate">
                  {stream.title}
                </p>
                <p className="text-lvl-smoke text-xs font-body mt-0.5">
                  {stream.seller.full_name} &middot;{" "}
                  {formatViewerCount(stream.viewer_count)} watching
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrendingSection() {
  const featured = products.filter((p) => p.is_featured);

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
        Trending Now
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
        Categories
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative overflow-hidden rounded-xl bg-lvl-carbon p-6 hover:ring-1 hover:ring-lvl-yellow/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-lvl-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="relative font-display text-lg uppercase text-lvl-white">
              {category.name}
            </h3>
            <p className="relative mt-1 text-lvl-smoke text-xs font-body line-clamp-2">
              {category.description}
            </p>
            <ArrowRight className="relative mt-3 h-4 w-4 text-lvl-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewDropsSection() {
  const sorted = [...products].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latest = sorted.slice(0, 4);

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-lvl-white mb-6">
        New Drops
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {latest.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="pt-6">
        <CategoryPills categories={categories} />
      </div>
      <div className="mt-6">
        <HeroSection />
      </div>
      <LiveNowBanner />
      <TrendingSection />
      <CategoriesSection />
      <NewDropsSection />
    </main>
  );
}
