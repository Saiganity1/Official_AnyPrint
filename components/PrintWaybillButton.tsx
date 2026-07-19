"use client";

export function PrintWaybillButton() {
  return (
    <button 
      onClick={() => window.print()}
      style={{ padding: '0.75rem 2rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
    >
      🖨️ Print Waybill
    </button>
  );
}
