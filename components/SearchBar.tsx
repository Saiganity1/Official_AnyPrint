"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (query.trim()) {
      current.set("search", query.trim());
    } else {
      current.delete("search");
    }
    router.push(`/products?${current.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, maxWidth: "400px" }}>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input-field"
        style={{ padding: "0.5rem 1rem", paddingRight: "2.5rem", borderRadius: "2rem" }}
        suppressHydrationWarning
      />
      <button 
        type="submit" 
        style={{ 
          position: "absolute", 
          right: "0.5rem", 
          background: "none", 
          border: "none", 
          color: "var(--foreground-muted)", 
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        aria-label="Search"
        suppressHydrationWarning
      >
        <Search size={18} />
      </button>
    </form>
  );
}
