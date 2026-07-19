"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InventoryAdjustmentModal({ item }: { item: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState("RESTOCK"); // RESTOCK, REJECT, MANUAL_ADJUSTMENT
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.variantId,
          type,
          quantity: Number(quantity),
          reason
        })
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to adjust inventory");
      }

      setIsOpen(false);
      setQuantity(1);
      setReason("");
      setType("RESTOCK");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
        Adjust
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Adjust Inventory</h2>
            <p style={{ margin: '0 0 1rem 0', fontWeight: '500' }}>
              {item.productName} {item.variantName ? `(${item.variantName})` : ''}
            </p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Action</label>
                <select value={type} onChange={e => setType(e.target.value)} className="input-field" style={{ padding: '0.5rem' }}>
                  <option value="RESTOCK">Restock (Add Good Stock)</option>
                  <option value="REJECT">Mark Defective (Move Good to Defective)</option>
                  <option value="MANUAL_ADJUSTMENT">Manual Correction (Adjust Good Stock)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Quantity {type === 'MANUAL_ADJUSTMENT' ? '(Use negative to subtract)' : ''}
                </label>
                <input 
                  type="number" 
                  min={type === 'MANUAL_ADJUSTMENT' ? undefined : 1} 
                  required 
                  value={quantity} 
                  onChange={e => setQuantity(Number(e.target.value))} 
                  className="input-field" 
                  style={{ padding: '0.5rem' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Reason (Optional)</label>
                <input 
                  type="text" 
                  placeholder={type === 'REJECT' ? 'e.g., Hole in shirt' : 'e.g., Supplier delivery'}
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  className="input-field" 
                  style={{ padding: '0.5rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ flex: 1 }}>{isLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
