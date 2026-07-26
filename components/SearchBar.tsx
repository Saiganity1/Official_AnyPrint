"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.products || []);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (query.trim()) {
      current.set("search", query.trim());
    } else {
      current.delete("search");
    }
    router.push(`/products?${current.toString()}`);
  };

  return (
    <form ref={wrapperRef} onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, maxWidth: "400px" }}>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => {
          if (query.trim().length > 0) setShowDropdown(true);
        }}
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

      {/* Autocomplete Dropdown */}
      {showDropdown && (query.trim().length > 0) && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "0.5rem",
          background: "var(--background-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 50,
          overflow: "hidden"
        }}>
          {isSearching ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--foreground-muted)", fontSize: "0.875rem" }}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {results.map((product) => (
                <li key={product.id}>
                  <Link 
                    href={`/product/${product.id}`}
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      borderBottom: "1px solid var(--border)"
                    }}
                    className="hover-bg"
                  >
                    <div style={{ width: "32px", height: "32px", position: "relative", borderRadius: "4px", overflow: "hidden", background: "var(--background)", flexShrink: 0 }}>
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--border)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--foreground-muted)" }}>₱{product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "none",
                    border: "none",
                    borderTop: "1px solid var(--border)",
                    color: "var(--primary)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500
                  }}
                  className="hover-bg"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </li>
            </ul>
          ) : (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--foreground-muted)", fontSize: "0.875rem" }}>
              No products found
            </div>
          )}
        </div>
      )}
    </form>
  );
}
