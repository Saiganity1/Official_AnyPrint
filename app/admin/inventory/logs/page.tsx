import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function InventoryLogsPage() {
  const logs = await prisma.inventoryLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: true,
      variant: true,
      user: true
    }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/inventory" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '2rem' }}>Inventory History</h1>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Item</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Action Type</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Quantity</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Reason / Notes</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {format(log.createdAt, 'MMM d, yyyy HH:mm')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{log.product.name}</div>
                  {log.variant && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                      {log.variant.color || ''} {log.variant.size || ''}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: log.type === 'RESTOCK' ? 'rgba(34, 197, 94, 0.1)' : 
                               log.type === 'REJECT' ? 'rgba(239, 68, 68, 0.1)' :
                               log.type === 'SALE' ? 'rgba(59, 130, 246, 0.1)' : 'var(--background-secondary)',
                    color: log.type === 'RESTOCK' ? '#22c55e' : 
                           log.type === 'REJECT' ? '#ef4444' :
                           log.type === 'SALE' ? '#3b82f6' : 'var(--foreground)'
                  }}>
                    {log.type}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                  <span style={{ color: log.quantity > 0 && log.type !== 'REJECT' ? '#22c55e' : log.quantity < 0 || log.type === 'REJECT' ? '#ef4444' : 'inherit' }}>
                    {log.quantity > 0 && log.type !== 'REJECT' ? '+' : ''}{log.quantity}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                  {log.reason || '-'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {log.user?.name || log.user?.email || 'System'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No inventory logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
