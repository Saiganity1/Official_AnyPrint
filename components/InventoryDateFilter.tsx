"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function InventoryDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");
    
    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");
    
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    router.push("?");
  };

  return (
    <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--foreground-muted)' }}>Start Date</label>
        <input 
          type="date" 
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="input-field" 
          style={{ width: 'auto' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--foreground-muted)' }}>End Date</label>
        <input 
          type="date" 
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="input-field" 
          style={{ width: 'auto' }}
        />
      </div>
      <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Filter</button>
      {(startDate || endDate) && (
        <button type="button" onClick={handleClear} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Clear</button>
      )}
    </form>
  );
}
