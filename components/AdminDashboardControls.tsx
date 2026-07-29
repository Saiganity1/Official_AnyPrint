"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Settings, Package, Calendar } from "lucide-react";
import Link from "next/link";

export function AdminDashboardControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "30d";

  const setRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
      
      {/* Time Toggles */}
      <div style={{ display: 'flex', background: 'var(--background-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-lg)' }}>
        <button 
          onClick={() => setRange("today")}
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            border: 'none', 
            background: currentRange === "today" ? 'var(--primary)' : 'transparent', 
            color: currentRange === "today" ? 'white' : 'var(--foreground-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Today
        </button>
        <button 
          onClick={() => setRange("7d")}
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            border: 'none', 
            background: currentRange === "7d" ? 'var(--primary)' : 'transparent', 
            color: currentRange === "7d" ? 'white' : 'var(--foreground-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          7 Days
        </button>
        <button 
          onClick={() => setRange("30d")}
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            border: 'none', 
            background: currentRange === "30d" ? 'var(--primary)' : 'transparent', 
            color: currentRange === "30d" ? 'white' : 'var(--foreground-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          30 Days
        </button>
        <button 
          onClick={() => setRange("all")}
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            border: 'none', 
            background: currentRange === "all" ? 'var(--primary)' : 'transparent', 
            color: currentRange === "all" ? 'white' : 'var(--foreground-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          All Time
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link href="/admin/products/new" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 'bold' }}>
          <Plus size={16} /> New Product
        </Link>
        <Link href="/admin/inventory" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 'bold' }}>
          <Settings size={16} /> Adjust Inventory
        </Link>
        <Link href="/admin/orders/bulk-waybill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 'bold' }}>
          <Package size={16} /> Bulk Waybills
        </Link>
      </div>

    </div>
  );
}
