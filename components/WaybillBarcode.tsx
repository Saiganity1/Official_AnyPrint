"use client";

import Barcode from 'react-barcode';

export function WaybillBarcode({ value }: { value: string }) {
  if (value === "NO TRACKING NUMBER") {
    return <div style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>;
  }
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Barcode value={value} width={2} height={50} displayValue={true} margin={0} />
    </div>
  );
}
