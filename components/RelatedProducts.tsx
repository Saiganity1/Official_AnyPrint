import { prisma } from "@/lib/prisma";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

export async function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  // Fetch up to 4 products in the same category, excluding the current product
  const products = await prisma.product.findMany({
    where: {
      category: category,
      id: { not: currentProductId }
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: {
      reviews: { select: { rating: true } }
    }
  });

  if (products.length === 0) {
    return null; // Don't show the section if there are no related products
  }

  return (
    <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Related <span className="text-gradient">Products</span></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
