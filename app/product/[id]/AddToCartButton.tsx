"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export function AddToCartButton({ product, variant, displayPrice, displayStock }: { product: Product, variant?: any, displayPrice?: number, displayStock?: number }) {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const price = displayPrice ?? product.price;
  const stock = displayStock ?? product.stock;

  const handleAdd = () => {
    addToCart({
      id: variant ? `${product.id}-${variant.id}` : product.id,
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      price: price,
      imageUrl: product.imageUrl,
      quantity,
      stock: stock,
      color: variant?.color,
      size: variant?.size,
    });
    
    let variantDesc = "";
    if (variant?.color || variant?.size) {
      variantDesc = ` (${[variant.color, variant.size].filter(Boolean).join(" - ")})`;
    }
    
    toast.success(`${quantity}x ${product.name}${variantDesc} added to cart!`);
    openCart();
  };

  const handleBuyNow = () => {
    addToCart({
      id: variant ? `${product.id}-${variant.id}` : product.id,
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      price: price,
      imageUrl: product.imageUrl,
      quantity,
      stock: stock,
      color: variant?.color,
      size: variant?.size,
    });
    router.push('/checkout');
  };

  if (stock <= 0) {
    return (
      <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', flex: 1 }}>
        Out of Stock
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <button 
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          style={{ padding: '0.75rem 1rem', background: 'var(--background-secondary)', borderRight: '1px solid var(--border)' }}
        >
          -
        </button>
        <div style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
          {quantity}
        </div>
        <button 
          onClick={() => setQuantity(q => Math.min(stock, q + 1))}
          style={{ padding: '0.75rem 1rem', background: 'var(--background-secondary)', borderLeft: '1px solid var(--border)' }}
        >
          +
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
        <button 
          onClick={handleAdd} 
          className="btn-secondary" 
          style={{ flex: 1 }}
        >
          Add to Cart
        </button>
        <button 
          onClick={handleBuyNow} 
          className="btn-primary" 
          style={{ flex: 1 }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
