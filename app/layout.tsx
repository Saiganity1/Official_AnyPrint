import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { Navbar } from "@/components/Navbar";
import { ProductChatWidget } from "@/components/ProductChatWidget";

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
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <ProductChatWidget />
        </Providers>
      </body>
    </html>
  );
}
