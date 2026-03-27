"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLocale } from "@/lib/locale-context";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Streetwear", href: "/category/streetwear" },
      { label: "Sneakers", href: "/category/sneakers" },
      { label: "Vintage", href: "/category/vintage" },
      { label: "Activewear", href: "/category/activewear" },
    ],
  },
  {
    title: "Live",
    links: [
      { label: "Live Now", href: "/live" },
      { label: "Upcoming", href: "/live/upcoming" },
      { label: "Past Streams", href: "/live/past" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/support/faq" },
      { label: "Shipping", href: "/support/shipping" },
      { label: "Returns", href: "/support/returns" },
      { label: "Contact", href: "/support/contact" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "X", href: "#" },
  { label: "YouTube", href: "#" },
] as const;

function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLocale();

  return (
    <footer className="bg-lvl-carbon border-t border-lvl-slate pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-0.5 mb-4">
              <span className="font-display text-2xl font-bold uppercase tracking-tight text-lvl-white">
                LET&apos;S
              </span>
              <span className="font-display text-2xl font-bold uppercase tracking-tight text-lvl-yellow">
                LVL
              </span>
            </Link>
            <p className="font-body text-sm text-lvl-smoke max-w-xs mb-6">
              The culture-first marketplace for fashion that moves. Live auctions, exclusive drops, and curated streetwear.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="font-body text-xs text-lvl-smoke hover:text-lvl-yellow transition-colors"
                  aria-label={social.label}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-lvl-white mb-4">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-lvl-smoke hover:text-lvl-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-lvl-slate flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-lvl-smoke text-center lg:text-left">
            {t('footer.tagline')}
          </p>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <p className="font-body text-xs text-lvl-smoke text-center lg:text-right">
              {currentYear} LET&apos;S LVL. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
