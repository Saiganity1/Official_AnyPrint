import { prisma } from "@/lib/prisma";
import { OrderStatusDropdown } from "@/components/OrderStatusDropdown";
import { OrderTrackingInput } from "@/components/OrderTrackingInput";
import Link from "next/link";
import { Printer } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: true
    }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Orders</h1>
      </div>

      <div className="glass-card table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Order ID</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Customer</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Total</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Tracking</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  <Link href={`/orders/${order.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    {order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{order.user?.name || "Unknown"}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{order.user?.email || order.user?.phone || "No contact"}</div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>₱{order.total.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <OrderStatusDropdown orderId={order.id} initialStatus={order.status} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <OrderTrackingInput orderId={order.id} initialTrackingNumber={order.trackingNumber} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link 
                    href={`/admin/orders/${order.id}/waybill`} 
                    target="_blank"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      background: 'var(--background-secondary)',
                      color: 'var(--foreground)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <Printer size={14} /> Waybill
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
