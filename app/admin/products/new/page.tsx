import { ProductForm } from "@/components/ProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/products" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '2rem' }}>Add New Product</h1>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <ProductForm />
      </div>
    </div>
  );
}
