import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/AdminOrdersTable";

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

      <AdminOrdersTable initialOrders={orders} />
    </div>
  );
}
