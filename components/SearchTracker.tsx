"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function SearchTracker() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  useEffect(() => {
    if (!search) return;

    const term = search.trim().toLowerCase();
    if (term.length < 2) return; // Ignore very short searches

    try {
      // 1. Read existing cookie
      const cookies = document.cookie.split("; ");
      const historyCookie = cookies.find(row => row.startsWith("search_history="));
      
      let history: string[] = [];
      if (historyCookie) {
        const value = decodeURIComponent(historyCookie.split("=")[1]);
        history = JSON.parse(value);
      }

      // 2. Add new term to the beginning, remove duplicates
      history = [term, ...history.filter(t => t !== term)];

      // 3. Keep only the last 5 searches
      if (history.length > 5) {
        history = history.slice(0, 5);
      }

      // 4. Save back to cookie (expires in 30 days)
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `search_history=${encodeURIComponent(JSON.stringify(history))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch (e) {
      console.error("Failed to update search history cookie", e);
    }

  }, [search]);

  return null;
}
