import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { PrintWaybillButton } from "@/components/PrintWaybillButton";

export default async function WaybillPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const resolvedParams = await params;
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: true,
      items: {
        include: { product: true, variant: true }
      }
    }
  });

  if (!order) {
    return <div>Order not found</div>;
  }

  const trackingText = order.trackingNumber || "NO TRACKING NUMBER";
  
  // Clean up address assuming format: "Full Name, Phone, Address, City, Province, Zip"
  const addressParts = order.shippingAddress?.split(',') || [];
  const receiverName = addressParts[0]?.trim() || order.user?.name || "Customer";
  const receiverPhone = addressParts[1]?.trim() || order.user?.phone || "No Phone";
  const receiverAddress = addressParts.slice(2).join(', ').trim() || "No Address Provided";

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif', color: 'black', background: 'white', minHeight: '100vh' }}>
      
      {/* Print Button (Hidden when printing) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; padding: 0; }
        }
      `}} />
      <div className="no-print" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <PrintWaybillButton />
      </div>

      {/* Waybill Container */}
      <div style={{ border: '2px solid black', padding: '0', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', borderBottom: '2px solid black' }}>
          <div style={{ flex: 1, padding: '1rem', borderRight: '2px solid black', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-1px' }}>J&T EXPRESS</h1>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>CASH ON DELIVERY</p>
          </div>
          <div style={{ flex: 1, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ border: '1px solid black', padding: '0.5rem', marginBottom: '0.5rem', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {trackingText}
            </div>
            <div style={{ fontSize: '0.875rem' }}>Order ID: {order.id.slice(-8).toUpperCase()}</div>
          </div>
        </div>

        {/* Addresses */}
        <div style={{ display: 'flex', borderBottom: '2px solid black' }}>
          <div style={{ flex: 1, padding: '1rem', borderRight: '2px solid black' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>SENDER</h3>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Anyprint Avenue</p>
            <p style={{ margin: '0 0 0.25rem 0' }}>09123456789</p>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Quezon City, Metro Manila</p>
          </div>
          <div style={{ flex: 1, padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>RECEIVER</h3>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', fontSize: '1.125rem' }}>{receiverName}</p>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{receiverPhone}</p>
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4' }}>{receiverAddress}</p>
          </div>
        </div>

        {/* COD Amount */}
        <div style={{ padding: '1.5rem', borderBottom: '2px solid black', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#666' }}>COD AMOUNT TO COLLECT</h2>
          <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px' }}>₱ {order.total.toFixed(2)}</div>
        </div>

        {/* Items */}
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#666' }}>PACKAGE CONTENTS</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Qty</th>
                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Item Description</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px dotted #eee' }}>
                  <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>{item.quantity}x</td>
                  <td style={{ padding: '0.5rem 0' }}>
                    {item.product.name}
                    {item.variant && (item.variant.color || item.variant.size) && (
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {[item.variant.color, item.variant.size].filter(Boolean).join(" - ")}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
            Note to rider: Please handle with care. Do not fold or bend.
          </p>
        </div>

      </div>
    </div>
  );
}
