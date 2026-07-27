import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDisplay } from "./ProductDisplay";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductReviewsServer } from "./ProductReviewsServer";
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

  const allImages = [product.imageUrl, ...(product.images?.map((i: any) => i.url) || [])].filter(Boolean) as string[];

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <ProductDisplay product={product} allImages={allImages} />
      
      <Suspense fallback={<div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading reviews...</div>}>
        <ProductReviewsServer productId={product.id} reviews={product.reviews} />
      </Suspense>

      <Suspense fallback={<div style={{ height: '300px' }} />}>
        <RelatedProducts category={product.category} currentProductId={product.id} />
      </Suspense>
    </div>
  );
}
