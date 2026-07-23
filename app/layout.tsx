import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "Plate Date — eggless kitchen, Ballygunge",
  description:
    "Custom platters, cakes and desserts by chef Rhea Jaitha. 100% vegetarian, eggless, Jain-friendly. Order direct.",
  // TODO(launch): set metadataBase to the real domain in Phase 8
  openGraph: {
    title: "When's your plate date?",
    description:
      "Eggless platters, cakes and desserts. Order direct from Rhea's kitchen in Ballygunge.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable}`}>
      <body>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
