import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    reviews: { rating: number }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const avgRating = product.reviews.length > 0 
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="glass-card" style={{ display: 'block', overflow: 'hidden' }}>
      <div className="img-zoom-container" style={{ width: '100%', height: '250px', backgroundColor: 'var(--background-secondary)', position: 'relative' }}>
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>
            No Image
          </div>
        )}
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', color: '#eab308' }}>
            <Star size={16} fill={avgRating >= 1 ? "currentColor" : "none"} />
            <Star size={16} fill={avgRating >= 2 ? "currentColor" : "none"} />
            <Star size={16} fill={avgRating >= 3 ? "currentColor" : "none"} />
            <Star size={16} fill={avgRating >= 4 ? "currentColor" : "none"} />
            <Star size={16} fill={avgRating >= 5 ? "currentColor" : "none"} />
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
            ({product.reviews.length})
          </span>
        </div>

        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.125rem' }}>₱{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
