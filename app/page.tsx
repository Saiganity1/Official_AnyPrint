import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Palette, Truck, Shirt, Coffee, ImageIcon, Gift } from "lucide-react";
import { Suspense } from "react";
import { NewArrivals } from "@/components/NewArrivals";
import { RecommendedProducts } from "@/components/RecommendedProducts";
import { ProductSkeletonGrid } from "@/components/ProductSkeletonGrid";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        minHeight: '70vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--background) 0%, var(--background-secondary) 100%)',
        overflow: 'hidden'
      }}>
        <div className="animate-orb-1" style={{
          position: 'absolute',
          top: '-10%', left: '-10%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(0, 174, 239, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}></div>
        <div className="animate-orb-2" style={{
          position: 'absolute',
          bottom: '-10%', right: '-10%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(236, 0, 140, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}></div>
        <div className="animate-orb-3" style={{
          position: 'absolute',
          top: '30%', left: '40%',
          width: '30vw', height: '30vw',
          background: 'radial-gradient(circle, rgba(255, 242, 0, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}></div>

        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            {/* Left Column - Text */}
            <div style={{ flex: '1', zIndex: 1 }}>
              <h1 className="hero-title">
                Wear Your <span className="text-gradient">Imagination.</span>
              </h1>
              <p className="hero-subtitle">
                Premium custom apparel printed with state-of-the-art technology. 
                From single shirts to bulk orders, we bring your designs to life.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/products" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                  Shop Now
                </Link>
                <Link href="#services" className="btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                  Our Services
                </Link>
              </div>
            </div>

            {/* Right Column - Premium Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="glass-card" style={{ padding: '1rem', transform: 'rotate(2deg)', maxWidth: '450px', width: '100%', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, var(--primary), var(--secondary))', opacity: 0.1, borderRadius: 'inherit', filter: 'blur(20px)' }}></div>
                <Image 
                  src="/hero-mockup.png" 
                  alt="Premium Custom Apparel Mockup" 
                  width={600} 
                  height={600} 
                  style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)', position: 'relative', zIndex: 2 }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ padding: '6rem 1.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why Choose <span className="text-gradient">Anyprint</span></h2>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>We combine premium materials with expert craftsmanship to deliver products that make your brand stand out.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 174, 239, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Premium Quality</h3>
            <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6' }}>Top-tier materials and vibrant, long-lasting prints that endure.</p>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(236, 0, 140, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Zap size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Fast Turnaround</h3>
            <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6' }}>Quick, reliable processing to ensure you meet your crucial deadlines.</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 242, 0, 0.1)', color: '#d9a700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Palette size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Custom Solutions</h3>
            <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6' }}>Every print is tailored exactly to your brand's specific creative needs.</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Truck size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Nationwide Delivery</h3>
            <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6' }}>Fast and secure shipping anywhere in the Philippines via J&T Express.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container" id="services" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Services</h2>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>Everything you need to showcase your brand, produced with uncompromising quality.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
              <Shirt size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Custom Apparel</h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>T-shirts, hoodies, and uniforms with premium silk screen or DTF prints.</p>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--secondary)' }}>
              <Coffee size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Promotional Items</h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Mugs, tumblers, and lanyards perfect for corporate giveaways.</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)', color: '#d9a700' }}>
              <ImageIcon size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Large Format</h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>High-resolution tarpaulins, banners, and indoor/outdoor signage.</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)', color: '#22c55e' }}>
              <Gift size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Corporate Gifts</h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Customized gift sets curated specifically for your team or clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products (Suspense) */}
      <Suspense fallback={<div className="container" style={{ padding: '6rem 1.5rem 0' }}><ProductSkeletonGrid count={4} /></div>}>
        <RecommendedProducts />
      </Suspense>

      {/* Featured Products (Suspense) */}
      <section className="container" style={{ padding: '6rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem' }}>New Arrivals</h2>
            <p style={{ color: 'var(--foreground-muted)' }}>Latest additions to our collection.</p>
          </div>
          <Link href="/products" style={{ color: 'var(--primary)', fontWeight: '600' }}>View All →</Link>
        </div>

        <Suspense fallback={<ProductSkeletonGrid count={4} />}>
          <NewArrivals />
        </Suspense>
      </section>

      {/* Final Call to Action */}
      <section className="container" style={{ padding: '4rem 1.5rem 8rem' }}>
        <div className="glass-card" style={{ 
          padding: '5rem 2rem', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, rgba(0, 174, 239, 0.05) 0%, rgba(236, 0, 140, 0.05) 100%)',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to bring your ideas to life?</h2>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
            Let's create something amazing together. Start browsing our catalog of customizable products, or contact us directly for bulk corporate orders.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Explore Catalog
            </Link>
            <Link href="https://m.me/yourpage" target="_blank" className="btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
