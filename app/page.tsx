import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Star, ShieldCheck, Zap, Palette, Truck, Shirt, Coffee, ImageIcon, Gift } from "lucide-react";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const searchHistoryStr = cookieStore.get("search_history")?.value;
  let searchHistory: string[] = [];
  
  try {
    if (searchHistoryStr) {
      searchHistory = JSON.parse(decodeURIComponent(searchHistoryStr));
    }
  } catch (e) {
    console.error("Failed to parse search history cookie");
  }

  // Fetch New Arrivals
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  // Fetch Recommended Products
  let recommendedProducts: any[] = [];
  if (searchHistory.length > 0) {
    // Create an OR clause for every keyword to match name, description, or category
    const orConditions = searchHistory.flatMap(keyword => [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
      { category: { contains: keyword } }
    ]);

    recommendedProducts = await prisma.product.findMany({
      where: {
        OR: orConditions
      },
      take: 4,
      orderBy: { salesCount: "desc" }, // Show bestselling matching items first
      include: {
        reviews: {
          select: { rating: true }
        }
      }
    });

    // Don't show recommendations if they perfectly overlap with New Arrivals to save space
    const recommendedIds = recommendedProducts.map(p => p.id);
    const newArrivalIds = products.map(p => p.id);
    const allOverlap = recommendedIds.every(id => newArrivalIds.includes(id));
    if (allOverlap) {
      recommendedProducts = [];
    }
  }

  const renderProductGrid = (items: any[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
      {items.map((product) => {
        const avgRating = product.reviews.length > 0 
          ? product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length 
          : 0;

        return (
          <Link href={`/product/${product.id}`} key={product.id} className="glass-card" style={{ display: 'block', overflow: 'hidden', transition: 'transform var(--transition-normal)' }}>
            <div className="img-zoom-container" style={{ width: '100%', height: '250px', backgroundColor: 'var(--background-secondary)', position: 'relative' }}>
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>
                  No Image
                </div>
              )}
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', color: '#eab308' }}>
                  <Star size={16} fill={avgRating >= 1 ? "currentColor" : "none"} />
                  <Star size={16} fill={avgRating >= 2 ? "currentColor" : "none"} />
                  <Star size={16} fill={avgRating >= 3 ? "currentColor" : "none"} />
                  <Star size={16} fill={avgRating >= 4 ? "currentColor" : "none"} />
                  <Star size={16} fill={avgRating >= 5 ? "currentColor" : "none"} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                  ({product.reviews.length})
                </span>
              </div>

              <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.125rem' }}>₱{product.price.toFixed(2)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );

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
                {/* Decorative glowing backplate */}
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
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
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

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="container" style={{ padding: '6rem 1.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem' }}>Recommended for You</h2>
              <p style={{ color: 'var(--foreground-muted)' }}>Based on your recent searches.</p>
            </div>
            <Link href="/products" style={{ color: 'var(--primary)', fontWeight: '600' }}>View All →</Link>
          </div>
          {renderProductGrid(recommendedProducts)}
        </section>
      )}

      {/* Featured Products */}
      <section className="container" style={{ padding: '6rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem' }}>New Arrivals</h2>
            <p style={{ color: 'var(--foreground-muted)' }}>Latest additions to our collection.</p>
          </div>
          <Link href="/products" style={{ color: 'var(--primary)', fontWeight: '600' }}>View All →</Link>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--foreground-muted)' }}>No products available yet. Check back soon!</p>
          </div>
        ) : (
          renderProductGrid(products)
        )}
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
