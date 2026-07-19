"use client";

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', padding: '1rem', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--background-secondary)', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>No Image</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                {(item.color || item.size) && (
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {[item.color, item.size].filter(Boolean).join(" - ")}
                  </p>
                )}
                <p style={{ color: 'var(--primary)', fontWeight: '600' }}>₱{item.price.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="number" 
                    min="1" 
                    max={item.stock}
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="input-field" 
                    style={{ width: '80px', padding: '0.5rem' }} 
                  />
                  <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', background: 'transparent' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
                {item.quantity >= item.stock && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Max stock reached ({item.stock})</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--foreground-muted)' }}>
            <span>Subtotal</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: '700', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary)' }}>🚚</span> Payment Method
            </h4>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
              <strong>Cash on Delivery (COD)</strong><br/>
              Pay when you receive your order.
            </p>
          </div>

          {!session && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
              Please <Link href="/login" style={{ textDecoration: 'underline' }}>sign in</Link> to checkout.
            </div>
          )}

          <button 
            onClick={() => router.push('/checkout')} 
            className="btn-primary" 
            style={{ width: '100%' }} 
            disabled={!session}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
