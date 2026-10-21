'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapComponent() {
  const [polygonCoords, setPolygonCoords] = useState(null);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const position = [12.1348, 15.0557]; // N'Djamena

  // Tracé d'une parcelle de test (12.5 Hectares)
  const samplePolygon = [
    [12.1380, 15.0520],
    [12.1390, 15.0580],
    [12.1320, 15.0590],
    [12.1310, 15.0530],
  ];

  return (
    <div className="w-full space-y-3">
      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Fonds Satellite HD Esri */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri &mdash; Satellite HD'
          />
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />
          
          <Marker position={position}>
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <strong className="text-emerald-700">🌱 Parcelle Sélectionnée</strong><br />
                Coordonnées : 12.1348° N, 15.0557° E
              </div>
            </Popup>
          </Marker>

          {polygonCoords && (
            <Polygon positions={polygonCoords} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.4 }} />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
        <button
          onClick={() => setPolygonCoords(polygonCoords ? null : samplePolygon)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md"
        >
          {polygonCoords ? "❌ Effacer le Tracé" : "📐 Simuler un tracé de zone (12.5 ha)"}
        </button>
        <span className="text-xs text-slate-400 font-mono">
          {polygonCoords ? "Superficie calculée : 12.5 Hectares (Sol Limono-Sableux)" : "Cliquez pour afficher la parcelle sur satellite"}
        </span>
      </div>
    </div>
  );
}
