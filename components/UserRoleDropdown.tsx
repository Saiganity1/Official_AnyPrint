"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserRoleDropdown({ userId, initialRole, userEmail }: { userId: string, initialRole: string, userEmail: string | null }) {
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (userEmail === "sicatmichaeldave0411@gmail.com") {
    return <span style={{ padding: '0.25rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>OWNER</span>;
  }

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setRole(initialRole); // Revert on failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={role}
      onChange={handleRoleChange}
      disabled={isLoading}
      style={{
        padding: '0.5rem',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
        cursor: isLoading ? 'wait' : 'pointer',
        fontSize: '0.875rem'
      }}
      suppressHydrationWarning
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
      <option value="OWNER">OWNER</option>
    </select>
  );
}
