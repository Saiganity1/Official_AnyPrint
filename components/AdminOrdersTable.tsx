"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { OrderStatusDropdown } from "@/components/OrderStatusDropdown";
import { OrderTrackingInput } from "@/components/OrderTrackingInput";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function AdminOrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredOrders = initialOrders.filter((order) => {
    // Status Filter
    if (filterStatus !== "ALL" && order.status !== filterStatus) return false;
    
    // Date Filter
    if (filterDate) {
      const d = new Date(order.createdAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const orderDateString = `${yyyy}-${mm}-${dd}`;
      if (orderDateString !== filterDate) return false;
    }
    
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkProcess = async () => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch("/api/orders/bulk-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selectedIds) })
      });

      if (!res.ok) throw new Error("Failed to process orders");
      
      const data = await res.json();
      
      toast.success("Orders processed successfully!");
      
      // Open bulk print page in new tab
      window.open(`/admin/orders/bulk-waybill?ids=${data.processedIds.join(',')}`, '_blank');
      
      // Clear selection and refresh data
      setSelectedIds(new Set());
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while processing orders.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleProcess = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const loadingToast = toast.loading("Processing waybill...");
    try {
      const res = await fetch("/api/orders/bulk-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: [id] })
      });

      if (!res.ok) throw new Error("Failed to process order");
      
      toast.success("Waybill generated!", { id: loadingToast });
      
      const newWin = window.open(`/admin/orders/${id}/waybill`, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        toast.error("Popup blocked by browser. Please allow popups.");
      }
      
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process order.", { id: loadingToast });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 'bold' }}>Filter Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--background-secondary)', color: 'var(--foreground)' }}
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          
          <label style={{ fontWeight: 'bold', marginLeft: '1rem' }}>Date:</label>
          <input 
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--background-secondary)', color: 'var(--foreground)' }}
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate("")} 
              style={{ fontSize: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
            >
              Clear
            </button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <button 
            onClick={handleBulkProcess}
            disabled={isProcessing}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} />
            {isProcessing ? "Processing..." : `Process & Print Selected (${selectedIds.size})`}
          </button>
        )}
      </div>

      <div className="glass-card table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
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
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: selectedIds.has(order.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                <td style={{ padding: '1rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
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
                  <button 
                    type="button"
                    onClick={(e) => handleSingleProcess(e, order.id)}
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
                      border: '1px solid var(--border)',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={14} /> Waybill
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No orders found matching filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
