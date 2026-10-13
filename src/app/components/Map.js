"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

export default function Map({ parcels = [], selectedParcelId, onSelectParcel, onAreaDrawn }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const drawnItemsRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      // Centré sur le Tchad (N'Djamena / Moussoro / Barh El Gazel)
      const map = L.map(mapRef.current).setView([13.64, 16.49], 7);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Configuration de l'outil de dessin de zone
      const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: "#10b981", weight: 3 }
          },
          polyline: false,
          circle: false,
          rectangle: true,
          marker: false,
          circlemarker: false
        }
      });
      map.addControl(drawControl);

      // Événement déclenché lorsque l'agriculteur termine le tracé
      map.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);

        const latLngs = layer.getLatLngs()[0];
        if (latLngs && onAreaDrawn) {
          let areaInM2 = 0;
          if (L.GeometryUtil && L.GeometryUtil.geodesicArea) {
            areaInM2 = L.GeometryUtil.geodesicArea(latLngs);
          } else {
            areaInM2 = Math.abs(latLngs.reduce((acc, curr, i, arr) => {
              const next = arr[(i + 1) % arr.length];
              return acc + (curr.lng * next.lat - next.lng * curr.lat);
            }, 0)) * 111000 * 111000 / 2;
          }

          const areaHa = Math.max((areaInM2 / 10000), 1.2).toFixed(2);
          onAreaDrawn({
            area_ha: areaHa,
            latLngs: latLngs
          });
        }
      });
    }

    // Affichage des marqueurs de parcelles existantes
    parcels.forEach((p) => {
      const lat = p.lat || 13.64 + (p.id * 0.1);
      const lng = p.lng || 16.49 + (p.id * 0.1);

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: p.id === selectedParcelId ? "#10b981" : "#f59e0b",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 0.9
      }).addTo(mapInstance.current);

      marker.bindPopup(`<b>${p.location_name}</b><br/>Culture: ${p.crop_type}<br/>NDVI: ${p.ndvi_value}`);
      marker.on("click", () => onSelectParcel && onSelectParcel(p.id));
    });

  }, [parcels, selectedParcelId, onSelectParcel, onAreaDrawn]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-2xl overflow-hidden z-10 border border-slate-800" />;
}
