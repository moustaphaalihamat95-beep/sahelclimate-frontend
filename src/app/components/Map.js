"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map({ parcels, selectedParcelId, onSelectParcel }) {
  const defaultCenter = [12.8, 15.8];

  const parcelsWithCoords = parcels.map((p) => {
    if (p.id === 1 || p.location_name?.includes("N'Djamena")) {
      return {
        ...p,
        coordinates: [12.1348, 15.0557],
        polygon: [
          [12.138, 15.052],
          [12.139, 15.058],
          [12.132, 15.059],
          [12.131, 15.053],
        ],
      };
    } else {
      return {
        ...p,
        coordinates: [13.6417, 16.4901],
        polygon: [
          [13.645, 16.488],
          [13.646, 16.494],
          [13.638, 16.495],
          [13.637, 16.489],
        ],
      };
    }
  });

  return (
    <div className="w-full h-[380px] rounded-xl overflow-hidden border border-slate-800 shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {parcelsWithCoords.map((parcel) => (
          <div key={parcel.id}>
            <Marker
              position={parcel.coordinates}
              icon={customIcon}
              eventHandlers={{
                click: () => onSelectParcel(parcel.id),
              }}
            >
              <Popup>
                <div className="text-slate-900 font-sans">
                  <h3 className="font-bold text-sm">{parcel.location_name}</h3>
                  <p className="text-xs text-slate-600">Culture : {parcel.crop_type}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    NDVI : {parcel.ndvi_value}
                  </p>
                </div>
              </Popup>
            </Marker>

            {parcel.polygon && (
              <Polygon
                positions={parcel.polygon}
                pathOptions={{
                  color: selectedParcelId === parcel.id ? "#10b981" : "#3b82f6",
                  fillColor: selectedParcelId === parcel.id ? "#10b981" : "#3b82f6",
                  fillOpacity: selectedParcelId === parcel.id ? 0.4 : 0.2,
                  weight: selectedParcelId === parcel.id ? 3 : 1,
                }}
              />
            )}
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
