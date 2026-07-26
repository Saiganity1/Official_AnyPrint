import { prisma } from "@/lib/prisma";
import { ProductCard } from "./ProductCard";

export async function NewArrivals() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
