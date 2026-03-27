"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Package,
  Radio,
  AlertTriangle,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Sellers", href: "/admin/sellers", icon: Store },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Streams", href: "/admin/streams", icon: Radio },
  { label: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-lvl-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-lvl-white mb-3">
          Access Denied
        </h1>
        <p className="font-body text-lvl-smoke mb-6">
          You do not have permission to access the admin panel. This area is
          restricted to administrators only.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-lvl-yellow text-lvl-black font-body font-semibold rounded-lg hover:bg-lvl-yellow/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-lvl-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-lvl-yellow border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-lvl-smoke text-sm">Loading admin panel...</p>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <LoadingSkeleton />;
  }

  if (profile?.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-lvl-black flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-60 bg-lvl-carbon border-r border-lvl-slate/30
          flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-lvl-slate/30">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-wider text-lvl-yellow">
              LET&apos;S LVL
            </span>
            <span className="text-[10px] font-body font-bold text-lvl-smoke uppercase tracking-widest bg-lvl-slate/50 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-lvl-smoke hover:text-lvl-white transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium
                  transition-colors duration-150
                  ${
                    active
                      ? "bg-lvl-yellow/10 text-lvl-yellow border-l-2 border-lvl-yellow"
                      : "text-lvl-smoke hover:text-lvl-white hover:bg-lvl-slate/30 border-l-2 border-transparent"
                  }
                `}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-lvl-slate/30 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-lvl-slate flex items-center justify-center text-xs font-body font-bold text-lvl-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-medium text-lvl-white truncate">
                {profile?.full_name ?? "Admin"}
              </p>
              <p className="text-xs font-body text-lvl-smoke truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-lvl-smoke hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-lvl-carbon/80 backdrop-blur-sm border-b border-lvl-slate/30 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-lvl-smoke hover:text-lvl-white transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display text-base font-bold tracking-wider text-lvl-yellow">
            LET&apos;S LVL ADMIN
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
