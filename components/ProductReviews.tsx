"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, User } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  canReview: boolean;
  hasPurchased?: boolean;
  hasReviewed?: boolean;
}

export function ProductReviews({ productId, reviews, canReview, hasPurchased, hasReviewed }: ProductReviewsProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
      setError(err.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Customer Reviews</h2>
      
      <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem", alignItems: "center" }}>
        <div style={{ fontSize: "3rem", fontWeight: "700", color: "var(--primary)" }}>
          {averageRating}
        </div>
        <div>
          <div style={{ display: "flex", color: "#eab308", marginBottom: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} fill={star <= Number(averageRating) ? "currentColor" : "none"} />
            ))}
          </div>
          <div style={{ color: "var(--foreground-muted)" }}>
            Based on {reviews.length} review{reviews.length !== 1 && "s"}
          </div>
        </div>
      </div>

      {canReview ? (
        <div className="glass-card" style={{ padding: "2rem", marginBottom: "3rem" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Write a Review</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && <div style={{ color: "#ef4444", fontSize: "0.875rem" }}>{error}</div>}
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Rating</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: star <= rating ? "#eab308" : "var(--border)" }}
                  >
                    <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Comment (Optional)</label>
              <textarea
                id="comment"
                className="input-field"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ alignSelf: "flex-start" }}>
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      ) : (
        hasReviewed ? (
          <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--primary)", fontWeight: "500" }}>Thanks for reviewing this product!</p>
          </div>
        ) : (
          hasPurchased === false ? (
            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--foreground-muted)" }}>You must purchase this item before leaving a review.</p>
            </div>
          ) : null
        )
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {reviews.length === 0 ? (
          <p style={{ color: "var(--foreground-muted)" }}>No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--background-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {review.user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={review.user.image} alt={review.user.name || "User"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={20} color="var(--foreground-muted)" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{review.user.name || "Anonymous User"}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", color: "#eab308" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill={star <= review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p style={{ color: "var(--foreground)", lineHeight: "1.6" }}>{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
