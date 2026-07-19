"use client";

import { useCart } from "./CartContext";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, total } = useCart();
  const router = useRouter();

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out"
        }}
      />
      
      {/* Drawer */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--background)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-10px 0 25px rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <ShoppingBag size={24} color="var(--primary)" />
            Your Cart
          </h2>
          <button onClick={closeCart} style={{ background: "none", color: "var(--foreground-muted)" }}>
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--foreground-muted)", marginTop: "2rem" }}>
              Your cart is empty.
              <div style={{ marginTop: "1rem" }}>
                <button onClick={closeCart} className="btn-secondary">Continue Shopping</button>
              </div>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "80px", height: "80px", position: "relative", backgroundColor: "var(--background-secondary)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                  ) : null}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", margin: 0 }}>{item.name}</h3>
                      {(item.color || item.size) && (
                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                          {[item.color, item.size].filter(Boolean).join(" - ")}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "none", color: "var(--foreground-muted)" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ color: "var(--primary)", fontWeight: "600" }}>₱{item.price.toFixed(2)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{ background: "var(--background-secondary)", border: "1px solid var(--border)", width: "24px", height: "24px", borderRadius: "4px", color: "var(--foreground)" }}
                    >-</button>
                    <span style={{ fontSize: "0.875rem", width: "20px", textAlign: "center" }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      style={{ background: "var(--background-secondary)", border: "1px solid var(--border)", width: "24px", height: "24px", borderRadius: "4px", color: "var(--foreground)" }}
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--background-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "700" }}>
              <span>Subtotal</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--foreground-muted)", marginBottom: "1.5rem", textAlign: "center" }}>
              Shipping calculated at checkout.
            </p>
            <button 
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              className="btn-primary"
              style={{ width: "100%", padding: "1rem" }}
            >
              Checkout Now
            </button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link href="/cart" onClick={closeCart} style={{ fontSize: "0.875rem", color: "var(--primary)", textDecoration: "underline" }}>
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
