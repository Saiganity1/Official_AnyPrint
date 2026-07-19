"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  role: string;
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return {
      padding: '0.75rem',
      borderRadius: 'var(--radius-md)',
      background: isActive ? 'var(--background)' : 'transparent',
      color: isActive ? 'var(--primary)' : 'var(--foreground)',
      textDecoration: 'none',
      fontWeight: isActive ? '600' : '400',
      transition: 'all 0.2s'
    };
  };

  return (
    <aside style={{ width: '250px', background: 'var(--background-secondary)', borderRight: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Dashboard</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link href="/admin" style={getLinkStyle('/admin')}>
          Overview
        </Link>
        <Link href="/admin/products" style={getLinkStyle('/admin/products')}>
          Products
        </Link>
        <Link href="/admin/inventory" style={getLinkStyle('/admin/inventory')}>
          Inventory
        </Link>
        <Link href="/admin/orders" style={getLinkStyle('/admin/orders')}>
          Orders
        </Link>
        <Link href="/admin/messages" style={getLinkStyle('/admin/messages')}>
          Messages
        </Link>
        {role === "OWNER" && (
          <Link href="/admin/users" style={getLinkStyle('/admin/users')}>
            Users (Owner)
          </Link>
        )}
      </nav>
    </aside>
  );
}
