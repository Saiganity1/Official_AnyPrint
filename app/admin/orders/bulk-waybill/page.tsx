import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrintWaybillButton } from "@/components/PrintWaybillButton";
import { WaybillBarcode } from "@/components/WaybillBarcode";
import { WaybillQRCode } from "@/components/WaybillQRCode";

export default async function BulkWaybillPage({ searchParams }: { searchParams: Promise<{ ids: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const resolvedParams = await searchParams;
  const ids = resolvedParams.ids?.split(",") || [];

  if (ids.length === 0) {
    return <div>No orders selected</div>;
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: ids } },
    include: {
      user: true,
      items: {
        include: { product: true, variant: true }
      }
    }
  });

  if (orders.length === 0) {
    return <div>Orders not found</div>;
  }

  return (
    <div style={{ background: '#e5e7eb', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', fontFamily: 'Arial, sans-serif' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: 100mm 150mm; margin: 0; }
        @media print {
          .no-print, nav, aside, footer, header { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          body, html { background: white; margin: 0; padding: 0; width: 100mm; }
          .waybill-container { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100mm !important; height: 148mm !important; overflow: hidden; page-break-inside: avoid; }
        }
      `}} />
      
      <div className="no-print" style={{ marginBottom: '1rem' }}>
        <PrintWaybillButton />
      </div>

      {orders.map((order, index) => {
        const trackingText = order.trackingNumber || "NO TRACKING NUMBER";
        const addressParts = order.shippingAddress?.split(',') || [];
        const receiverName = addressParts[0]?.trim() || order.user?.name || "Customer";
        const receiverPhone = addressParts[1]?.trim() || order.user?.phone || "No Phone";
        const receiverAddress = addressParts.slice(2).join(', ').trim() || "No Address Provided";
        const qrValue = `https://official-any-print.vercel.app/orders/${order.id}`;

        return (
          <div key={order.id} className="waybill-container" style={{ 
            width: '100mm', 
            height: '150mm', 
            background: 'white', 
            color: 'black',
            border: '1px solid #ccc',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            marginBottom: index === orders.length - 1 ? '0' : '2rem', // Margin for screen viewing
            pageBreakAfter: index === orders.length - 1 ? 'auto' : 'always',
            pageBreakInside: 'avoid'
          }}>
            
            {/* Top Header Section */}
            <div style={{ display: 'flex', borderBottom: '2px solid black', padding: '0.25rem' }}>
              <div style={{ width: '30%', borderRight: '2px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>J&T EXPRESS</h1>
                <p style={{ margin: '0', fontWeight: 'bold', fontSize: '0.6rem' }}>STANDARD DELIVERY</p>
              </div>
              <div style={{ width: '70%', padding: '0.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <WaybillBarcode value={trackingText} />
                 <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>Order ID: {order.id.slice(-10).toUpperCase()}</div>
              </div>
            </div>

            {/* Receiver & Sender Section */}
            <div style={{ display: 'flex', borderBottom: '2px solid black', flex: 1, maxHeight: '40mm' }}>
              <div style={{ width: '65%', padding: '0.5rem', borderRight: '2px solid black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                      <h3 style={{ margin: '0 0 2px 0', fontSize: '0.6rem', color: '#000', backgroundColor: '#ddd', display: 'inline-block', padding: '2px 4px' }}>RECEIVER</h3>
                      <p style={{ margin: '0 0 2px 0', fontWeight: '900', fontSize: '0.9rem' }}>{receiverName}</p>
                      <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '0.75rem' }}>{receiverPhone}</p>
                   </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: '1.2', fontWeight: 'bold' }}>{receiverAddress}</p>
              </div>
              <div style={{ width: '35%', padding: '0.5rem' }}>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '0.6rem', color: '#000', backgroundColor: '#ddd', display: 'inline-block', padding: '2px 4px' }}>SENDER</h3>
                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '0.7rem' }}>Anyprint Avenue</p>
                <p style={{ margin: '0 0 2px 0', fontSize: '0.7rem' }}>09123456789</p>
                <p style={{ margin: 0, fontSize: '0.6rem' }}>Quezon City, Metro Manila</p>
              </div>
            </div>

            {/* COD Amount & QR Section */}
            <div style={{ display: 'flex', borderBottom: '2px solid black', height: '25mm' }}>
               <div style={{ flex: 1, padding: '0.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '2px solid black' }}>
                 <h2 style={{ margin: '0 0 2px 0', fontSize: '0.7rem' }}>COD AMOUNT TO COLLECT</h2>
                 <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>₱ {order.total.toFixed(2)}</div>
               </div>
               <div style={{ width: '25mm', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <WaybillQRCode value={qrValue} />
               </div>
            </div>

            {/* Items Section */}
            <div style={{ padding: '0.5rem', flex: 1, overflow: 'hidden' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '0.6rem', color: '#000', borderBottom: '1px solid #000' }}>PACKAGE CONTENTS</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6rem' }}>
                <tbody>
                  {order.items.slice(0, 5).map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ padding: '2px 0', fontWeight: '900', width: '20px', verticalAlign: 'top' }}>{item.quantity}x</td>
                      <td style={{ padding: '2px 0', fontWeight: 'bold' }}>
                        {item.product.name}
                        {item.variant && (item.variant.color || item.variant.size) && (
                          <span style={{ fontWeight: 'normal' }}>
                            {" - "} {[item.variant.color, item.variant.size].filter(Boolean).join(" ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {order.items.length > 5 && (
                    <tr>
                      <td colSpan={2} style={{ padding: '2px 0', fontStyle: 'italic' }}>...and {order.items.length - 5} more items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer Note */}
            <div style={{ padding: '4px', textAlign: 'center', fontSize: '0.5rem', borderTop: '2px solid black', fontWeight: 'bold' }}>
               WARNING: DO NOT FOLD OR MUTILATE THE BARCODE. Please handle this package with care.
            </div>
          </div>
        );
      })}
    </div>
  );
}
