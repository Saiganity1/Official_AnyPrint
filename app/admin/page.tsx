import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, Users, DollarSign, Eye, AlertCircle, MessageSquare, ClipboardList, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { RefreshDashboardButton } from "@/components/RefreshDashboardButton";
import { AdminDashboardControls } from "@/components/AdminDashboardControls";
import Link from "next/link";
import { format } from "date-fns";

const SalesCharts = dynamic(
  () => import("@/components/SalesCharts").then((mod) => mod.SalesCharts),
  { loading: () => <div className="skeleton" style={{ height: "400px", width: "100%", borderRadius: "var(--radius-lg)" }}></div> }
);

export default async function AdminDashboard({ searchParams }: { searchParams: { range?: string } }) {
    const range = searchParams.range || "30d";
    let dateThreshold = new Date(0); // all time default

    const now = new Date();
    if (range === "today") {
      dateThreshold = new Date();
      dateThreshold.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      dateThreshold = new Date();
      dateThreshold.setDate(now.getDate() - 7);
    } else if (range === "30d") {
      dateThreshold = new Date();
      dateThreshold.setDate(now.getDate() - 30);
    }

    // Determine how many days back for the charts (if all time, we might just show last 30 anyway to not break the chart, or dynamically range it)
    const daysToChart = range === "today" ? 1 : range === "7d" ? 7 : 30; // Max 30 for daily charts to avoid crowding

    const [
      productCount, 
      userCount, 
      rangeOrders,
      rangeVisitors,
      pendingOrdersCount,
      unreadMessagesCount,
      lowStockProducts, 
      topProducts,
      recentAuditLogs,
      recentInventoryLogs
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({ 
        where: { createdAt: { gte: dateThreshold } },
        include: { items: { include: { product: { select: { category: true } } } } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.visitorStat.findMany({
        where: { date: { gte: dateThreshold } },
        orderBy: { date: 'asc' }
      }),
      // Needs Action metrics
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.message.count({ where: { isRead: false, senderRole: "USER" } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 10
      }),
      prisma.product.findMany({
        orderBy: { salesCount: 'desc' },
        take: 5,
        select: { name: true, salesCount: true }
      }),
      // Recent Activity
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      }),
      prisma.inventoryLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, product: true, variant: true }
      })
    ]);
  
    const totalRangeRevenue = rangeOrders.reduce((sum, order) => sum + order.total, 0);
    const totalRangeVisitors = rangeVisitors.reduce((sum, stat) => sum + stat.count, 0);
    const rangeOrderCount = rangeOrders.length;

    // Process Revenue & Visitor Data for Charts
    const revenueMap: Record<string, number> = {};
    const visitorMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};

    // Initialize chart dates
    for (let i = daysToChart - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[dateString] = 0;
      visitorMap[dateString] = 0;
    }

    rangeOrders.forEach(order => {
      const dateString = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (revenueMap[dateString] !== undefined) {
        revenueMap[dateString] += order.total;
      } else if (range === "all") {
        revenueMap[dateString] = (revenueMap[dateString] || 0) + order.total;
      }

      order.items.forEach(item => {
        const cat = item.product?.category || "Uncategorized";
        const itemTotal = item.price * item.quantity;
        categoryMap[cat] = (categoryMap[cat] || 0) + itemTotal;
      });
    });

    rangeVisitors.forEach(stat => {
      const dateString = new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (visitorMap[dateString] !== undefined) {
        visitorMap[dateString] = stat.count;
      } else if (range === "all") {
        visitorMap[dateString] = (visitorMap[dateString] || 0) + stat.count;
      }
    });

    const revenueData = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    const visitorData = Object.keys(visitorMap).map(date => ({ date, visitors: visitorMap[date] }));
    const categoryData = Object.keys(categoryMap).map(name => ({ name, value: categoryMap[name] })).sort((a, b) => b.value - a.value);

    const bestSellerData = topProducts.map(p => ({
      name: p.name,
      sales: p.salesCount
    }));

    // Combine and sort Recent Activity
    const combinedActivity = [
      ...recentAuditLogs.map(log => ({
        id: log.id,
        type: 'AUDIT',
        action: log.action,
        details: log.details,
        date: log.createdAt,
        user: log.user?.name || log.user?.email || 'System'
      })),
      ...recentInventoryLogs.map(log => ({
        id: log.id,
        type: 'INVENTORY',
        action: log.type === 'SALE' ? 'Product Sold' : log.type === 'RESTOCK' ? 'Restocked' : 'Inventory Adjusted',
        details: `${log.product.name} (Qty: ${log.quantity > 0 ? '+' : ''}${log.quantity})`,
        date: log.createdAt,
        user: log.user?.name || log.user?.email || 'System'
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Overview</h1>
          <RefreshDashboardButton />
        </div>

        {/* CONTROLS (Toggles & Quick Actions) */}
        <AdminDashboardControls />

        {/* NEEDS ACTION SECTION */}
        {(pendingOrdersCount > 0 || unreadMessagesCount > 0 || lowStockProducts.length > 0) && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #ef4444' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <AlertCircle size={20} /> Needs Action
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {pendingOrdersCount > 0 && (
                <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '500', flex: '1 1 200px' }}>
                  <ClipboardList size={20} />
                  <span><strong>{pendingOrdersCount}</strong> Orders need Waybills</span>
                </Link>
              )}
              {unreadMessagesCount > 0 && (
                <Link href="/admin/messages" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '500', flex: '1 1 200px' }}>
                  <MessageSquare size={20} />
                  <span><strong>{unreadMessagesCount}</strong> Unread Messages</span>
                </Link>
              )}
              {lowStockProducts.length > 0 && (
                <Link href="/admin/inventory" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '500', flex: '1 1 200px' }}>
                  <Package size={20} />
                  <span><strong>{lowStockProducts.length}</strong> Products low in stock</span>
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', textTransform: 'capitalize' }}>Revenue ({range})</p>
              <h3 style={{ fontSize: '1.5rem' }}>₱{totalRangeRevenue.toFixed(2)}</h3>
            </div>
          </div>
  
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: 'var(--radius-md)' }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', textTransform: 'capitalize' }}>Orders ({range})</p>
              <h3 style={{ fontSize: '1.5rem' }}>{rangeOrderCount}</h3>
            </div>
          </div>
  
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-md)' }}>
              <Eye size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', textTransform: 'capitalize' }}>Visitors ({range})</p>
              <h3 style={{ fontSize: '1.5rem' }}>{totalRangeVisitors}</h3>
            </div>
          </div>
  
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Total Users</p>
              <h3 style={{ fontSize: '1.5rem' }}>{userCount}</h3>
            </div>
          </div>
        </div>
        
        {/* CHARTS */}
        {categoryData.length > 0 ? (
          <SalesCharts revenueData={revenueData} categoryData={categoryData} visitorData={visitorData} bestSellerData={bestSellerData} />
        ) : (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--foreground-muted)' }}>Not enough data to generate sales charts for this period.</p>
          </div>
        )}

        {/* RECENT ACTIVITY */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} /> Recent Activity
          </h2>
          {combinedActivity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {combinedActivity.map((act) => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem',
                        background: act.type === 'AUDIT' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: act.type === 'AUDIT' ? '#3b82f6' : '#10b981'
                      }}>
                        {act.type}
                      </span>
                      {act.action}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
                      {act.details}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '500' }}>{act.user}</div>
                    <div style={{ color: 'var(--foreground-muted)' }}>{format(new Date(act.date), 'MMM d, h:mm a')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--foreground-muted)' }}>No recent activity to show.</p>
          )}
        </div>
      </div>
    );
  }
