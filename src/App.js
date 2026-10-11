import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sahelclimate-api.onrender.com";

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

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
        alert("Parcelle enregistrée avec succès !");
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

  return (
    <div className="app-viewport">
      {/* En-tête Style Mobile App */}
      <header className="app-bar">
        <div className="brand">
          <span className="brand-icon">🌱</span>
          <div>
            <h1 className="brand-title">Tumaï Green Sahel</h1>
            <p className="brand-sub">Moussoro, Barh El Gazel</p>
          </div>
        </div>
        {currentScreen !== 'home' && (
          <button className="back-btn" onClick={() => setCurrentScreen('home')}>⬅️ Retour</button>
        )}
      </header>

      {/* Contenu de la Page */}
      <main className="app-body">
        {/* PAGE D'ACCUEIL / DASHBOARD */}
        {currentScreen === 'home' && (
          <div className="screen-fade">
            {/* Widget Météo Rapide */}
            {weather && (
              <div className="weather-widget" onClick={() => setCurrentScreen('weather')}>
                <div className="weather-main">
                  <span className="weather-temp">{weather.temperature}</span>
                  <div>
                    <strong>{weather.condition}</strong>
                    <div className="weather-sub">Vent: {weather.wind} | Humidité: {weather.humidity}</div>
                  </div>
                </div>
                <span className="widget-arrow">➔</span>
              </div>
            )}

            <h2 className="section-heading">Services & Options</h2>

            {/* Grille de Cartes Modernes */}
            <div className="action-grid">
              <div className="action-card card-ia" onClick={() => setCurrentScreen('ia')}>
                <div className="card-icon">🤖</div>
                <h3>Diagnostic IA</h3>
                <p>Analyse maladie & voix</p>
              </div>

              <div className="action-card card-parcels" onClick={() => setCurrentScreen('parcels')}>
                <div className="card-icon">🌴</div>
                <h3>Mes Parcelles</h3>
                <p>{parcels.length} champs enregistrés</p>
              </div>

              <div className="action-card card-map" onClick={() => setCurrentScreen('map')}>
                <div className="card-icon">🗺️</div>
                <h3>Carte GPS</h3>
                <p>Vue satellite des parcelles</p>
              </div>

              <div className="action-card card-weather" onClick={() => setCurrentScreen('weather')}>
                <div className="card-icon">🌤️</div>
                <h3>Météo & Climat</h3>
                <p>Alertes agricoles</p>
              </div>

              <div className="action-card card-trainings" onClick={() => setCurrentScreen('trainings')}>
                <div className="card-icon">📚</div>
                <h3>Formations</h3>
                <p>Guides & Agro-écologie</p>
              </div>

              <div className="action-card card-community" onClick={() => setCurrentScreen('community')}>
                <div className="card-icon">💬</div>
                <h3>Communauté</h3>
                <p>Fil d'échange local</p>
              </div>
            </div>
          </div>
        )}

        {/* ÉCRAN DIAGNOSTIC IA */}
        {currentScreen === 'ia' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>📸 Diagnostic Plante par Photo</h2>
              <p>Photographiez une culture atteinte pour obtenir un traitement écologique instantané.</p>
              <input type="file" accept="image/*" capture="environment" id="cameraInput" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); setPlantDiagnosis(''); }
              }} style={{ display: 'none' }} />
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => document.getElementById('cameraInput').click()}>📷 Prendre / Choisir une photo</button>
                {selectedImage && <button className="btn btn-main" onClick={handleAnalyzePlant} disabled={loadingImage}>{loadingImage ? "Analyse..." : "🔍 Lancer l'Analyse"}</button>}
              </div>
              {imagePreview && <div className="preview-box"><img src={imagePreview} alt="Aperçu" /></div>}
              {plantDiagnosis && <div className="result-card"><h4>Résultat du Diagnostic :</h4><p>{plantDiagnosis}</p></div>}
            </section>

            <section className="module-section" style={{ marginTop: '20px' }}>
              <h2>🎙️ Assistant Vocal Agricole</h2>
              <p>Posez une question en langue locale par message vocal.</p>
              <input type="file" accept="audio/*" id="audioInput" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setSelectedAudio(f); setTranscription(''); }
              }} style={{ display: 'none' }} />
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => document.getElementById('audioInput').click()}>🎤 Enregistrer un Vocal</button>
                {selectedAudio && <button className="btn btn-main" onClick={handleTranscribeAudio} disabled={loadingAudio}>{loadingAudio ? "Transcription..." : "📝 Transcrire"}</button>}
              </div>
              {transcription && <div className="result-card"><h4>Texte transcrit :</h4><p>{transcription}</p></div>}
            </section>
          </div>
        )}

        {/* ÉCRAN CARTOGRAPHIE */}
        {currentScreen === 'map' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>🗺️ Carte GPS Satellite</h2>
              <p>Visualisation des parcelles géolocalisées à Moussoro / Barh El Gazel</p>
              <div className="map-container-box">
                <MapContainer center={[13.6405, 16.4901]} zoom={13} scrollWheelZoom={false} style={{ height: "380px", width: "100%", borderRadius: "12px" }}>
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
          </div>
        )}

        {/* ÉCRAN MÉTÉO */}
        {currentScreen === 'weather' && weather && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>🌤️ Météo & Climat - {weather.location}</h2>
              <div className="weather-detail-grid">
                <div className="stat-box"><span className="stat-label">Température</span><span className="stat-val">{weather.temperature}</span></div>
                <div className="stat-box"><span className="stat-label">Humidité</span><span className="stat-val">{weather.humidity}</span></div>
                <div className="stat-box"><span className="stat-label">Vent</span><span className="stat-val">{weather.wind}</span></div>
                <div className="stat-box"><span className="stat-label">Ciel</span><span className="stat-val">{weather.condition}</span></div>
              </div>
            </section>

            <section className="module-section" style={{ marginTop: '15px' }}>
              <h2>⚠️ Alertes Agricoles</h2>
              {weather.alerts.map((alert) => (
                <div key={alert.id} className={`alert-box alert-${alert.severity.toLowerCase()}`}>
                  <strong>{alert.type} ({alert.severity})</strong>
                  <p>{alert.message}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ÉCRAN PARCELLES */}
        {currentScreen === 'parcels' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>➕ Ajouter une Parcelle</h2>
              <form onSubmit={handleAddParcel} className="form-stack">
                <input type="text" placeholder="Nom du champ / parcelle" value={newParcel.name} onChange={(e) => setNewParcel({...newParcel, name: e.target.value})} required />
                <input type="number" step="0.1" placeholder="Superficie (en Hectares)" value={newParcel.area_ha} onChange={(e) => setNewParcel({...newParcel, area_ha: e.target.value})} required />
                <select value={newParcel.crop_type} onChange={(e) => setNewParcel({...newParcel, crop_type: e.target.value})}>
                  <option value="Mil">Mil / Sorgho</option>
                  <option value="Sésame">Sésame</option>
                  <option value="Maïs">Maïs</option>
                  <option value="Arachide">Arachide</option>
                  <option value="Maraîchage">Maraîchage</option>
                </select>
                <div className="geo-inputs">
                  <input type="number" step="0.0001" placeholder="Latitude" value={newParcel.lat} onChange={(e) => setNewParcel({...newParcel, lat: e.target.value})} required />
                  <input type="number" step="0.0001" placeholder="Longitude" value={newParcel.lng} onChange={(e) => setNewParcel({...newParcel, lng: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-main">Enregistrer la Parcelle</button>
              </form>
            </section>

            <section className="module-section" style={{ marginTop: '20px' }}>
              <h2>🌴 Vos Parcelles ({parcels.length})</h2>
              {parcels.map((p) => (
                <div key={p.id} className="list-item">
                  <div className="list-item-header">
                    <strong>{p.name}</strong>
                    <span className="pill-badge">{p.status}</span>
                  </div>
                  <p>{p.crop_type} • {p.area_ha} Ha • GPS: {p.lat}, {p.lng}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ÉCRAN FORMATIONS */}
        {currentScreen === 'trainings' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>📚 Guides Agro-Écologiques</h2>
              {trainings.map((t) => (
                <div key={t.id} className="list-item">
                  <span className="tag-pill">{t.category}</span>
                  <h3 style={{ margin: '5px 0' }}>{t.title}</h3>
                  <p>{t.summary}</p>
                  <small>⏱️ Lecture : {t.duration}</small>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ÉCRAN COMMUNAUTÉ */}
        {currentScreen === 'community' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>📢 Poster un Message ou Alerte</h2>
              <form onSubmit={handleAddPost} className="form-stack">
                <input type="text" placeholder="Votre Nom" value={newPost.author} onChange={(e) => setNewPost({...newPost, author: e.target.value})} required />
                <textarea placeholder="Partagez un conseil ou avertissement..." value={newPost.message} onChange={(e) => setNewPost({...newPost, message: e.target.value})} required />
                <button type="submit" className="btn btn-main">Publier</button>
              </form>
            </section>

            <section className="module-section" style={{ marginTop: '20px' }}>
              <h2>💬 Fil d'Échange Local</h2>
              {communityPosts.map((post) => (
                <div key={post.id} className="list-item">
                  <div className="list-item-header">
                    <strong>{post.author}</strong> ({post.location})
                    <small>{post.date}</small>
                  </div>
                  <p style={{ marginTop: '5px' }}>{post.message}</p>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>

      {/* Barre de Navigation Inférieure (Bottom Navigation Bar Mobile) */}
      <nav className="bottom-nav">
        <button className={currentScreen === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('home')}>
          <span>🏠</span>
          <span>Accueil</span>
        </button>
        <button className={currentScreen === 'parcels' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('parcels')}>
          <span>🌴</span>
          <span>Parcelles</span>
        </button>
        <button className={currentScreen === 'ia' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('ia')}>
          <span>🤖</span>
          <span>IA Diagnostic</span>
        </button>
        <button className={currentScreen === 'community' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('community')}>
          <span>💬</span>
          <span>Communauté</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
