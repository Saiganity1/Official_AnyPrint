import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { SalesCharts } from "@/components/SalesCharts";

export default async function AdminDashboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [productCount, orderCount, userCount, orders, lowStockProducts, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 10
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: { items: { include: { product: { select: { category: true } } } } },
        orderBy: { createdAt: 'asc' }
      })
    ]);
  
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Process Revenue Data (Last 30 Days)
    const revenueMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[dateString] = 0;
    }

    // Process Category Data
    const categoryMap: Record<string, number> = {};

    recentOrders.forEach(order => {
      // Line Chart: Revenue by Date
      const dateString = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (revenueMap[dateString] !== undefined) {
        revenueMap[dateString] += order.total;
      } else {
        revenueMap[dateString] = order.total;
      }

      // Pie Chart: Revenue by Category
      order.items.forEach(item => {
        const cat = item.product?.category || "Uncategorized";
        const itemTotal = item.price * item.quantity;
        categoryMap[cat] = (categoryMap[cat] || 0) + itemTotal;
      });
    });

    const revenueData = Object.keys(revenueMap).map(date => ({
      date,
      revenue: revenueMap[date]
    }));

    const categoryData = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    })).sort((a, b) => b.value - a.value);
  
    return (
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Overview</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Total Revenue</p>
              <h3 style={{ fontSize: '1.5rem' }}>₱{totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
  
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: 'var(--radius-md)' }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Total Orders</p>
              <h3 style={{ fontSize: '1.5rem' }}>{orderCount}</h3>
            </div>
          </div>
  
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-md)' }}>
              <Package size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Products</p>
              <h3 style={{ fontSize: '1.5rem' }}>{productCount}</h3>
            </div>
          </div>
  
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Users</p>
              <h3 style={{ fontSize: '1.5rem' }}>{userCount}</h3>
            </div>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={24} /> Low Stock Warning
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lowStockProducts.map(product => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h4>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>ID: {product.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                    {product.stock} left in stock
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {categoryData.length > 0 ? (
          <SalesCharts revenueData={revenueData} categoryData={categoryData} />
        ) : (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--foreground-muted)' }}>Not enough data to generate sales charts yet.</p>
          </div>
        )}

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
          <p style={{ color: 'var(--foreground-muted)' }}>No recent activity to show.</p>
        </div>
      </div>
    );
  }
