import type { Metadata } from "next";
import { Oswald, Poppins } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
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
  title: "LET'S LVL | Fashion, Merchandise & Live Auctions",
  description:
    "Dubai's boldest ecommerce destination for fashion, merchandise, and limited-edition retail. Shop, bid, and win — all live.",
  keywords: [
    "fashion",
    "streetwear",
    "live auctions",
    "Dubai",
    "UAE",
    "sneakers",
    "trading cards",
    "limited edition",
  ],
  openGraph: {
    title: "LET'S LVL | Built for the Bold",
    description:
      "Shop fashion, bid in live auctions, and win limited drops. Built in Dubai.",
    siteName: "LET'S LVL",
    type: "website",
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
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <BottomNav />
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
