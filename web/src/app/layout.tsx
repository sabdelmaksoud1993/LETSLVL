import type { Metadata } from "next";
import { Oswald, Poppins } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/locale-context";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LET'S LVL",
    default: "LET'S LVL | Fashion, Merchandise & Live Auctions",
  },
  description:
    "Dubai's boldest fashion marketplace. Shop streetwear, sneakers, trading cards and collectibles. Bid in live auctions and win limited drops — all from the MENA region.",
  keywords: [
    "fashion",
    "streetwear",
    "live auctions",
    "Dubai",
    "UAE",
    "MENA",
    "sneakers",
    "trading cards",
    "limited edition",
    "collectibles",
    "ecommerce",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://letslvl.com"),
  openGraph: {
    title: "LET'S LVL | Built for the Bold",
    description:
      "Shop fashion, bid in live auctions, and win limited drops. Dubai's boldest marketplace for streetwear, sneakers, and collectibles.",
    siteName: "LET'S LVL",
    type: "website",
    locale: "en_AE",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "LET'S LVL — Fashion, Merchandise & Live Auctions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LET'S LVL | Built for the Bold",
    description:
      "Shop fashion, bid in live auctions, and win limited drops. Built in Dubai.",
    images: ["/og-default.png"],
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#F5C518",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${oswald.variable} ${poppins.variable}`}>
      <body className="bg-lvl-black text-lvl-white font-body antialiased">
        <AuthProvider>
          <LocaleProvider>
            <SiteShell>{children}</SiteShell>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
