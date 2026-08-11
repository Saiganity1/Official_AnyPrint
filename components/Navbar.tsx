"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Package, Menu, X } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Suspense, useState } from "react";
import { useCart } from "./CartContext";

export function Navbar() {
  const { data: session } = useSession();
  const { openCart, items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="AnyPrint Avenue" style={{ height: '40px', width: 'auto', borderRadius: '4px', transform: 'scale(1.8)', transformOrigin: 'left center' }} />
          </Link>
          <div className="hidden-mobile">
            <Suspense fallback={<div style={{ width: '200px' }} />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
        
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link href="/products" className="nav-item" style={{ fontWeight: '500' }} onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
          
          <button className="nav-item" onClick={() => { openCart(); setIsMobileMenuOpen(false); }} suppressHydrationWarning style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', position: 'relative', border: 'none', cursor: 'pointer' }}>
            <ShoppingCart size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Cart</span>
            {items.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                left: '-10px',
                background: 'var(--secondary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '99px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {items.length}
              </span>
            )}
          </button>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'OWNER' ? (
                <Link href="/admin" className="nav-item" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Dashboard</span>
                </Link>
              ) : null}
              
              <Link href="/orders" className="nav-item" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>My Orders</span>
              </Link>
              
              <Link href="/profile" className="nav-item" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {session.user?.image ? (
                  <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={session.user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <User size={24} />
                )}
                <span style={{ fontSize: '1rem', fontWeight: '500', whiteSpace: 'nowrap' }}>{session.user?.name || "User"}</span>
              </Link>
              
              <button className="nav-item" onClick={() => { signOut(); setIsMobileMenuOpen(false); }} suppressHydrationWarning style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
