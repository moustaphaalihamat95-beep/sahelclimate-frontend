'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapComponent({ onParcelDrawn }) {
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const position = [13.6408, 16.4901]; // Moussoro / Sahel

  function MapEvents() {
    useMapEvents({
      click(e) {
        if (isDrawing) {
          const newCoords = [...polygonCoords, [e.latlng.lat, e.latlng.lng]];
          setPolygonCoords(newCoords);
          if (onParcelDrawn) onParcelDrawn(newCoords);
        }
      },
    });
    return null;
  }

  const samplePolygon = [
    [13.6420, 16.4880],
    [13.6440, 16.4940],
    [13.6380, 16.4950],
    [13.6370, 16.4890],
  ];

  return (
    <div className="w-full space-y-3">
      <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri &mdash; Satellite HD'
          />
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />
          
          <MapEvents />

          <Marker position={position}>
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <strong className="text-emerald-700">🌱 Zone Agricole Sélectionnée</strong><br />
                Coordonnées : 13.6408° N, 16.4901° E
              </div>
            </Popup>
          </Marker>

          {polygonCoords.length > 0 && (
            <Polygon positions={polygonCoords} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.45 }} />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-900/90 backdrop-blur p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsDrawing(!isDrawing);
              if (!isDrawing) setPolygonCoords([]);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              isDrawing ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            {isDrawing ? "🎯 Cliquez sur la carte pour tracer..." : "📐 Tracer ma parcelle sur la carte"}
          </button>

          <button
            onClick={() => {
              setPolygonCoords(samplePolygon);
              setIsDrawing(false);
            }}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/30"
          >
            Démo (12.5 ha)
          </button>
        </div>

        {polygonCoords.length > 0 && (
          <button
            onClick={() => setPolygonCoords([])}
            className="text-xs text-red-400 hover:underline"
          >
            Réinitialiser le tracé
          </button>
        )}
      </div>
    </div>
  );
}
