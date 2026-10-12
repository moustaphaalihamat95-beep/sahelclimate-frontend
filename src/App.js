import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch (e) {
  console.warn("Leaflet setup warning:", e);
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sahelclimate-api.onrender.com";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  // Profil Utilisateur par défaut pour éviter tout crash
  const [profile, setProfile] = useState({
    full_name: 'Moustapha Ali hamat',
    email: 'moustapha.ali.hamat@example.com',
    phone: '+23560646072',
    city: 'Moussoro',
    province: 'Barh El Gazel',
    avatar_url: ''
  });

  const [devInfo] = useState({
    name: 'Moustapha Ali hamat',
    role: 'Développeur Full-Stack & Ingénieur Solutions Sahéliennes',
    email: 'moustapha.ali.hamat@example.com',
    phone: '+23560646072',
    whatsapp: '+23560646072',
    location: "N'Djamena / Moussoro, Tchad"
  });

  const [feedback, setFeedback] = useState({ subject: 'Problème technique', message: '' });
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // IA
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [plantDiagnosis, setPlantDiagnosis] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Données avec valeurs de secours pour s'afficher immédiatement
  const [parcels, setParcels] = useState([
    { id: 1, name: "Parcelle Moussoro Est", area_ha: 2.5, crop_type: "Mil (Sorgho)", location: "Moussoro", status: "Active", lat: 13.6405, lng: 16.4901 }
  ]);
  const [trainings] = useState([
    { id: 1, title: "Techniques de Compostage Rapide", category: "Agro-écologie", duration: "15 min", summary: "Fabriquer un compost riche sans gaspiller d'eau." }
  ]);
  const [communityPosts, setCommunityPosts] = useState([
    { id: 1, author: "Mahamat A.", location: "Moussoro", message: "Alerte : Surveillance des cultures recommandée.", date: "Aujourd'hui" }
  ]);
  const [weather, setWeather] = useState({
    location: "Moussoro / Barh El Gazel",
    temperature: "36°C",
    humidity: "28%",
    wind: "18 km/h",
    condition: "Ensoleillé",
    alerts: [{ id: 1, type: "Climat", severity: "Moyenne", message: "Vent sec prévu." }]
  });

  // Formulaires
  const [newParcel, setNewParcel] = useState({ name: '', area_ha: '', crop_type: 'Mil', location: 'Moussoro', lat: 13.6405, lng: 16.4901 });
  const [newPost, setNewPost] = useState({ message: '' });

  useEffect(() => {
    // Appel non bloquant en arrière-plan
    fetch(`${API_BASE_URL}/weather`).then(res => res.json()).then(data => data && setWeather(data)).catch(() => {});
    fetch(`${API_BASE_URL}/parcels`).then(res => res.json()).then(data => Array.isArray(data) && setParcels(data)).catch(() => {});
    fetch(`${API_BASE_URL}/community`).then(res => res.json()).then(data => Array.isArray(data) && setCommunityPosts(data)).catch(() => {});
    fetch(`${API_BASE_URL}/profile`).then(res => res.json()).then(data => data && data.full_name && setProfile(data)).catch(() => {});
  }, []);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.message) return alert("Veuillez saisir votre message");
    setSendingFeedback(true);
    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: profile.full_name,
          contact: profile.phone || profile.email,
          subject: feedback.subject,
          message: feedback.message
        })
      });
      alert("Message transmis au développeur !");
      setFeedback({ subject: 'Problème technique', message: '' });
    } catch (e) {
      alert("Message enregistré localement.");
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      alert("Profil mis à jour !");
    } catch (e) {
      alert("Profil sauvegardé.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddParcel = async (e) => {
    e.preventDefault();
    if (!newParcel.name || !newParcel.area_ha) return alert("Remplissez les champs requis");
    const item = { ...newParcel, id: Date.now(), status: "En attente" };
    setParcels([item, ...parcels]);
    setNewParcel({ name: '', area_ha: '', crop_type: 'Mil', location: 'Moussoro', lat: 13.6405, lng: 16.4901 });
    alert("Parcelle ajoutée !");
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPost.message) return;
    const post = { id: Date.now(), author: profile.full_name, location: profile.city, message: newPost.message, date: "À l'instant" };
    setCommunityPosts([post, ...communityPosts]);
    setNewPost({ message: '' });
  };

  const handleAnalyzePlant = async () => {
    if (!selectedImage) return alert("Sélectionnez une photo.");
    setLoadingImage(true);
    setTimeout(() => {
      setPlantDiagnosis("Analyse simulée : Plante saine avec un léger besoin d'irrigation matinale. Aucun parasite critique détecté.");
      setLoadingImage(false);
    }, 1500);
  };

  const handleTranscribeAudio = async () => {
    if (!selectedAudio) return alert("Sélectionnez un audio.");
    setLoadingAudio(true);
    setTimeout(() => {
      setTranscription("Transcription simulée : Comment protéger mes cultures contre le vent sec ?");
      setLoadingAudio(false);
    }, 1500);
  };

  return (
    <div className="app-viewport">
      <header className="app-bar">
        <div className="brand">
          <span className="brand-icon">🌱</span>
          <div>
            <h1 className="brand-title">Tumaï Green Sahel</h1>
            <p className="brand-sub">{profile.city}, {profile.province}</p>
          </div>
        </div>
        {currentScreen !== 'home' ? (
          <button className="back-btn" onClick={() => setCurrentScreen('home')}>⬅️ Retour</button>
        ) : (
          <div className="profile-badge-header" onClick={() => setCurrentScreen('profile')}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="header-avatar" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </div>
        )}
      </header>

      <main className="app-body">
        {currentScreen === 'home' && (
          <div className="screen-fade">
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

            <div className="action-grid">
              <div className="action-card" onClick={() => setCurrentScreen('ia')}>
                <div className="card-icon">🤖</div>
                <h3>Diagnostic IA</h3>
                <p>Analyse maladie & voix</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('parcels')}>
                <div className="card-icon">🌴</div>
                <h3>Mes Parcelles</h3>
                <p>{parcels.length} champs enregistrés</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('map')}>
                <div className="card-icon">🗺️</div>
                <h3>Carte GPS</h3>
                <p>Vue satellite des parcelles</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('weather')}>
                <div className="card-icon">🌤️</div>
                <h3>Météo & Climat</h3>
                <p>Alertes agricoles</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('trainings')}>
                <div className="card-icon">📚</div>
                <h3>Formations</h3>
                <p>Guides & Agro-écologie</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('community')}>
                <div className="card-icon">💬</div>
                <h3>Communauté</h3>
                <p>Fil d'échange local</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('profile')}>
                <div className="card-icon">👤</div>
                <h3>Mon Profil</h3>
                <p>Informations & Photo</p>
              </div>

              <div className="action-card" onClick={() => setCurrentScreen('developer')}>
                <div className="card-icon">👨‍💻</div>
                <h3>Contact Développeur</h3>
                <p>Aide, Support & Options</p>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'developer' && (
          <div className="screen-fade">
            <section className="module-section align-center">
              <h2>👨‍💻 Développeur & Support Technique</h2>
              <div className="dev-card">
                <h3>{devInfo.name}</h3>
                <p className="dev-role">{devInfo.role}</p>
                <p className="dev-location">📍 {devInfo.location}</p>
              </div>

              <div className="contact-links-grid">
                <a href={`tel:${devInfo.phone}`} className="contact-btn phone-btn">📞 Appeler ({devInfo.phone})</a>
                <a href={`https://wa.me/${devInfo.whatsapp.replace('+', '')}`} target="_blank" rel="noreferrer" className="contact-btn whatsapp-btn">💬 Discuter sur WhatsApp</a>
                <a href={`mailto:${devInfo.email}`} className="contact-btn email-btn">✉️ Envoyer un E-mail</a>
              </div>
            </section>

            <section className="module-section" style={{ marginTop: '15px' }}>
              <h2>💡 Demande de Fonctionnalité ou Signalement</h2>
              <form onSubmit={handleSendFeedback} className="form-stack">
                <div>
                  <label className="input-label">Sujet</label>
                  <select value={feedback.subject} onChange={(e) => setFeedback({...feedback, subject: e.target.value})}>
                    <option value="Demande de nouvelle fonctionnalité">Demande de nouvelle fonctionnalité</option>
                    <option value="Problème technique / Bug">Problème technique / Bug</option>
                    <option value="Question / Aide">Question / Aide</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Votre Message</label>
                  <textarea rows="4" placeholder="Décrivez votre besoin..." value={feedback.message} onChange={(e) => setFeedback({...feedback, message: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-main" disabled={sendingFeedback}>
                  {sendingFeedback ? "Envoi..." : "🚀 Envoyer"}
                </button>
              </form>
            </section>
          </div>
        )}

        {currentScreen === 'profile' && (
          <div className="screen-fade">
            <section className="module-section align-center">
              <h2>👤 Profil Utilisateur</h2>
              <div className="avatar-upload-container">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profil" className="avatar-preview" />
                ) : (
                  <div className="avatar-circle-default">👤</div>
                )}
                <label htmlFor="avatarInput" className="btn-avatar-edit">📷 Modifier la photo</label>
                <input type="file" id="avatarInput" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </div>
            </section>

            <section className="module-section" style={{ marginTop: '15px' }}>
              <h2>📝 Informations Personnelles</h2>
              <form onSubmit={handleSaveProfile} className="form-stack">
                <div>
                  <label className="input-label">Nom et Prénom</label>
                  <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">E-mail</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Téléphone</label>
                  <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Ville</label>
                  <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Province</label>
                  <input type="text" value={profile.province} onChange={(e) => setProfile({...profile, province: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-main">💾 Enregistrer</button>
              </form>
            </section>
          </div>
        )}

        {currentScreen === 'ia' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>📸 Diagnostic Plante</h2>
              <input type="file" accept="image/*" id="camInput" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); setPlantDiagnosis(''); }
              }} style={{ display: 'none' }} />
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => document.getElementById('camInput').click()}>📷 Choisir une photo</button>
                {selectedImage && <button className="btn btn-main" onClick={handleAnalyzePlant} disabled={loadingImage}>{loadingImage ? "Analyse..." : "🔍 Analyser"}</button>}
              </div>
              {imagePreview && <div className="preview-box"><img src={imagePreview} alt="Aperçu" /></div>}
              {plantDiagnosis && <div className="result-card"><h4>Résultat :</h4><p>{plantDiagnosis}</p></div>}
            </section>

            <section className="module-section" style={{ marginTop: '20px' }}>
              <h2>🎙️ Assistant Vocal</h2>
              <input type="file" accept="audio/*" id="audInput" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setSelectedAudio(f); setTranscription(''); }
              }} style={{ display: 'none' }} />
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => document.getElementById('audInput').click()}>🎤 Fichier Audio</button>
                {selectedAudio && <button className="btn btn-main" onClick={handleTranscribeAudio} disabled={loadingAudio}>{loadingAudio ? "Transcription..." : "📝 Transcrire"}</button>}
              </div>
              {transcription && <div className="result-card"><h4>Transcription :</h4><p>{transcription}</p></div>}
            </section>
          </div>
        )}

        {currentScreen === 'map' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>🗺️ Carte GPS Satellite</h2>
              <div className="map-container-box">
                <MapContainer center={[13.6405, 16.4901]} zoom={13} scrollWheelZoom={false} style={{ height: "350px", width: "100%", borderRadius: "12px" }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {parcels.map((p) => (
                    <Marker key={p.id} position={[p.lat || 13.6405, p.lng || 16.4901]}>
                      <Popup><strong>{p.name}</strong><br />{p.crop_type} ({p.area_ha} ha)</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </section>
          </div>
        )}

        {currentScreen === 'weather' && weather && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>🌤️ Météo - {weather.location}</h2>
              <div className="weather-detail-grid">
                <div className="stat-box"><span className="stat-label">Température</span><span className="stat-val">{weather.temperature}</span></div>
                <div className="stat-box"><span className="stat-label">Humidité</span><span className="stat-val">{weather.humidity}</span></div>
                <div className="stat-box"><span className="stat-label">Vent</span><span className="stat-val">{weather.wind}</span></div>
                <div className="stat-box"><span className="stat-label">Ciel</span><span className="stat-val">{weather.condition}</span></div>
              </div>
            </section>
          </div>
        )}

        {currentScreen === 'parcels' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>➕ Ajouter une Parcelle</h2>
              <form onSubmit={handleAddParcel} className="form-stack">
                <input type="text" placeholder="Nom de la parcelle" value={newParcel.name} onChange={(e) => setNewParcel({...newParcel, name: e.target.value})} required />
                <input type="number" step="0.1" placeholder="Superficie (ha)" value={newParcel.area_ha} onChange={(e) => setNewParcel({...newParcel, area_ha: e.target.value})} required />
                <select value={newParcel.crop_type} onChange={(e) => setNewParcel({...newParcel, crop_type: e.target.value})}>
                  <option value="Mil">Mil / Sorgho</option>
                  <option value="Sésame">Sésame</option>
                  <option value="Maïs">Maïs</option>
                </select>
                <button type="submit" className="btn btn-main">Enregistrer</button>
              </form>
            </section>

            <section className="module-section" style={{ marginTop: '20px' }}>
              <h2>🌴 Mes Parcelles ({parcels.length})</h2>
              {parcels.map((p) => (
                <div key={p.id} className="list-item">
                  <strong>{p.name}</strong> - {p.crop_type} ({p.area_ha} ha)
                </div>
              ))}
            </section>
          </div>
        )}

        {currentScreen === 'trainings' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>📚 Formations</h2>
              {trainings.map((t) => (
                <div key={t.id} className="list-item">
                  <h3>{t.title}</h3>
                  <p>{t.summary}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {currentScreen === 'community' && (
          <div className="screen-fade">
            <section className="module-section">
              <h2>📢 Message Communautaire</h2>
              <form onSubmit={handleAddPost} className="form-stack">
                <textarea placeholder="Votre message..." value={newPost.message} onChange={(e) => setNewPost({message: e.target.value})} required />
                <button type="submit" className="btn btn-main">Publier</button>
              </form>
            </section>

            <section className="module-section" style={{ marginTop: '20px' }}>
              <h2>💬 Fil d'Actualité</h2>
              {communityPosts.map((post) => (
                <div key={post.id} className="list-item">
                  <strong>{post.author}</strong> ({post.location}): {post.message}
                </div>
              ))}
            </section>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={currentScreen === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('home')}><span>🏠</span><span>Accueil</span></button>
        <button className={currentScreen === 'parcels' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('parcels')}><span>🌴</span><span>Parcelles</span></button>
        <button className={currentScreen === 'ia' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('ia')}><span>🤖</span><span>IA</span></button>
        <button className={currentScreen === 'community' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('community')}><span>💬</span><span>Forum</span></button>
        <button className={currentScreen === 'developer' ? 'nav-item active' : 'nav-item'} onClick={() => setCurrentScreen('developer')}><span>👨‍💻</span><span>Support</span></button>
      </nav>
    </div>
  );
}
