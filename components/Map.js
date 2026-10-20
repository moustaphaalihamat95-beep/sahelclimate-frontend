import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction des icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Map() {
  // Coordonnées centrées sur le Tchad (N'Djamena / zones agricoles)
  const position = [12.1348, 15.0557];

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30">
      <MapContainer 
        center={position} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Imagerie Spatiale Satellite HD Esri (Gratuit & Haute Résolution) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri &mdash; Earthstar Geographics'
        />
        
        {/* Superposition des noms de villes, routes et frontières */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Marqueur d'analyse agronomique */}
        <Marker position={position}>
          <Popup>
            <div className="p-2 text-slate-900 font-sans">
              <h3 className="font-bold text-emerald-700 text-base mb-1">🌱 Parcelle Agricole N'Djamena</h3>
              <p className="text-xs text-slate-600 mb-2">Analyse Satellite - SahelClimate-IA</p>
              <div className="space-y-1 text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <div><strong>Indice d'humidité :</strong> 68% (Optimale)</div>
                <div><strong>Risque Sécheresse :</strong> Faible</div>
                <div><strong>Conseil IA :</strong> Période idéale pour le semis de sorgho / maïs.</div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
