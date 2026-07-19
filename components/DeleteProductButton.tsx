"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to delete product");
      }

      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error deleting product");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        background: 'transparent', 
        color: isDeleting ? 'var(--foreground-muted)' : '#ef4444', 
        cursor: isDeleting ? 'not-allowed' : 'pointer', 
        fontSize: '0.875rem',
        border: 'none',
        padding: 0
      }}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
