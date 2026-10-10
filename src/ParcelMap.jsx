import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  registerWithPhone, confirmPhoneCode, loginWithPhone,
  fetchParcels, createParcel, fetchWaterBalance, fetchAiAdvice, 
  fetchReforestationAdvice, fetchTrainings, fetchCommunityPosts, 
  createCommunityPost, sendChatMessage, fetchParcelWeather, downloadReport 
} from './api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ParcelMap() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState('input');
  
  const [authForm, setAuthForm] = useState({ name: '', phone: '', password: '', code: '' });
  const [authError, setAuthError] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [reforestationData, setReforestationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  
  const [trainings, setTrainings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPostMsg, setNewPostMsg] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Bonjour ! Posez-moi vos questions sur l’agriculture sahélienne, l’arrosage, la météo ou le reboisement.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mainTab, setMainTab] = useState('map');
  const [diagnosticTab, setDiagnosticTab] = useState('diagnostic');

  const [formData, setFormData] = useState({
    name: '',
    crop_type: 'Coton',
    area_ha: 1.0,
    latitude: 8.5667,
    longitude: 16.0833,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Gestion du mode Hors-Ligne (Offline)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadParcels();
      loadTrainingsAndCommunity();
    }
  }, [user]);

  const loadParcels = async () => {
    try {
      const data = await fetchParcels();
      setParcels(data);
      localStorage.setItem('cached_parcels', JSON.stringify(data));
    } catch {
      const cached = localStorage.getItem('cached_parcels');
      if (cached) setParcels(JSON.parse(cached));
    }
  };

  const loadTrainingsAndCommunity = async () => {
    const tData = await fetchTrainings().catch(() => []);
    const cData = await fetchCommunityPosts().catch(() => []);
    setTrainings(tData);
    setPosts(cData);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMsg('');
    try {
      if (isRegistering) {
        if (step === 'input') {
          const res = await registerWithPhone(authForm.name, authForm.phone, authForm.password);
          setAuthMsg(`Code SMS envoyé au ${authForm.phone} (Code démo : ${res.demo_code})`);
          setStep('confirm');
        } else {
          const res = await confirmPhoneCode(authForm.phone, authForm.code);
          setUser(res.user);
        }
      } else {
        const res = await loginWithPhone(authForm.phone, authForm.password);
        setUser({ name: res.name, phone: authForm.phone });
      }
    } catch (err) {
      setAuthError(err.message || 'Erreur lors de l’authentification.');
    }
  };

  const handleSelectParcel = async (parcel) => {
    setSelectedParcel(parcel);
    setLoading(true);
    
    const balance = await fetchWaterBalance(parcel.id).catch(() => ({}));
    const ai = await fetchAiAdvice(parcel.id).catch(() => ({}));
    const reforest = await fetchReforestationAdvice(parcel.id).catch(() => ({}));
    const weather = await fetchParcelWeather(parcel.id).catch(() => ({}));

    setWaterData(balance);
    setAiData(ai);
    setReforestationData(reforest);
    setWeatherData(weather);
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
      setFormData({ name: '', crop_type: 'Coton', area_ha: 1.0, latitude: 8.5667, longitude: 16.0833 });
      const updatedParcels = await fetchParcels();
      setParcels(updatedParcels);
      if (newParcel && newParcel.id) {
        handleSelectParcel(newParcel);
      }
    } catch (err) {
      setMessage('❌ Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostMsg.trim()) return;
    await createCommunityPost(user.name, newPostMsg);
    setNewPostMsg('');
    loadTrainingsAndCommunity();
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const zone = selectedParcel ? selectedParcel.zone : 'Sahel';
      const res = await sendChatMessage(userText, zone);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: res.response }]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Erreur de connexion avec l’assistant IA.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0fdf4', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ color: '#166534', fontSize: '1.8rem', textAlign: 'center', marginBottom: '5px' }}>🌾 SahelClimate-AI</h1>
          <p style={{ color: '#4b5563', textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem' }}>
            {isRegistering 
              ? (step === 'input' ? 'Création de compte par Téléphone' : 'Validation par Code SMS') 
              : 'Connexion par Numéro de Téléphone'}
          </p>

          {authError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '10px', textAlign: 'center' }}>{authError}</p>}
          {authMsg && <p style={{ color: '#166534', fontSize: '0.85rem', marginBottom: '10px', textAlign: 'center', background: '#dcfce7', padding: '8px', borderRadius: '6px' }}>{authMsg}</p>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isRegistering && step === 'input' && (
              <input
                type="text"
                placeholder="Nom complet"
                autoComplete="name"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
              />
            )}

            {step === 'input' ? (
              <>
                <input
                  type="tel"
                  placeholder="Numéro de téléphone (ex: +23560000000)"
                  autoComplete="tel"
                  value={authForm.phone}
                  onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                  required
                  style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                  style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="Code SMS (ex: 123456)"
                value={authForm.code}
                onChange={(e) => setAuthForm({ ...authForm, code: e.target.value })}
                required
                style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', textAlign: 'center', letterSpacing: '2px' }}
              />
            )}

            <button
              type="submit"
              style={{ padding: '12px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '5px' }}
            >
              {isRegistering 
                ? (step === 'input' ? 'Envoyer le Code SMS' : 'Confirmer mon Compte') 
                : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.85rem', color: '#6b7280' }}>
            {isRegistering ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <span
              onClick={() => { setIsRegistering(!isRegistering); setStep('input'); setAuthError(''); setAuthMsg(''); }}
              style={{ color: '#166534', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering ? 'Se connecter' : 'Créer un compte'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', background: '#ffffff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: '#166534', fontSize: '1.5rem', margin: 0 }}>🌾 Tumaï Green Sahel — SahelClimate-AI</h1>
          <p style={{ color: '#4b5563', margin: '3px 0 0 0', fontSize: '0.85rem' }}>
            Plateforme numérique unifiée | Statut Réseau : {isOnline ? <strong style={{ color: '#16a34a' }}>🟢 En Ligne</strong> : <strong style={{ color: '#dc2626' }}>🔴 Hors-Ligne (Mode Cache)</strong>}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setMainTab('map')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', background: mainTab === 'map' ? '#166534' : '#e5e7eb', color: mainTab === 'map' ? '#fff' : '#374151' }}
            >
              🗺️ Parcelles & IA
            </button>
            <button
              onClick={() => setMainTab('community')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', background: mainTab === 'community' ? '#166534' : '#e5e7eb', color: mainTab === 'community' ? '#fff' : '#374151' }}
            >
              📚 Formation & Communauté
            </button>
            <button
              onClick={() => setMainTab('chat')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', background: mainTab === 'chat' ? '#166534' : '#e5e7eb', color: mainTab === 'chat' ? '#fff' : '#374151' }}
            >
              🤖 Assistant Chat IA
            </button>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#374151' }}>👤 <strong>{user.name}</strong></span>
          <button
            onClick={() => { setUser(null); setStep('input'); }}
            style={{ padding: '5px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            Sortir
          </button>
        </div>
      </header>

      {mainTab === 'map' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '20px' }}>
          <div style={{ height: '650px', backgroundColor: '#e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'relative' }}>
            <MapContainer center={[10.5, 16.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onLocationSelect={handleMapClick} />
              {parcels.map((parcel) => (
                <Marker
                  key={parcel.id}
                  position={[parcel.latitude, parcel.longitude]}
                  eventHandlers={{ click: () => handleSelectParcel(parcel) }}
                >
                  <Popup>
                    <strong>{parcel.name}</strong><br />
                    Culture: {parcel.crop_type}<br />
                    Zone: {parcel.zone || 'Sahel'}<br />
                    Surface: {parcel.area_ha} ha
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', maxHeight: '650px' }}>
            <div style={{ background: '#ffffff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#111827' }}>➕ Ajouter une Parcelle</h2>
              {message && <p style={{ fontSize: '0.8rem', marginBottom: '8px', color: message.includes('✅') ? '#16a34a' : '#dc2626' }}>{message}</p>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  id="parcel-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nom de la parcelle"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                />
                <select
                  id="parcel-crop-type"
                  name="crop_type"
                  autoComplete="off"
                  value={formData.crop_type}
                  onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                >
                  <optgroup label="Cultures Sahel (Nord/Centre)">
                    <option value="Maïs">Maïs</option>
                    <option value="Sorgho">Sorgho</option>
                    <option value="Millet">Millet</option>
                    <option value="Riz">Riz</option>
                    <option value="Maraîchage">Maraîchage</option>
                  </optgroup>
                  <optgroup label="Cultures Sud-Ouest (Zone Soudanienne)">
                    <option value="Coton">Coton</option>
                    <option value="Manioc">Manioc</option>
                    <option value="Arachide">Arachide</option>
                    <option value="Sésame">Sésame</option>
                    <option value="Anacarde">Anacarde</option>
                  </optgroup>
                </select>
                <input
                  id="parcel-area"
                  name="area_ha"
                  type="number"
                  step="0.1"
                  autoComplete="off"
                  placeholder="Surface (ha)"
                  value={formData.area_ha}
                  onChange={(e) => setFormData({ ...formData, area_ha: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="parcel-lat"
                    name="latitude"
                    type="number"
                    step="0.00001"
                    autoComplete="off"
                    placeholder="Lat"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                    style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                  <input
                    id="parcel-lng"
                    name="longitude"
                    type="number"
                    step="0.00001"
                    autoComplete="off"
                    placeholder="Lng"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                    style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
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
                    fontSize: '0.9rem',
                  }}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            </div>

            <div style={{ background: '#ffffff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#111827' }}>🤖 Diagnostic, Météo & Reboisement IA</h2>
              {selectedParcel ? (
                <div>
                  <h3 style={{ color: '#15803d', fontSize: '1rem', marginBottom: '2px' }}>{selectedParcel.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '10px' }}>
                    Culture : <strong>{selectedParcel.crop_type}</strong> | Zone : <strong>{selectedParcel.zone || 'Sahel'}</strong> ({selectedParcel.area_ha} ha)
                  </p>

                  {/* Widget Météo & Alerte Climat */}
                  {weatherData && (
                    <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #f97316', marginBottom: '10px', fontSize: '0.85rem' }}>
                      <strong>☀️ Météo Locale :</strong> {weatherData.temperature_c}°C | Humidity: {weatherData.humidity_percent}% | {weatherData.condition}<br />
                      <span style={{ color: '#c2410c', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>{weatherData.alert}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }}>
                    <button
                      onClick={() => setDiagnosticTab('diagnostic')}
                      style={{
                        flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                        background: diagnosticTab === 'diagnostic' ? '#166534' : '#e5e7eb',
                        color: diagnosticTab === 'diagnostic' ? '#fff' : '#374151'
                      }}
                    >
                      📊 Diagnostic & Ravageurs
                    </button>
                    <button
                      onClick={() => setDiagnosticTab('reforestation')}
                      style={{
                        flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                        background: diagnosticTab === 'reforestation' ? '#15803d' : '#e5e7eb',
                        color: diagnosticTab === 'reforestation' ? '#fff' : '#374151'
                      }}
                    >
                      🌳 Reboisement Arbres
                    </button>
                  </div>

                  {loading ? (
                    <p style={{ fontSize: '0.9rem', color: '#2563eb' }}>Analyse par l'IA en cours...</p>
                  ) : (
                    <div>
                      {diagnosticTab === 'diagnostic' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                          {waterData && (
                            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px', borderLeft: '4px solid #166534' }}>
                              <strong>💧 Bilan Hydrique :</strong> {waterData.recommended_irrigation_m3} m³ d'apport recommandé.
                            </div>
                          )}
                          {aiData && (
                            <div style={{ background: '#faf5ff', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #7c3aed' }}>
                              <strong style={{ color: '#6d28d9' }}>💡 Conseil de l'IA :</strong>
                              <div style={{ marginTop: '5px' }}><strong>🐛 Menaces :</strong> {aiData.threats}</div>
                              <div style={{ marginTop: '4px' }}><strong>🛡️ Action Préventive :</strong> {aiData.preventive_action}</div>
                              <div style={{ marginTop: '4px' }}><strong>🌱 Pratiques :</strong> {aiData.crop_recommendation}</div>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                            <button
                              onClick={() => downloadReport(selectedParcel.id, 'pdf')}
                              style={{ flex: 1, padding: '6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              📄 Exporter CSV
                            </button>
                            <button
                              onClick={handlePrintReport}
                              style={{ flex: 1, padding: '6px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              🖨️ Imprimer Fiche Officielle
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                          {reforestationData && (
                            <div>
                              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '6px', borderLeft: '4px solid #059669', marginBottom: '8px' }}>
                                <strong>🌍 Analyse de Zone :</strong> {reforestationData.zone_analysis}
                              </div>
                              <div style={{ fontWeight: 'bold', color: '#065f46', marginBottom: '5px' }}>Arbres d'Agroforesterie Recommandés :</div>
                              {reforestationData.recommended_trees.map((tree, idx) => (
                                <div key={idx} style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '6px' }}>
                                  <div style={{ color: '#047857', fontWeight: 'bold' }}>{tree.species_local}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#475569' }}><strong>Bienfaits :</strong> {tree.benefits}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#475569' }}><strong>Méthode :</strong> {tree.planting_method}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Cliquez sur un marqueur sur la carte pour afficher l'analyse.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : mainTab === 'community' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '15px' }}>📖 Fiches Pratiques & Formations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trainings.map((train) => (
                <div key={train.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #166534' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#111827' }}>{train.title}</strong>
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{train.duration}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{train.category}</span>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>{train.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '600px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '15px' }}>💬 Fil d'Échange Communautaire</h2>
            
            <form onSubmit={handlePostSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Partagez un retour d'expérience du terrain..."
                value={newPostMsg}
                onChange={(e) => setNewPostMsg(e.target.value)}
                required
                style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                style={{ padding: '8px 14px', background: '#166534', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Publier
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
              {posts.map((post) => (
                <div key={post.id} style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#166534' }}>{post.author}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{post.date}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0 }}>{post.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '5px' }}>🤖 Tumaï Assistant — Expert IA Agricole</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '15px' }}>
            Posez toutes vos questions sur vos cultures, l'irrigation, la météo ou les arbres de la Grande Muraille Verte.
          </p>

          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9fafb', marginBottom: '15px' }}>
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#166534' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1f2937',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  maxWidth: '75%',
                  fontSize: '0.9rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: msg.sender === 'bot' ? '1px solid #e5e7eb' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: 'flex-start', background: '#ffffff', color: '#6b7280', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', fontStyle: 'italic', border: '1px solid #e5e7eb' }}>
                L'assistant réfléchit...
              </div>
            )}
          </div>

          <form onSubmit={handleChatSend} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ex: Comment traiter mes plants de manioc ou quel arbre planter ?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              required
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              disabled={chatLoading}
              style={{ padding: '10px 20px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
