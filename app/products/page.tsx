import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { SortDropdown } from "@/components/SortDropdown";
import { SearchTracker } from "@/components/SearchTracker";
import { Suspense } from "react";
import { ProductGridFetcher } from "@/components/ProductGridFetcher";
import { ProductSkeletonGrid } from "@/components/ProductSkeletonGrid";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const pageStr = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const page = parseInt(pageStr, 10) || 1;

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

      <div className="products-layout">
        {/* Sidebar */}
        <aside className="products-sidebar">
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Categories</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CATEGORIES.map(cat => {
                const isActive = (category === cat) || (!category && cat === "All");
                
                const buildCategoryUrl = () => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (sort && sort !== "newest") params.set("sort", sort);
                  if (cat !== "All") params.set("category", cat);
                  const query = params.toString();
                  return `/products${query ? `?${query}` : ''}`;
                };

                return (
                  <li key={cat}>
                    <Link 
                      href={buildCategoryUrl()}
                      className={`category-link ${isActive ? 'active' : ''}`}
                      style={{ 
                        display: 'block', 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Header & Sort */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="sort" style={{ fontWeight: '500', fontSize: '0.875rem' }}>Sort By:</label>
              <SortDropdown search={search} category={category} sort={sort} />
            </div>
          </div>

          <Suspense key={`${search}-${category}-${sort}-${page}`} fallback={<ProductSkeletonGrid count={8} />}>
            <ProductGridFetcher search={search} category={category} sort={sort} page={page} />
          </Suspense>

        </div>
      </div>
    </div>
  );
}
