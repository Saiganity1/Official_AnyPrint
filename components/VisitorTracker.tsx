"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track the visit once per session when the app loads
    if (!hasTracked.current) {
      hasTracked.current = true;
      fetch("/api/analytics/visit", {
        method: "POST",
        // Fire and forget
      }).catch(e => console.error("Failed to track visit", e));
    }
  }, []);

  return null;
}
