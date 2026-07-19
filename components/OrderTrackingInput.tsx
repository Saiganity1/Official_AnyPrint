"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderTrackingInput({ orderId, initialTrackingNumber }: { orderId: string, initialTrackingNumber: string | null }) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to save tracking number");
      }
      
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save tracking number.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing && trackingNumber) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginTop: '0.5rem' }}>
        <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{trackingNumber}</span>
        <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
      <input
        type="text"
        placeholder="Add Tracking..."
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        disabled={isLoading}
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontSize: '0.75rem',
          width: '120px'
        }}
      />
      <button 
        onClick={handleSave} 
        disabled={isLoading}
        style={{ 
          background: 'var(--primary)', 
          color: 'white', 
          border: 'none', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          cursor: isLoading ? 'wait' : 'pointer'
        }}
      >
        Save
      </button>
      {isEditing && (
        <button 
          onClick={() => { setIsEditing(false); setTrackingNumber(initialTrackingNumber || ""); }}
          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
