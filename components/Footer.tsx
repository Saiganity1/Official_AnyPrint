import Link from "next/link";
import { Mail, Phone, MapPin, Globe, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer style={{
      background: 'var(--background-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '4rem 1.5rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        {/* Brand Section */}
        <div>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="AnyPrint Avenue" style={{ height: '50px', width: 'auto', borderRadius: '4px' }} />
          </Link>
          <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Wear Your Imagination. Premium custom apparel and high-quality printing services tailored exactly to your brand&apos;s unique identity.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="#" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'var(--background)', border: '1px solid var(--border)',
              color: 'var(--foreground)', transition: 'all 0.2s'
            }}>
              <Globe size={20} />
            </Link>
            <Link href="#" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'var(--background)', border: '1px solid var(--border)',
              color: 'var(--foreground)', transition: 'all 0.2s'
            }}>
              <MessageCircle size={20} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link href="/products" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Shop All Products</Link></li>
            <li><Link href="/products?category=T-Shirts" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Custom T-Shirts</Link></li>
            <li><Link href="/products?category=Hoodies" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Premium Hoodies</Link></li>
            <li><Link href="/login" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>My Account</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Customer Care</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link href="#" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Track Order</Link></li>
            <li><Link href="#" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Return Policy</Link></li>
            <li><Link href="#" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Privacy Policy</Link></li>
            <li><Link href="#" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', color: 'var(--foreground-muted)', alignItems: 'flex-start' }}>
              <MapPin size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>123 Printing Ave, Metro Manila, Philippines</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', color: 'var(--foreground-muted)', alignItems: 'center' }}>
              <Phone size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>+63 912 345 6789</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', color: 'var(--foreground-muted)', alignItems: 'center' }}>
              <Mail size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>support@anyprintavenue.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ 
        borderTop: '1px solid var(--border)', 
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        color: 'var(--foreground-muted)',
        fontSize: '0.875rem'
      }}>
        <p>&copy; {new Date().getFullYear()} AnyPrint Avenue. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>Designed with ❤️ in the Philippines</span>
        </div>
      </div>
    </footer>
  );
}
