"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Next.js image loading with Leaflet markers
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapComponentProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, setPosition }: { lat: number, lng: number, setPosition: (p: L.LatLng) => void }) {
  const map = useMap();
  
  // Update map center when props change (e.g. from generic city selection, but don't jump on every tiny drag if we handled it properly. Here we sync.)
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  const markerRef = useRef<L.Marker>(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[lat, lng]}
      ref={markerRef}
      icon={icon}
    />
  );
}

export default function MapComponent({ lat, lng, onLocationChange }: MapComponentProps) {
  return (
    <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker 
        lat={lat} 
        lng={lng} 
        setPosition={(p) => onLocationChange(p.lat, p.lng)} 
      />
    </MapContainer>
  );
}
