import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Star } from "lucide-react";
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
        <div style={{
          position: 'absolute',
          top: '-10%', left: '-10%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%', right: '-10%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>

        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
            Wear Your <span className="text-gradient">Imagination</span>
          </h1>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Welcome to Anyprint Avenue</h2>
          <div style={{ color: 'var(--foreground-muted)', fontSize: '1.125rem', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto', textAlign: 'left', display: 'inline-block' }}>
            <p>✅ Cash on Delivery (COD) available via J&T Express.</p>
            <p>✅ Business Hours: Monday to Saturday, 8:00 AM - 5:00 PM. Orders are typically processed and shipped within 1 to 2 business days.</p>
            <p>✅ Production begins once a drop-off schedule is confirmed. We kindly request that you avoid cancellations to support our production workflow.</p>
            <br/>
            <p style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>Estimated Delivery Timeframes</p>
            <p>🚚 Metro Manila: 2-3 business days</p>
            <p>🚚 Luzon: 2-5 business days</p>
            <p>🚚 Visayas/Mindanao: 4-10 business days</p>
            <br/>
            <p style={{ fontSize: '0.9rem' }}>Note: Delivery estimates are based on standard courier guidelines.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/products" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Shop Now
            </Link>
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
    </main>
  );
}
