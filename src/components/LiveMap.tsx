"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// A custom car icon for the driver
const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png", // free car icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// A component to auto-pan map to new center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({ 
  driverLat, 
  driverLng,
  passengerName = "Driver"
}: { 
  driverLat: number; 
  driverLng: number;
  passengerName?: string;
}) {
  const position: [number, number] = [driverLat, driverLng];

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={carIcon}>
        <Popup>
          <strong>{passengerName}'s Vehicle</strong><br/>
          Live Location
        </Popup>
      </Marker>
      <MapUpdater center={position} />
    </MapContainer>
  );
}
