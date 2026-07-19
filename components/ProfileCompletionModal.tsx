"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function ProfileCompletionModal() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    province: "",
    zipCode: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if profile is complete based on the flag we set in auth.ts
      if ((session.user as any).isProfileComplete === false) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [session, status]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile completed successfully!");
      
      // Force a hard reload to ensure NextAuth fetches the completely fresh session token
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999, // Super high to ensure it covers everything
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '500px', animation: 'scaleIn 0.3s ease-out' }}>
        <h2 className="text-gradient" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Complete Your Profile</h2>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Welcome, {session?.user?.name}! We need a few more details so you can checkout smoothly.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone Number *</label>
            <input 
              type="text" 
              name="phone"
              className="input-field" 
              value={formData.phone}
              onChange={handleChange}
              placeholder="09123456789"
              required 
              minLength={10}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Address *</label>
            <input 
              type="text" 
              name="address"
              className="input-field" 
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, Brgy. San Jose"
              required 
              minLength={5}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>City</label>
              <input 
                type="text" 
                name="city"
                className="input-field" 
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Province</label>
              <input 
                type="text" 
                name="province"
                className="input-field" 
                value={formData.province}
                onChange={handleChange}
                placeholder="Province"
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Zip Code</label>
            <input 
              type="text" 
              name="zipCode"
              className="input-field" 
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="1000"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
