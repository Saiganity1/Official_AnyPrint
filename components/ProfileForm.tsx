"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  zipCode?: string | null;
}

export function ProfileForm({ initialData }: { initialData: UserProfile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image || null);

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    city: initialData.city || "",
    province: initialData.province || "",
    zipCode: initialData.zipCode || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImagePreview(url);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      let finalImageUrl = initialData.image || null;

      // 1. Upload new image if selected
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload profile picture");
        }

        const uploadResult = await uploadRes.json();
        finalImageUrl = uploadResult.imageUrl;
      }

      // 2. Update profile data
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: finalImageUrl }),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to update profile");
      }

      setSuccess(true);
      router.refresh(); // Refresh to update navbar
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      {error && <div style={{ color: "#ef4444", padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-sm)" }}>{error}</div>}
      {success && <div style={{ color: "#22c55e", padding: "1rem", background: "rgba(34, 197, 94, 0.1)", borderRadius: "var(--radius-sm)" }}>Profile updated successfully!</div>}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "120px", height: "120px", position: "relative", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", backgroundColor: "var(--background-secondary)" }}>
          {imagePreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-muted)", fontSize: "2rem" }}>
              {formData.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <input type="file" accept="image/*" onChange={handleImageSelect} id="avatar-upload" style={{ display: "none" }} />
          <label htmlFor="avatar-upload" className="btn-secondary" style={{ cursor: "pointer", fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
            Change Picture
          </label>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h3 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginTop: "1rem" }}>Personal Information</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="email" style={{ fontWeight: "500", color: "var(--foreground-muted)" }}>Email (Read-only)</label>
          <input type="email" id="email" value={initialData.email || ""} disabled className="input-field" style={{ opacity: 0.7, cursor: "not-allowed" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="name" style={{ fontWeight: "500" }}>Full Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="phone" style={{ fontWeight: "500" }}>Phone Number</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="09xxxxxxxxx" />
          </div>
        </div>

        <h3 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginTop: "1.5rem" }}>Saved Address</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="address" style={{ fontWeight: "500" }}>Street Address</label>
          <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="123 Main St, Brgy. San Jose" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="city" style={{ fontWeight: "500" }}>City / Municipality</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Quezon City" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="province" style={{ fontWeight: "500" }}>Province</label>
            <input type="text" id="province" name="province" value={formData.province} onChange={handleChange} className="input-field" placeholder="Metro Manila" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="zipCode" style={{ fontWeight: "500" }}>Zip Code</label>
            <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className="input-field" placeholder="1100" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: "100%", marginTop: "1rem", padding: "1rem" }}>
        {isLoading ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
}
