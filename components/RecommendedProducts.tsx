import { prisma } from "@/lib/prisma";
import { ProductCard } from "./ProductCard";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

const getCachedRecommendations = unstable_cache(
  async (orConditions: any[]) => {
    return prisma.product.findMany({
      where: { OR: orConditions },
      take: 4,
      orderBy: { salesCount: "desc" },
      include: { reviews: { select: { rating: true } } }
    });
  },
  ['recommended-products'],
  { revalidate: 60, tags: ['products'] }
);

const getCachedNewArrivalIds = unstable_cache(
  async () => {
    return prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true }
    });
  },
  ['new-arrival-ids'],
  { revalidate: 60, tags: ['products'] }
);

export async function RecommendedProducts() {
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

  if (searchHistory.length === 0) return null;

  const orConditions = searchHistory.flatMap(keyword => [
    { name: { contains: keyword } },
    { description: { contains: keyword } },
    { category: { contains: keyword } }
  ]);

  const recommendedProducts = await getCachedRecommendations(orConditions);
  const newArrivals = await getCachedNewArrivalIds();

  const recommendedIds = recommendedProducts.map(p => p.id);
  const newArrivalIds = newArrivals.map(p => p.id);
  const allOverlap = recommendedIds.length > 0 && recommendedIds.every(id => newArrivalIds.includes(id));
  
  if (allOverlap || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section style={{ padding: '4rem 0', background: 'var(--background-secondary)' }}>
      <div className="container animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Based on your <span className="text-gradient">Searches</span></h2>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '1.125rem' }}>We think you'll love these.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
