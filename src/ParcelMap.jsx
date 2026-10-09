import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { fetchParcels, createParcel, fetchWaterBalance, downloadReport } from './api';

// Correction des icônes de marqueur Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour capter le clic sur la carte et pré-remplir les coordonnées GPS
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ParcelMap() {
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [loading, setLoading] = useState(false);

  // État du formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    crop_type: 'Maïs',
    area_ha: 1.0,
    latitude: 12.1348,
    longitude: 15.0557,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadParcels();
  }, []);

  const loadParcels = async () => {
    const data = await fetchParcels();
    setParcels(data);
  };

  const handleSelectParcel = async (parcel) => {
    setSelectedParcel(parcel);
    setLoading(true);
    const balance = await fetchWaterBalance(parcel.id);
    setWaterData(balance);
    setLoading(false);
  };

  const handleMapClick = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(5)),
      longitude: parseFloat(lng.toFixed(5)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const newParcel = await createParcel({
        ...formData,
        area_ha: parseFloat(formData.area_ha),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      setMessage('✅ Parcelle créée avec succès !');
      setFormData({ name: '', crop_type: 'Maïs', area_ha: 1.0, latitude: 12.1348, longitude: 15.0557 });
      await loadParcels();
    } catch (err) {
      setMessage('❌ Erreur lors de la création de la parcelle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#166534', fontSize: '1.8rem' }}>🌾 SahelClimate-AI — Gestion des Parcelles</h1>
        <p style={{ color: '#4b5563' }}>Cliquez sur la carte pour définir la position GPS et ajouter une nouvelle parcelle.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Carte Leaflet */}
        <div className="map-container">
          <MapContainer center={[12.1348, 15.0557]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker onLocationSelect={handleMapClick} />
            {parcels.map((parcel) => (
              <Marker
                key={parcel.id}
                position={[parcel.latitude, parcel.longitude]}
                eventHandlers={{
                  click: () => handleSelectParcel(parcel),
                }}
              >
                <Popup>
                  <strong>{parcel.name}</strong><br />
                  Culture: {parcel.crop_type}<br />
                  Surface: {parcel.area_ha} ha
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Panneau latéral : Formulaire + Diagnostic Hydrique */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Formulaire d'ajout */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111827' }}>➕ Ajouter une Parcelle</h2>
            {message && <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>{message}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Nom de la parcelle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <select
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="Maïs">Maïs</option>
                <option value="Sorgho">Sorgho</option>
                <option value="Millet">Millet</option>
                <option value="Riz">Riz</option>
                <option value="Coton">Coton</option>
                <option value="Maraîchage">Maraîchage</option>
              </select>
              <input
                type="number"
                step="0.1"
                placeholder="Surface (ha)"
                value={formData.area_ha}
                onChange={(e) => setFormData({ ...formData, area_ha: e.target.value })}
                required
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  step="0.00001"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                  style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                <input
                  type="number"
                  step="0.00001"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                  style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px',
                  background: '#166534',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer la Parcelle'}
              </button>
            </form>
          </div>

          {/* Diagnostic Hydrique */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111827' }}>📊 Diagnostic Hydrique</h2>
            {selectedParcel ? (
              <div>
                <h3 style={{ color: '#15803d' }}>{selectedParcel.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' }}>
                  Culture : {selectedParcel.crop_type} ({selectedParcel.area_ha} ha)
                </p>
                {loading ? (
                  <p>Calcul FAO-56 en cours...</p>
                ) : waterData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px' }}>
                      <strong>Déficit Hydrique :</strong> {waterData.deficit_mm} mm
                    </div>
                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
                      <strong>Irrigation recommandée :</strong> {waterData.recommended_irrigation_m3} m³
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => downloadReport(selectedParcel.id, 'pdf')}
                        style={{ flex: 1, padding: '8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => downloadReport(selectedParcel.id, 'excel')}
                        style={{ flex: 1, padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        📊 Excel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Cliquez sur un marqueur existant pour consulter son bilan hydrique.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
