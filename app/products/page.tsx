import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Star } from "lucide-react";

import { CATEGORIES } from "@/lib/constants";
import { SortDropdown } from "@/components/SortDropdown";
import { SearchTracker } from "@/components/SearchTracker";
import { ProductCard } from "@/components/ProductCard";
import { Suspense } from "react";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const whereClause: any = {};
  
  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }

  if (category && category !== "All") {
    whereClause.category = category;
  }

  let orderByClause: any = { createdAt: "desc" };
  if (sort === "price_asc") orderByClause = { price: "asc" };
  else if (sort === "price_desc") orderByClause = { price: "desc" };
  else if (sort === "bestsellers") orderByClause = { salesCount: "desc" };

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <Suspense fallback={null}>
        <SearchTracker />
      </Suspense>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our <span className="text-gradient">Collection</span></h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1.125rem' }}>Find the perfect custom apparel and prints.</p>
        {search && <p style={{ marginTop: '1rem', color: 'var(--primary)' }}>Showing results for &quot;{search}&quot;</p>}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <aside style={{ width: '250px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Categories</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CATEGORIES.map(cat => {
                const isActive = (category === cat) || (!category && cat === "All");
                return (
                  <li key={cat}>
                    <Link 
                      href={`/products?${search ? `search=${search}&` : ''}${sort && sort !== 'newest' ? `sort=${sort}&` : ''}category=${cat}`}
                      style={{ 
                        display: 'block', 
                        padding: '0.5rem', 
                        borderRadius: 'var(--radius-sm)',
                        color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                        background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        fontWeight: isActive ? '600' : '400',
                        textDecoration: 'none'
                      }}
                    >
                      {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header & Sort */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--background-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: 'var(--foreground-muted)' }}>
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="sort" style={{ fontWeight: '500', fontSize: '0.875rem' }}>Sort By:</label>
              <SortDropdown search={search} category={category} sort={sort} />
            </div>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--foreground-muted)' }}>No products found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
