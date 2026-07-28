"use client";

import { useState } from "react";

export function AdminLogsClient({ initialLogs }: { initialLogs: any[] }) {
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  const filteredLogs = initialLogs.filter((log) => {
    if (filterAction !== "ALL" && log.action !== filterAction) return false;
    
    if (filterDate) {
      const d = new Date(log.createdAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const logDateString = `${yyyy}-${mm}-${dd}`;
      if (logDateString !== filterDate) return false;
    }
    
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 'bold' }}>Action:</label>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--background-secondary)', color: 'var(--foreground)' }}
          >
            <option value="ALL">All Actions</option>
            <option value="PRINTED_WAYBILL">Printed Waybill</option>
            {/* Add more actions here as they are introduced */}
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
      </div>

      <div className="glass-card table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Date & Time</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>User</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Action</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                  <div style={{ color: 'var(--foreground-muted)' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  {log.user.name || log.user.email || "Unknown User"}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    background: log.user.role === 'OWNER' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: log.user.role === 'OWNER' ? '#8b5cf6' : '#3b82f6'
                  }}>
                    {log.user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  {log.action}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                  {log.details || "-"}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No logs found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
