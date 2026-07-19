import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { InventoryAdjustmentModal } from "./InventoryAdjustmentModal";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { variants: true }
  });

  // Flatten the list into items (products without variants, or variants)
  const inventoryItems: any[] = [];

  for (const p of products) {
    if (p.variants.length > 0) {
      for (const v of p.variants) {
        inventoryItems.push({
          isVariant: true,
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          variantName: `${v.color || ''} ${v.size || ''}`.trim() || 'Default',
          imageUrl: v.imageUrl || p.imageUrl,
          stock: v.stock,
          defectiveStock: v.defectiveStock
        });
      }
    } else {
      inventoryItems.push({
        isVariant: false,
        productId: p.id,
        variantId: null,
        productName: p.name,
        variantName: null,
        imageUrl: p.imageUrl,
        stock: p.stock,
        defectiveStock: p.defectiveStock
      });
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Inventory</h1>
        <Link href="/admin/inventory/logs" className="btn-secondary" style={{ textDecoration: 'none' }}>View History Logs</Link>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Item</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Variant</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Good Stock</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Defective Stock</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--background-secondary)' }}>
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill sizes="40px" style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  <span style={{ fontWeight: '500' }}>{item.productName}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {item.variantName ? (
                    <span style={{ padding: '0.25rem 0.5rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                      {item.variantName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', background: item.stock > 10 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: item.stock > 10 ? '#22c55e' : '#eab308', fontWeight: 'bold' }}>
                    {item.stock}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {item.defectiveStock > 0 ? (
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 'bold' }}>
                      {item.defectiveStock} Damaged
                    </span>
                  ) : (
                    <span style={{ color: 'var(--foreground-muted)' }}>0</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <InventoryAdjustmentModal item={item} />
                </td>
              </tr>
            ))}
            {inventoryItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
