import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackageSearch, FilterX } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { unstable_cache } from "next/cache";

interface ProductGridFetcherProps {
  search?: string;
  category?: string;
  sort?: string;
  page: number;
}

const getCachedProducts = unstable_cache(
  async (search: string | undefined, category: string | undefined, sort: string | undefined, page: number) => {
    const TAKE = 20;
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

    return Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: TAKE,
        skip: (page - 1) * TAKE,
        include: {
          reviews: {
            select: { rating: true }
          }
        }
      })
    ]);
  },
  ['product-grid'],
  { revalidate: 60, tags: ['products'] }
);

export async function ProductGridFetcher({ search, category, sort, page }: ProductGridFetcherProps) {
  const TAKE = 20;
  const [totalProducts, products] = await getCachedProducts(search, category, sort, page);

  const totalPages = Math.ceil(totalProducts / TAKE);
  
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (p > 1) params.set("page", p.toString());
    const query = params.toString();
    return `/products${query ? `?${query}` : ''}`;
  };

  return (
    <>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
        <div style={{ color: 'var(--foreground-muted)', fontWeight: '500' }}>
          Showing <span style={{ color: 'var(--foreground)' }}>{products.length > 0 ? (page - 1) * TAKE + 1 : 0} - {Math.min(page * TAKE, totalProducts)}</span> of <span style={{ color: 'var(--foreground)' }}>{totalProducts}</span> product{totalProducts !== 1 ? 's' : ''}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <PackageSearch size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>No products found</h3>
          <p style={{ color: 'var(--foreground-muted)', maxWidth: '400px' }}>
            We couldn't find any products matching your current filters. Try adjusting your search or category.
          </p>
          {(search || category) && (
            <Link href="/products" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <FilterX size={18} />
              Clear All Filters
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          {page > 1 ? (
            <Link href={buildPageUrl(page - 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Previous</Link>
          ) : (
            <span className="btn-secondary" style={{ padding: '0.5rem 1rem', opacity: 0.5, cursor: 'not-allowed' }}>Previous</span>
          )}

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(pageNum)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--primary)' : 'var(--background-secondary)',
                    color: isActive ? 'white' : 'var(--foreground)',
                    fontWeight: isActive ? '600' : '400',
                    textDecoration: 'none'
                  }}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {page < totalPages ? (
            <Link href={buildPageUrl(page + 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Next</Link>
          ) : (
            <span className="btn-secondary" style={{ padding: '0.5rem 1rem', opacity: 0.5, cursor: 'not-allowed' }}>Next</span>
          )}
        </div>
      )}
    </>
  );
}
