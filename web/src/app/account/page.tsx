import Link from "next/link";
import {
  Package,
  Heart,
  Settings,
  Store,
  ShoppingBag,
  Trophy,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MOCK_USER = {
  name: "Ahmed Al Maktoum",
  email: "ahmed@letslvl.com",
  tier: "GOLD",
  avatar: null as string | null,
  walletBalance: 2450,
  stats: {
    totalOrders: 12,
    wishlistItems: 8,
    auctionsWon: 3,
  },
};

const NAV_CARDS = [
  {
    label: "My Orders",
    href: "/account/orders",
    icon: ShoppingBag,
    description: "Track and manage your orders",
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
    description: "Items you saved for later",
  },
  {
    label: "Settings",
    href: "/account/settings",
    icon: Settings,
    description: "Profile, addresses & preferences",
  },
  {
    label: "Become a Seller",
    href: "/seller/dashboard",
    icon: Store,
    description: "Start selling on LVL",
  },
] as const;

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    GOLD: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    PLATINUM: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    SILVER: "bg-gray-400/20 text-gray-300 border-gray-400/40",
    BRONZE: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-bold tracking-wider border ${colors[tier] ?? colors.SILVER}`}
    >
      {tier}
    </span>
  );
}

export default function AccountPage() {
  const user = MOCK_USER;

  return (
    <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="font-display text-3xl font-bold tracking-wider mb-6">
        MY <span className="text-lvl-yellow">ACCOUNT</span>
      </h1>

      {/* Profile Card */}
      <div className="bg-lvl-carbon rounded-xl p-5 flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-lvl-slate flex items-center justify-center text-2xl font-display font-bold text-lvl-yellow shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold tracking-wide truncate">
            {user.name}
          </h2>
          <p className="text-lvl-smoke text-sm font-body truncate">
            {user.email}
          </p>
          <div className="mt-1">
            <TierBadge tier={user.tier} />
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-lvl-carbon rounded-xl p-5 mb-6 border-l-4 border-lvl-yellow">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-5 h-5 text-lvl-yellow" />
          <span className="text-lvl-smoke text-sm font-body">LVL Wallet</span>
        </div>
        <p className="font-display text-3xl font-bold tracking-wide">
          {formatPrice(user.walletBalance)}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            icon: Package,
            value: user.stats.totalOrders,
            label: "Orders",
          },
          {
            icon: Heart,
            value: user.stats.wishlistItems,
            label: "Wishlist",
          },
          {
            icon: Trophy,
            value: user.stats.auctionsWon,
            label: "Auctions Won",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-lvl-carbon rounded-xl p-4 text-center"
          >
            <stat.icon className="w-5 h-5 text-lvl-yellow mx-auto mb-2" />
            <p className="font-display text-xl font-bold">{stat.value}</p>
            <p className="text-lvl-smoke text-xs font-body mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="space-y-3">
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex items-center gap-4 bg-lvl-carbon rounded-xl p-4 hover:bg-lvl-slate/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-lvl-slate flex items-center justify-center shrink-0">
              <card.icon className="w-5 h-5 text-lvl-yellow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold tracking-wide">
                {card.label}
              </p>
              <p className="text-lvl-smoke text-xs font-body">
                {card.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-lvl-smoke group-hover:text-lvl-yellow transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
