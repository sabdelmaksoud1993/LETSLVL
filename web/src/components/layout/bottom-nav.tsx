"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Radio, Heart, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly isLive?: boolean;
}

const TABS: readonly Tab[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/category/streetwear", icon: Compass },
  { label: "LIVE", href: "/live", icon: Radio, isLive: true },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-lvl-black border-t border-lvl-slate"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around h-16">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-lvl-yellow"
                  : "text-lvl-smoke hover:text-lvl-white",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <Icon size={22} />
                {tab.isLive && (
                  <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-body font-medium",
                  tab.isLive && !active && "text-red-400",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area spacer for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export { BottomNav };
