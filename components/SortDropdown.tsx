"use client";

import { useRouter } from "next/navigation";

interface SortDropdownProps {
  search?: string;
  category?: string;
  sort: string;
}

export function SortDropdown({ search, category, sort }: SortDropdownProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select 
      name="sort" 
      value={sort} 
      onChange={handleSortChange}
      className="input-field" 
      style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
    >
      <option value="newest">Newest Arrivals</option>
      <option value="bestsellers">Best Sellers</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
