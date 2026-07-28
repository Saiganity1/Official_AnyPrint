"use client";

import QRCode from "react-qr-code";

export function WaybillQRCode({ value }: { value: string }) {
  return (
    <div style={{ background: 'white', padding: '4px' }}>
      <QRCode value={value} size={60} />
    </div>
  );
}
