'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icône personnalisée pour les marqueurs Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Capture du clic sur la carte pour placer une nouvelle parcelle
function LocationMarker({ onParcelCreated }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onParcelCreated({
        location_name: `Parcelle (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
        lat,
        lng,
        area_ha: 15.0,
        ndvi_value: 0.40,
      });
    },
  });
  return null;
}

export default function Map({ onParcelCreated }) {
  // Liste des régions clés du Tchad avec leurs coordonnées réelles
  const positions = [
    {
      id: 1,
      region: "Bahr el Ghazal",
      locality: "Moussoro",
      lat: 13.6408,
      lng: 16.4901,
      crop: "Sorgho / Pâturages",
      zone: "Zone Sahélienne Aride",
      ndvi: 0.28,
    },
    {
      id: 2,
      region: "Chari-Baguirmi",
      locality: "N'Djamena & Environs",
      lat: 12.1131,
      lng: 15.0491,
      crop: "Maraîchage / Maïs",
      zone: "Zone Fluviale & Périurbaine",
      ndvi: 0.52,
    },
    {
      id: 3,
      region: "Kanem",
      locality: "Mao",
      lat: 14.1211,
      lng: 15.3122,
      crop: "Oasis / Pâturages / Mil",
      zone: "Zone Sahélienne",
      ndvi: 0.22,
    },
    {
      id: 4,
      region: "Guéra",
      locality: "Mongo",
      lat: 12.1844,
      lng: 18.6930,
      crop: "Sorgho / Sésame / Arachide",
      zone: "Zone Sub-Sahélienne (Reliefs)",
      ndvi: 0.48,
    },
    {
      id: 5,
      region: "Moyen-Chari",
      locality: "Sarh",
      lat: 9.1429,
      lng: 18.3923,
      crop: "Coton / Riz / Maïs",
      zone: "Zone Soudanienne (Agricole)",
      ndvi: 0.68,
    },
    {
      id: 6,
      region: "Mayo-Kebbi Est",
      locality: "Bongor",
      lat: 10.2806,
      lng: 15.3722,
      crop: "Riziculture / Pêche / Sorgho",
      zone: "Plaine d'Inondation du Logone",
      ndvi: 0.61,
    },
  ];

  // Centre de la carte ajusté pour couvrir tout le Tchad utile (Zoom 6.2)
  const mapCenter = [11.80, 16.80];

  return (
    <MapContainer
      center={mapCenter}
      zoom={6}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker onParcelCreated={onParcelCreated} />

      {positions.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={customIcon}>
          <Popup>
            <div className="text-slate-900 font-sans p-1 min-w-[180px]">
              <div className="border-b pb-1 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {p.region}
                </span>
                <strong className="text-sm block font-bold mt-1">{p.locality}</strong>
              </div>
              <p className="text-xs text-slate-600 my-0.5">
                <span className="font-semibold">Type :</span> {p.crop}
              </p>
              <p className="text-xs text-slate-600 my-0.5">
                <span className="font-semibold">Zone :</span> {p.zone}
              </p>
              <div className="mt-2 flex items-center justify-between border-t pt-1">
                <span className="text-xs font-semibold text-slate-700">NDVI moyen :</span>
                <span className={`text-xs font-bold ${p.ndvi < 0.3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {p.ndvi}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {p.lat.toFixed(4)}° N, {p.lng.toFixed(4)}° E
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
