'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapComponent() {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const position = [12.1348, 15.0557]; // N'Djamena, Tchad

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/40 my-4">
      <MapContainer 
        center={position} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Fonds de carte satellite Haute Résolution Esri */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri &mdash; Earthstar Geographics'
        />
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <strong className="text-emerald-700">🌱 Parcelle SahelClimate-IA</strong><br />
              Zone : N'Djamena<br />
              <span className="text-xs text-slate-600">Imagerie Satellite Esri Active</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
