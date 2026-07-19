"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--background-secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </CartProvider>
    </SessionProvider>
  );
}
