import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id, userId },
    include: {
      items: {
        include: { product: true, variant: true }
      }
    }
  });

  if (!order) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order Not Found</h1>
        <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem' }}>We couldn't find the order you're looking for.</p>
        <Link href="/orders" className="btn-primary">Back to My Orders</Link>
      </div>
    );
  }

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

  const statusStyle = getStatusColor(order.status);

  // Simple timeline progress calculation
  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statuses.indexOf(order.status);
  
  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', minHeight: 'calc(100vh - 80px)', maxWidth: '800px' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground-muted)', textDecoration: 'none', fontWeight: '500' }}>
          <ArrowLeft size={20} /> Back
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Order Details</h1>
            <div style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
              Order ID. {order.id.slice(-8).toUpperCase()} | {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem 1rem', background: statusStyle.bg, color: statusStyle.text, borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
              {order.status}
            </div>
            {order.trackingNumber && (
              <a 
                href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNumber}`}
                target="_blank"
                style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--primary)', 
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Truck size={12} /> Track Package
              </a>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        {order.status !== "CANCELLED" && (
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '3rem', padding: '0 1rem' }}>
            {/* Background Line */}
            <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
            
            {/* Active Line */}
            <div style={{ position: 'absolute', top: '24px', left: '10%', width: `${(currentIndex / (statuses.length - 1)) * 80}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 0, transition: 'width 0.5s ease-in-out' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: currentIndex >= 0 ? 'var(--primary)' : 'var(--background-secondary)', color: currentIndex >= 0 ? 'white' : 'var(--foreground-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${currentIndex >= 0 ? 'var(--primary)' : 'var(--border)'}` }}>
                <Clock size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentIndex >= 0 ? '600' : '400', color: currentIndex >= 0 ? 'var(--foreground)' : 'var(--foreground-muted)' }}>Order Placed</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: currentIndex >= 1 ? 'var(--primary)' : 'var(--background-secondary)', color: currentIndex >= 1 ? 'white' : 'var(--foreground-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${currentIndex >= 1 ? 'var(--primary)' : 'var(--border)'}` }}>
                <Package size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentIndex >= 1 ? '600' : '400', color: currentIndex >= 1 ? 'var(--foreground)' : 'var(--foreground-muted)' }}>Processing</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: currentIndex >= 2 ? 'var(--primary)' : 'var(--background-secondary)', color: currentIndex >= 2 ? 'white' : 'var(--foreground-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${currentIndex >= 2 ? 'var(--primary)' : 'var(--border)'}` }}>
                <Truck size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentIndex >= 2 ? '600' : '400', color: currentIndex >= 2 ? 'var(--foreground)' : 'var(--foreground-muted)' }}>Shipped</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: currentIndex >= 3 ? 'var(--primary)' : 'var(--background-secondary)', color: currentIndex >= 3 ? 'white' : 'var(--foreground-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${currentIndex >= 3 ? 'var(--primary)' : 'var(--border)'}` }}>
                <CheckCircle size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentIndex >= 3 ? '600' : '400', color: currentIndex >= 3 ? 'var(--foreground)' : 'var(--foreground-muted)' }}>Delivered</span>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div style={{ backgroundColor: 'var(--background-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📍 Delivery Address
          </h3>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginLeft: '1.5rem' }}>
            {order.shippingAddress?.split(', ').map((line, i) => (
              <span key={i}>{line}<br/></span>
            ))}
          </p>
        </div>

        {/* Order Items */}
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Order Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--background-secondary)', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {item.product.imageUrl ? (
                  <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
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
                <div style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>₱{item.price.toFixed(2)} x {item.quantity}</div>
              </div>
              <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '1.125rem' }}>₱{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Order Summary Total */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>
            <span>Merchandise Subtotal:</span>
            <span>₱{order.total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginBottom: '1rem', color: 'var(--foreground-muted)' }}>
            <span>Shipping Total:</span>
            <span>₱0.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontSize: '1.25rem', fontWeight: '700' }}>
            <span>Order Total:</span>
            <span style={{ color: 'var(--primary)' }}>₱{order.total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
            <span>Payment Method:</span>
            <span>Cash on Delivery</span>
          </div>
        </div>

      </div>
    </div>
  );
}
