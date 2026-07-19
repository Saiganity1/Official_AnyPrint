import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ success?: string, tab?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const tab = resolvedSearchParams.tab || "ALL";

  let statusFilter = undefined;
  if (tab === "TO_PAY") statusFilter = "PENDING";
  if (tab === "TO_SHIP") statusFilter = "PROCESSING";
  if (tab === "TO_RECEIVE") statusFilter = "SHIPPED";
  if (tab === "COMPLETED") statusFilter = "DELIVERED";
  if (tab === "CANCELLED") statusFilter = "CANCELLED";

  const orders = await prisma.order.findMany({
    where: { 
      userId,
      ...(statusFilter ? { status: statusFilter } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true, variant: true }
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return { bg: "rgba(234, 179, 8, 0.1)", text: "#eab308" };
      case "PROCESSING": return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" };
      case "SHIPPED": return { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7" };
      case "DELIVERED": return { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" };
      case "CANCELLED": return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" };
      default: return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" };
    }
  };

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "TO_PAY", label: "To Pay" },
    { id: "TO_SHIP", label: "To Ship" },
    { id: "TO_RECEIVE", label: "To Receive" },
    { id: "COMPLETED", label: "Completed" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      {resolvedSearchParams.success && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '1.125rem' }}>
          🎉 Order placed successfully! You can track its status below.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>My Purchases</h1>
        <Link href="/products" className="btn-secondary">Continue Shopping</Link>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <Link 
            key={t.id} 
            href={`/orders?tab=${t.id}`}
            style={{ 
              padding: '0.5rem 1rem', 
              color: tab === t.id ? 'var(--primary)' : 'var(--foreground-muted)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: tab === t.id ? '600' : '400',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No orders found</h2>
          <p style={{ color: 'var(--foreground-muted)' }}>You don't have any orders in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const statusStyle = getStatusColor(order.status);
            
            return (
              <Link href={`/orders/${order.id}`} key={order.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-card" style={{ padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Order ID: {order.id.slice(-8).toUpperCase()}</div>
                      <div style={{ fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: statusStyle.bg, color: statusStyle.text, borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {order.status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--background-secondary)', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          {item.product.imageUrl ? (
                            <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="60px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)', fontSize: '0.5rem' }}>No Image</div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.product.name}</h4>
                          {item.variant && (item.variant.color || item.variant.size) && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>
                              {[item.variant.color, item.variant.size].filter(Boolean).join(" - ")}
                            </div>
                          )}
                          <div style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: '600' }}>₱{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ maxWidth: '60%' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Shipping Address</div>
                      <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{order.shippingAddress || "N/A"}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Order Total</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₱{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
