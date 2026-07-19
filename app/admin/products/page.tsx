import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { DeleteProductButton } from "@/components/DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Products</h1>
        <Link href="/admin/products/new" className="btn-primary" style={{ textDecoration: 'none' }}>+ Add Product</Link>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Product</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Price</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Stock</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--background-secondary)' }}>
                    {product.imageUrl && (
                      <Image src={product.imageUrl} alt={product.name} fill sizes="40px" style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  <span style={{ fontWeight: '500' }}>{product.name}</span>
                </td>
                <td style={{ padding: '1rem' }}>₱{product.price.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', background: product.stock > 10 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: product.stock > 10 ? '#22c55e' : '#eab308' }}>
                    {product.stock} in stock
                  </span>
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Link href={`/admin/products/${product.id}/edit`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Edit</Link>
                  <DeleteProductButton id={product.id} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
