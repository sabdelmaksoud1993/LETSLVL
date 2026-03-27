import type { Metadata } from "next";
import { Oswald, Poppins } from "next/font/google";
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
    <html lang="en" className={`${oswald.variable} ${poppins.variable}`}>
      <body className="bg-lvl-black text-lvl-white font-body antialiased">
        {children}
      </body>
    </html>
  );
}
