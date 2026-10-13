"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Correction de l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function LocationMarker({ onPointAdded }) {
  useMapEvents({
    click(e) {
      onPointAdded(e.latlng);
    },
  });
  return null;
}

export default function MapComponent({ points, setPoints }) {
  // Coordonnées centrées sur N'Djamena, Tchad
  const center = [12.1348, 15.0557];

  const handlePointAdd = (latlng) => {
    setPoints((prev) => [...prev, { latitude: latlng.lat, longitude: latlng.lng }]);
  };

  const polygonCoordinates = points.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onPointAdded={handlePointAdd} />
        {points.map((pt, idx) => (
          <Marker key={idx} position={[pt.latitude, pt.longitude]} />
        ))}
        {points.length >= 3 && <Polygon positions={polygonCoordinates} color="#16a34a" />}
      </MapContainer>
    </div>
  );
}
