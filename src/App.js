import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix icônes par défaut Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sahelclimate-api.onrender.com";

function App() {
  // Etats Authentification
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify'
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [activeTab, setActiveTab] = useState('ia');

  // Etats AI
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [plantDiagnosis, setPlantDiagnosis] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Etats Données
  const [parcels, setParcels] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [weather, setWeather] = useState(null);

  // Formulaires
  const [newParcel, setNewParcel] = useState({ name: '', area_ha: '', crop_type: 'Mil', location: 'Moussoro', lat: '13.6405', lng: '16.4901' });
  const [newPost, setNewPost] = useState({ author: '', location: 'Moussoro', message: '' });

  useEffect(() => {
    fetchWeather();
    fetchParcels();
    fetchTrainings();
    fetchCommunity();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/weather`);
      const data = await res.json();
      setWeather(data);
    } catch (e) { console.error(e); }
  };

  const fetchParcels = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/parcels`);
      const data = await res.json();
      setParcels(data);
    } catch (e) { console.error(e); }
  };

  const fetchTrainings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/trainings`);
      const data = await res.json();
      setTrainings(data);
    } catch (e) { console.error(e); }
  };

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/community`);
      const data = await res.json();
      setCommunityPosts(data);
    } catch (e) { console.error(e); }
  };

  // --- Fonctions d'Authentification ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMessage('Envoi du code...');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneInput, full_name: nameInput })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthMessage(`Code envoyé ! (Test code: ${data.test_code})`);
        setAuthMode('verify');
      } else {
        setAuthMessage(`Erreur : ${data.detail || "Échec inscription"}`);
      }
    } catch (err) { setAuthMessage(`Erreur réseau : ${err.message}`); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMessage('Vérification du numéro...');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneInput })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthMessage(`Code de connexion envoyé ! (Test code: ${data.test_code})`);
        setAuthMode('verify');
      } else {
        setAuthMessage(`Numéro non trouvé. Veuillez vous inscrire.`);
      }
    } catch (err) { setAuthMessage(`Erreur réseau : ${err.message}`); }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setAuthMessage('Validation...');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/confirm-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneInput, code: codeInput })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setAuthMessage('');
      } else {
        setAuthMessage(`Code invalide (Essayez 123456)`);
      }
    } catch (err) { setAuthMessage(`Erreur réseau : ${err.message}`); }
  };

  const handleAddParcel = async (e) => {
    e.preventDefault();
    if (!newParcel.name || !newParcel.area_ha) return alert("Remplissez les champs requis");
    try {
      const res = await fetch(`${API_BASE_URL}/parcels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newParcel,
          area_ha: parseFloat(newParcel.area_ha),
          lat: parseFloat(newParcel.lat),
          lng: parseFloat(newParcel.lng)
        })
      });
      if (res.ok) {
        setNewParcel({ name: '', area_ha: '', crop_type: 'Mil', location: 'Moussoro', lat: '13.6405', lng: '16.4901' });
        fetchParcels();
      }
    } catch (e) { console.error(e); }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPost.author || !newPost.message) return alert("Remplissez les champs requis");
    try {
      const res = await fetch(`${API_BASE_URL}/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        setNewPost({ author: '', location: 'Moussoro', message: '' });
        fetchCommunity();
      }
    } catch (e) { console.error(e); }
  };

  const handleAnalyzePlant = async () => {
    if (!selectedImage) return alert("Sélectionnez une photo.");
    setLoadingImage(true);
    setPlantDiagnosis('');
    const formData = new FormData();
    formData.append('file', selectedImage);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-plant-image`, { method: 'POST', body: formData });
      const data = await response.json();
      setPlantDiagnosis(response.ok ? data.diagnosis : `Erreur : ${data.detail || "Problème d'analyse"}`);
    } catch (error) { setPlantDiagnosis(`Erreur : ${error.message}`); }
    finally { setLoadingImage(false); }
  };

  const handleTranscribeAudio = async () => {
    if (!selectedAudio) return alert("Sélectionnez un fichier audio.");
    setLoadingAudio(true);
    setTranscription('');
    const formData = new FormData();
    formData.append('file', selectedAudio);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/voice-to-text`, { method: 'POST', body: formData });
      const data = await response.json();
      setTranscription(response.ok ? data.text : `Erreur : ${data.detail || "Problème de transcription"}`);
    } catch (error) { setTranscription(`Erreur : ${error.message}`); }
    finally { setLoadingAudio(false); }
  };

  // Si l'utilisateur n'est pas connecté, afficher l'écran d'Authentification
  if (!user) {
    return (
      <div className="container">
        <header className="header">
          <h1>🌱 Tumaï Green Sahel</h1>
          <p>Connexion & Inscription Agriculteur</p>
        </header>

        <section className="card">
          {authMode === 'login' && (
            <div>
              <h2>📱 Connexion par Téléphone</h2>
              <form onSubmit={handleLogin} className="form-grid">
                <input 
                  type="text" 
                  placeholder="Numéro de téléphone (ex: +23560646072)" 
                  value={phoneInput} 
                  onChange={(e) => setPhoneInput(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">Recevoir le code</button>
              </form>
              <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                Pas encore de compte ? <button onClick={() => { setAuthMode('register'); setAuthMessage(''); }} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 'bold', cursor: 'pointer' }}>S'inscrire</button>
              </p>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <h2>📝 Inscription par Téléphone</h2>
              <form onSubmit={handleRegister} className="form-grid">
                <input 
                  type="text" 
                  placeholder="Nom complet" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Numéro de téléphone (ex: +23560646072)" 
                  value={phoneInput} 
                  onChange={(e) => setPhoneInput(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">S'inscrire</button>
              </form>
              <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                Déjà un compte ? <button onClick={() => { setAuthMode('login'); setAuthMessage(''); }} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
              </p>
            </div>
          )}

          {authMode === 'verify' && (
            <div>
              <h2>🔑 Entrer le Code de Vérification</h2>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>Entrez le code reçu par SMS (Code de test : <strong>123456</strong>)</p>
              <form onSubmit={handleVerifyCode} className="form-grid">
                <input 
                  type="text" 
                  placeholder="Code à 6 chiffres (ex: 123456)" 
                  value={codeInput} 
                  onChange={(e) => setCodeInput(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">Valider le Code</button>
              </form>
            </div>
          )}

          {authMessage && <div className="result-box" style={{ marginTop: '15px' }}><p>{authMessage}</p></div>}
        </section>
      </div>
    );
  }

  // Interface principale une fois connecté
  return (
    <div className="container">
      <header className="header">
        <h1>🌱 Tumaï Green Sahel</h1>
        <p>Bienvenue, <strong>{user.full_name}</strong> | <button onClick={() => setUser(null)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold' }}>Déconnexion</button></p>
      </header>

      <nav className="nav-tabs">
        <button className={activeTab === 'ia' ? 'active' : ''} onClick={() => setActiveTab('ia')}>🤖 IA</button>
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>🗺️ Carte</button>
        <button className={activeTab === 'weather' ? 'active' : ''} onClick={() => setActiveTab('weather')}>🌤️ Météo</button>
        <button className={activeTab === 'parcels' ? 'active' : ''} onClick={() => setActiveTab('parcels')}>🌴 Parcelles</button>
        <button className={activeTab === 'trainings' ? 'active' : ''} onClick={() => setActiveTab('trainings')}>📚 Formations</button>
        <button className={activeTab === 'community' ? 'active' : ''} onClick={() => setActiveTab('community')}>💬 Communauté</button>
      </nav>

      <main className="main-content">
        {activeTab === 'ia' && (
          <div>
            <section className="card">
              <h2>📸 Diagnostic Plante par Image</h2>
              <input type="file" accept="image/*" capture="environment" id="cameraInput" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); setPlantDiagnosis(''); }
              }} style={{ display: 'none' }} />
              <div className="button-group">
                <button className="btn btn-secondary" onClick={() => document.getElementById('cameraInput').click()}>📷 Capturer une Photo</button>
                {selectedImage && <button className="btn btn-primary" onClick={handleAnalyzePlant} disabled={loadingImage}>{loadingImage ? "Analyse..." : "🔍 Analyser"}</button>}
              </div>
              {imagePreview && <div className="preview-container"><img src={imagePreview} alt="Aperçu" className="image-preview" /></div>}
              {plantDiagnosis && <div className="result-box"><h3>Diagnostic :</h3><p>{plantDiagnosis}</p></div>}
            </section>

            <section className="card">
              <h2>🎙️ Transcription Vocale</h2>
              <input type="file" accept="audio/*" id="audioInput" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setSelectedAudio(f); setTranscription(''); }
              }} style={{ display: 'none' }} />
              <div className="button-group">
                <button className="btn btn-secondary" onClick={() => document.getElementById('audioInput').click()}>🎤 Message Audio</button>
                {selectedAudio && <button className="btn btn-primary" onClick={handleTranscribeAudio} disabled={loadingAudio}>{loadingAudio ? "Transcription..." : "📝 Transcrire"}</button>}
              </div>
              {transcription && <div className="result-box"><h3>Résultat :</h3><p>{transcription}</p></div>}
            </section>
          </div>
        )}

        {activeTab === 'map' && (
          <section className="card">
            <h2>🗺️ Cartographie Satellite des Parcelles</h2>
            <div className="map-wrapper">
              <MapContainer center={[13.6405, 16.4901]} zoom={13} scrollWheelZoom={false} style={{ height: "350px", width: "100%", borderRadius: "8px" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {parcels.map((p) => (
                  <Marker key={p.id} position={[p.lat || 13.6405, p.lng || 16.4901]}>
                    <Popup>
                      <strong>{p.name}</strong><br />
                      Culture: {p.crop_type}<br />
                      Superficie: {p.area_ha} ha
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}

        {activeTab === 'weather' && (
          <div>
            {weather ? (
              <div>
                <section className="card weather-card">
                  <h2>🌤️ Météo Locale - {weather.location}</h2>
                  <div className="weather-grid">
                    <div className="weather-item">
                      <span className="weather-label">Température</span>
                      <span className="weather-value">{weather.temperature}</span>
                    </div>
                    <div className="weather-item">
                      <span className="weather-label">Humidité</span>
                      <span className="weather-value">{weather.humidity}</span>
                    </div>
                    <div className="weather-item">
                      <span className="weather-label">Vent</span>
                      <span className="weather-value">{weather.wind}</span>
                    </div>
                    <div className="weather-item">
                      <span className="weather-label">Conditions</span>
                      <span className="weather-value">{weather.condition}</span>
                    </div>
                  </div>
                </section>

                <section className="card">
                  <h2>⚠️ Alertes Agricoles & Conseils Climat</h2>
                  {weather.alerts.map((alert) => (
                    <div key={alert.id} className={`alert-card severity-${alert.severity.toLowerCase()}`}>
                      <div className="alert-header">
                        <strong>{alert.type}</strong> - <span className="badge-alert">{alert.severity}</span>
                      </div>
                      <p>{alert.message}</p>
                    </div>
                  ))}
                </section>
              </div>
            ) : (
              <p>Chargement des données météo...</p>
            )}
          </div>
        )}

        {activeTab === 'parcels' && (
          <div>
            <section className="card">
              <h2>➕ Ajouter une Parcelle avec GPS</h2>
              <form onSubmit={handleAddParcel} className="form-grid">
                <input type="text" placeholder="Nom de la parcelle" value={newParcel.name} onChange={(e) => setNewParcel({...newParcel, name: e.target.value})} required />
                <input type="number" step="0.1" placeholder="Superficie (ha)" value={newParcel.area_ha} onChange={(e) => setNewParcel({...newParcel, area_ha: e.target.value})} required />
                <select value={newParcel.crop_type} onChange={(e) => setNewParcel({...newParcel, crop_type: e.target.value})}>
                  <option value="Mil">Mil / Sorgho</option>
                  <option value="Sésame">Sésame</option>
                  <option value="Maïs">Maïs</option>
                  <option value="Arachide">Arachide</option>
                  <option value="Maraîchage">Maraîchage</option>
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" step="0.0001" placeholder="Latitude" value={newParcel.lat} onChange={(e) => setNewParcel({...newParcel, lat: e.target.value})} required />
                  <input type="number" step="0.0001" placeholder="Longitude" value={newParcel.lng} onChange={(e) => setNewParcel({...newParcel, lng: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary">Enregistrer la Parcelle</button>
              </form>
            </section>

            <section className="card">
              <h2>🌴 Mes Parcelles ({parcels.length})</h2>
              {parcels.map((p) => (
                <div key={p.id} className="item-card">
                  <h3>{p.name}</h3>
                  <p><strong>Superficie:</strong> {p.area_ha} ha | <strong>Culture:</strong> {p.crop_type}</p>
                  <p><strong>GPS:</strong> {p.lat}, {p.lng} | <span className="badge">{p.status}</span></p>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'trainings' && (
          <section className="card">
            <h2>📚 Fiches & Guides Agro-Écologiques</h2>
            {trainings.map((t) => (
              <div key={t.id} className="item-card">
                <span className="category-tag">{t.category}</span>
                <h3>{t.title}</h3>
                <p>{t.summary}</p>
                <small>⏱️ Durée : {t.duration}</small>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'community' && (
          <div>
            <section className="card">
              <h2>📢 Publier une Alerte</h2>
              <form onSubmit={handleAddPost} className="form-grid">
                <input type="text" placeholder="Votre nom" value={newPost.author} onChange={(e) => setNewPost({...newPost, author: e.target.value})} required />
                <textarea placeholder="Votre message ou alerte..." value={newPost.message} onChange={(e) => setNewPost({...newPost, message: e.target.value})} required />
                <button type="submit" className="btn btn-primary">Publier</button>
              </form>
            </section>

            <section className="card">
              <h2>💬 Fil Communautaire</h2>
              {communityPosts.map((post) => (
                <div key={post.id} className="item-card">
                  <div className="post-header">
                    <strong>{post.author}</strong> ({post.location}) - <small>{post.date}</small>
                  </div>
                  <p>{post.message}</p>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
