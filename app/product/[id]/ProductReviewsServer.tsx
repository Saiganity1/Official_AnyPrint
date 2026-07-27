import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductReviews } from "@/components/ProductReviews";

export async function ProductReviewsServer({ productId, reviews }: { productId: string, reviews: any[] }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const hasReviewed = userId ? reviews.some((r) => r.userId === userId) : false;
  
  let hasPurchased = false;
  if (userId) {
    const purchaseCount = await prisma.orderItem.count({
      where: {
        productId: productId,
        order: { userId }
      }
    });
    hasPurchased = purchaseCount > 0;
  }

  const canReview = !!userId && !hasReviewed && hasPurchased;

  return (
    <ProductReviews 
      productId={productId} 
      reviews={reviews as any} 
      canReview={canReview} 
      hasPurchased={hasPurchased}
      hasReviewed={hasReviewed}
    />
  );
}
