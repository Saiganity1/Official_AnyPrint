"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";
import { AskQuestionButton } from "@/components/AskQuestionButton";

export function ProductDisplay({ product, allImages }: { product: any, allImages: string[] }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const hasVariants = product.variants && product.variants.length > 0;
  
  const colors = hasVariants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[] : [];
  const sizes = hasVariants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) as string[] : [];

  let selectedVariant = null;
  if (hasVariants) {
    selectedVariant = product.variants.find((v: any) => 
      (v.color === selectedColor || (!v.color && !selectedColor)) && 
      (v.size === selectedSize || (!v.size && !selectedSize))
    );
  }

  // Determine which image to show
  const variantImage = selectedVariant?.imageUrl;
  // Use state for active gallery image, but override with variant image if it exists and is selected
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const displayImage = variantImage || (allImages.length > 0 ? allImages[activeImageIndex] : product.imageUrl);

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  const needsColor = colors.length > 0 && !selectedColor;
  const needsSize = sizes.length > 0 && !selectedSize;
  const isSelectionComplete = !hasVariants || (!needsColor && !needsSize && selectedVariant);

  return (
    <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
      {/* LEFT: Gallery */}
      <div style={{ flex: '1 1 50%', minWidth: '300px', backgroundColor: 'var(--background-secondary)', display: 'flex', flexDirection: 'column' }}>
        <div 
          style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', cursor: isZoomed ? 'zoom-out' : 'zoom-in', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {displayImage ? (
            <Image 
              src={displayImage} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw" 
              style={{ 
                objectFit: 'cover',
                transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transition: isZoomed ? 'none' : 'transform 0.3s ease'
              }} 
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>
              No Image Available
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', overflowX: 'auto' }}>
            {allImages.map((imgUrl, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImageIndex(idx)}
                style={{ 
                  position: 'relative', 
                  width: '60px', 
                  height: '60px', 
                  flexShrink: 0,
                  border: displayImage === imgUrl ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Details & Options */}
      <div style={{ flex: '1 1 50%', minWidth: '300px', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
        
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
      </div>
    </div>
  );
}
