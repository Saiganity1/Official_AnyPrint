import { ProductForm } from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: { variants: true, images: true }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/products" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '2rem' }}>Edit Product</h1>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <ProductForm initialData={product} />
      </div>
    </div>
  );
}
