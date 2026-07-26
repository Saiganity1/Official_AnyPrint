import { prisma } from "@/lib/prisma";
import { ProductCard } from "./ProductCard";
import { unstable_cache } from "next/cache";

const getCachedNewArrivals = unstable_cache(
  async () => {
    return prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          select: { rating: true }
        }
      }
    });
  },
  ['new-arrivals'],
  { revalidate: 60, tags: ['products'] }
);

export async function NewArrivals() {
  const products = await getCachedNewArrivals();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
