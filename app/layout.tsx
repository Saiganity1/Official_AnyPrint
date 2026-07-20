import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { Navbar } from "@/components/Navbar";
import { ProductChatWidget } from "@/components/ProductChatWidget";

import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AnyPrint Avenue | Custom Apparel & Printing",
  description: "Your one-stop shop for custom shirts, chibi designs, and premium printing services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <ProfileCompletionModal />
          <ProductChatWidget />
        </Providers>
      </body>
    </html>
  );
}
