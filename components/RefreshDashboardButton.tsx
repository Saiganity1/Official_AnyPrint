"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshDashboardButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <button 
      onClick={handleRefresh} 
      className="btn-outline"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', height: 'fit-content' }}
    >
      <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </button>
  );
}
