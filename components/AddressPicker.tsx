"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { provinces, city_mun, barangays } from 'phil-reg-prov-mun-brgy';

// Dynamically import map to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', width: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

interface AddressPickerProps {
  initialProvince?: string;
  initialCity?: string;
  initialBarangay?: string;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  onChange: (data: {
    province: string;
    city: string;
    barangay: string;
    address: string;
    latitude: number;
    longitude: number;
    zipCode?: string;
  }) => void;
}

export default function AddressPicker({
  initialProvince = '',
  initialCity = '',
  initialBarangay = '',
  initialAddress = '',
  initialLat = 14.5995, // Default Manila
  initialLng = 120.9842,
  onChange
}: AddressPickerProps) {
  const [province, setProvince] = useState(initialProvince);
  const [city, setCity] = useState(initialCity);
  const [barangay, setBarangay] = useState(initialBarangay);
  const [streetAddress, setStreetAddress] = useState(initialAddress);
  
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [zipCode, setZipCode] = useState('');

  const [availableProvinces, setAvailableProvinces] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [availableBarangays, setAvailableBarangays] = useState<any[]>([]);

  useEffect(() => {
    setAvailableProvinces(provinces);
  }, []);

  useEffect(() => {
    if (province) {
      const selectedProv = provinces.find(p => p.name === province);
      if (selectedProv) {
        setAvailableCities(city_mun.filter(c => c.prov_code === selectedProv.prov_code));
      }
    } else {
      setAvailableCities([]);
      setCity('');
    }
  }, [province]);

  useEffect(() => {
    if (city) {
      const selectedCity = city_mun.find(c => c.name === city);
      if (selectedCity) {
        setAvailableBarangays(barangays.filter(b => b.mun_code === selectedCity.mun_code));
      }
    } else {
      setAvailableBarangays([]);
      setBarangay('');
    }
  }, [city]);

  useEffect(() => {
    // Auto-center map using OSM Nominatim only after barangay is selected
    if (city && province && barangay) {
      const query = encodeURIComponent(`${barangay}, ${city}, ${province}, Philippines`);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${query}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (data && data.length > 0) {
            setLat(parseFloat(data[0].lat));
            setLng(parseFloat(data[0].lon));
            if (data[0].address && data[0].address.postcode) {
              setZipCode(data[0].address.postcode);
            }
          } else {
            // Fallback to just city and province if barangay is not found
            const fallbackQuery = encodeURIComponent(`${city}, ${province}, Philippines`);
            fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${fallbackQuery}`)
              .then(res => res.ok ? res.json() : [])
              .then(fallbackData => {
                if (fallbackData && fallbackData.length > 0) {
                  setLat(parseFloat(fallbackData[0].lat));
                  setLng(parseFloat(fallbackData[0].lon));
                  if (fallbackData[0].address && fallbackData[0].address.postcode) {
                    setZipCode(fallbackData[0].address.postcode);
                  }
                }
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [city, province, barangay]);

  useEffect(() => {
    onChange({
      province,
      city,
      barangay,
      address: streetAddress,
      latitude: lat,
      longitude: lng,
      zipCode
    });
  }, [province, city, barangay, streetAddress, lat, lng, zipCode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="form-label">Province *</label>
          <select 
            className="input-field" 
            value={province} 
            onChange={e => {
              setProvince(e.target.value);
              setCity('');
              setBarangay('');
            }}
            required
          >
            <option value="">Select Province</option>
            {availableProvinces.map(p => (
              <option key={p.prov_code} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">City / Municipality *</label>
          <select 
            className="input-field" 
            value={city} 
            onChange={e => {
              setCity(e.target.value);
              setBarangay('');
            }}
            disabled={!province}
            required
          >
            <option value="">Select City/Municipality</option>
            {availableCities.map(c => (
              <option key={c.mun_code} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Barangay *</label>
          <select 
            className="input-field" 
            value={barangay} 
            onChange={e => setBarangay(e.target.value)}
            disabled={!city}
            required
          >
            <option value="">Select Barangay</option>
            {availableBarangays.map((b, i) => (
              <option key={`${b.mun_code}-${i}`} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Street Address (House No., Street, Subdivision) *</label>
        <input 
          type="text" 
          className="input-field" 
          value={streetAddress} 
          onChange={e => setStreetAddress(e.target.value)}
          placeholder="e.g. 123 Main St, Phase 1"
          required
        />
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        {province && city && barangay ? (
          <>
            <label className="form-label">Pin Your Exact Location *</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
              Drag the marker to your exact house or building.
            </p>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <MapWithNoSSR 
                lat={lat} 
                lng={lng} 
                onLocationChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }} 
              />
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--foreground-muted)' }}>
            Please select your Province, City, and Barangay first to unlock the interactive map.
          </div>
        )}
      </div>
    </div>
  );
}
