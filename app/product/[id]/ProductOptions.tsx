"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { AskQuestionButton } from "@/components/AskQuestionButton";

export function ProductOptions({ product }: { product: any }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const hasVariants = product.variants && product.variants.length > 0;
  
  // Extract unique colors and sizes
  const colors = hasVariants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[] : [];
  const sizes = hasVariants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) as string[] : [];

  // Find selected variant
  let selectedVariant = null;
  if (hasVariants) {
    selectedVariant = product.variants.find((v: any) => 
      (v.color === selectedColor || (!v.color && !selectedColor)) && 
      (v.size === selectedSize || (!v.size && !selectedSize))
    );
  }

  // Determine display price and stock
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Determine if selection is complete
  const needsColor = colors.length > 0 && !selectedColor;
  const needsSize = sizes.length > 0 && !selectedSize;
  const isSelectionComplete = !hasVariants || (!needsColor && !needsSize && selectedVariant);

  return (
    <>
      <p style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '2rem' }}>₱{displayPrice.toFixed(2)}</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Description</h3>
        <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{product.description}</p>
      </div>

      {hasVariants && (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {colors.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Color</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedColor === color ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedColor === color ? 'var(--primary)' : 'var(--background-secondary)',
                      color: selectedColor === color ? 'white' : 'var(--foreground)',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Size</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSize === size ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedSize === size ? 'var(--primary)' : 'var(--background-secondary)',
                      color: selectedSize === size ? 'white' : 'var(--foreground)',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
         <span style={{ fontWeight: '500' }}>Stock:</span>
         <span style={{ color: displayStock > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
           {displayStock > 0 ? `${displayStock} Available` : 'Out of Stock'}
         </span>
         {hasVariants && (!isSelectionComplete) && (
           <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>(Select options to view exact stock)</span>
         )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {(!hasVariants || isSelectionComplete) ? (
          <AddToCartButton product={product} variant={selectedVariant} displayPrice={displayPrice} displayStock={displayStock} />
        ) : (
          <button className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', flex: 1 }}>
            Select Options
          </button>
        )}
        <AskQuestionButton product={product} />
      </div>
    </>
  );
}
