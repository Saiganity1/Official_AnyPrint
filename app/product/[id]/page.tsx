import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDisplay } from "./ProductDisplay";
import { ProductReviews } from "@/components/ProductReviews";
import { RelatedProducts } from "@/components/RelatedProducts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      variants: true,
      images: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const hasReviewed = userId ? product.reviews.some((r) => r.userId === userId) : false;
  
  let hasPurchased = false;
  if (userId) {
    const purchaseCount = await prisma.orderItem.count({
      where: {
        productId: product.id,
        order: { userId }
      }
    });
    hasPurchased = purchaseCount > 0;
  }

  const canReview = !!userId && !hasReviewed && hasPurchased;
  
  const allImages = [product.imageUrl, ...(product.images?.map((i: any) => i.url) || [])].filter(Boolean) as string[];

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <ProductDisplay product={product} allImages={allImages} />
      
      <ProductReviews 
        productId={product.id} 
        reviews={product.reviews as any} 
        canReview={canReview} 
        hasPurchased={hasPurchased}
        hasReviewed={hasReviewed}
      />

      <Suspense fallback={<div style={{ height: '300px' }} />}>
        <RelatedProducts category={product.category} currentProductId={product.id} />
      </Suspense>
    </div>
  );
}
