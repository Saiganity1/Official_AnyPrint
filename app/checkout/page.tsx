"use client";

import { useCart } from "@/components/CartContext";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddressPicker from "@/components/AddressPicker";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [locationData, setLocationData] = useState({
    province: "",
    city: "",
    barangay: "",
    address: "",
    latitude: 14.5995,
    longitude: 120.9842
  });
  
  const [loadedInitial, setLoadedInitial] = useState(false);
  
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch saved profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          if (data.name) setFullName(data.name);
          if (data.phone) setPhone(data.phone);
          if (data.zipCode) setZipCode(data.zipCode);
          
          setLocationData({
            province: data.province || "",
            city: data.city || "",
            barangay: "", // Barangay isn't separately stored in DB yet, so they'll need to re-select or we extract it.
            address: data.address || "",
            latitude: data.latitude || 14.5995,
            longitude: data.longitude || 120.9842
          });
        })
        .finally(() => {
          setIsLoadingProfile(false);
          setLoadedInitial(true);
        });
    } else if (status !== "loading") {
      setIsLoadingProfile(false);
      setLoadedInitial(true);
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && items.length === 0) {
      router.push("/cart");
    }
  }, [status, items.length, router]);

  if (status === "loading" || status === "unauthenticated" || items.length === 0) {
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const { address, barangay, city, province, latitude, longitude } = locationData;
    if (!fullName || !phone || !address || !city || !province || !zipCode) {
      setError("Please fill in all shipping details.");
      return;
    }

    setCheckingOut(true);
    setError("");

    const fullStreetAddress = barangay ? `${address}, Brgy. ${barangay}` : address;
    const shippingAddress = `${fullName}, ${phone}, ${fullStreetAddress}, ${city}, ${province}, ${zipCode}`;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items, 
          total, 
          shippingAddress,
          saveAddress,
          addressData: { address: fullStreetAddress, city, province, zipCode, latitude, longitude }
        })
      });

      if (res.ok) {
        clearCart();
        router.push("/orders?success=true");
      } else {
        setError("Failed to place order. Please try again.");
      }
    } catch (e) {
      setError("Error processing checkout. Please check your connection.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Checkout Confirmation</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Shipping Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shipping Address</h2>
          
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                <input type="text" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Jane Doe" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number</label>
                <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="09123456789" />
              </div>
            </div>
            
            {loadedInitial && (
              <AddressPicker 
                initialProvince={locationData.province}
                initialCity={locationData.city}
                initialAddress={locationData.address}
                initialLat={locationData.latitude}
                initialLng={locationData.longitude}
                onChange={(data) => setLocationData(data)}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Zip Code *</label>
                <input type="text" className="input-field" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required placeholder="1100" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="saveAddress" 
                checked={saveAddress} 
                onChange={(e) => setSaveAddress(e.target.checked)} 
                style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
              />
              <label htmlFor="saveAddress" style={{ fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
                Save this address for future orders
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} disabled={checkingOut || isLoadingProfile}>
              {checkingOut ? "Processing Order..." : "Confirm & Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--background-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {item.quantity}x
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    {(item.color || item.size) && (
                      <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
                        {[item.color, item.size].filter(Boolean).join(" - ")}
                      </div>
                    )}
                    <div style={{ color: 'var(--foreground-muted)', marginTop: "0.125rem" }}>₱{item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ fontWeight: '600' }}>₱{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--foreground-muted)' }}>
              <span>Subtotal</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>
              <span>Shipping</span>
              <span>₱0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700' }}>
              <span>Total Payment</span>
              <span style={{ color: 'var(--primary)' }}>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary)' }}>🚚</span> Payment Method
            </h4>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
              <strong>Cash on Delivery (COD)</strong><br/>
              You will pay the exact amount to the courier upon delivery of your items.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
