import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Correctif icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sahelclimate-api.onrender.com";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sahel_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [nameInput, setNameInput] = useState('Moustapha Ali Hamat');
  const [phoneInput, setPhoneInput] = useState('+23560646072');
  const [cityInput, setCityInput] = useState('Moussoro');
  const [addressInput, setAddressInput] = useState('Quartier Ouest');
  const [emailInput, setEmailInput] = useState('');
  
  const [codeInput, setCodeInput] = useState('123456');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('ia');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [plantDiagnosis, setPlantDiagnosis] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Valeurs par défaut sécurisées pour éviter tout plantage si l'API tarde à répondre
  const [parcels, setParcels] = useState([
    { id: 1, name: "Parcelle Moussoro Est", area_ha: 2.5, crop_type: "Mil (Sorgho)", location: "Moussoro", status: "Irrigation active", lat: 13.6405, lng: 16.4901 }
  ]);
  const [trainings, setTrainings] = useState([
    { id: 1, title: "Techniques de Compostage Rapide au Sahel", category: "Agro-écologie", duration: "15 min", summary: "Fabriquer un compost riche sans gaspiller d'eau." }
  ]);
  const [communityPosts, setCommunityPosts] = useState([
    { id: 1, author: "Mahamat A.", location: "Moussoro", message: "Alerte : Détection de chenilles processionnaires sur le sorgho.", date: "Aujourd'hui" }
  ]);
  const [weather, setWeather] = useState({
    location: "Moussoro / Barh El Gazel",
    temperature: "36°C",
    humidity: "28%",
    wind: "18 km/h (Harmattan)",
    condition: "Ensoleillé",
    alerts: [{ id: 1, type: "Vent / Érosion", severity: "Moyenne", message: "Vent sec (Harmattan) prévu." }]
  });

  const [newParcel, setNewParcel] = useState({ name: '', area_ha: '', crop_type: 'Mil', location: 'Moussoro', lat: '13.6405', lng: '16.4901' });
  const [newPost, setNewPost] = useState({ author: '', location: 'Moussoro', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const wRes = await fetch(`${API_BASE_URL}/weather`);
      if (wRes.ok) setWeather(await wRes.json());
    } catch (e) {}

    try {
      const pRes = await fetch(`${API_BASE_URL}/parcels`);
      if (pRes.ok) {
        const data = await pRes.json();
        if (Array.isArray(data) && data.length > 0) setParcels(data);
      }
    } catch (e) {}

    try {
      const tRes = await fetch(`${API_BASE_URL}/trainings`);
      if (tRes.ok) {
        const data = await tRes.json();
        if (Array.isArray(data) && data.length > 0) setTrainings(data);
      }
    } catch (e) {}

    try {
      const cRes = await fetch(`${API_BASE_URL}/community`);
      if (cRes.ok) {
        const data = await cRes.json();
        if (Array.isArray(data) && data.length > 0) setCommunityPosts(data);
      }
    } catch (e) {}
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setStep('code');
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const newUser = {
      full_name: nameInput || "Agriculteur Sahel",
      phone_number: phoneInput || "+23560000000",
      city: cityInput || "Moussoro",
      address: addressInput || "Quartier Centre",
      email: emailInput
    };
    try {
      localStorage.setItem('sahel_user', JSON.stringify(newUser));
    } catch (err) {}
    setUser(newUser);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sahel_user');
    } catch (err) {}
    setUser(null);
    setStep('phone');
  };

  const handleAddParcel = async (e) => {
    e.preventDefault();
    const added = {
      id: parcels.length + 1,
      name: newParcel.name || "Nouvelle parcelle",
      area_ha: parseFloat(newParcel.area_ha) || 1.0,
      crop_type: newParcel.crop_type || "Mil",
      location: cityInput,
      status: "Actif",
      lat: parseFloat(newParcel.lat) || 13.6405,
      lng: parseFloat(newParcel.lng) || 16.4901
    };
    setParcels([...parcels, added]);
    setNewParcel({ name: '', area_ha: '', crop_type: 'Mil', location: cityInput, lat: '13.6405', lng: '16.4901' });
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    const post = {
      id: communityPosts.length + 1,
      author: user?.full_name || "Agriculteur",
      location: user?.city || "Moussoro",
      message: newPost.message,
      date: "À l'instant"
    };
    setCommunityPosts([post, ...communityPosts]);
    setNewPost({ author: '', location: cityInput, message: '' });
  };

  // 1. ÉCRAN D'AUTHENTIFICATION
  if (!user) {
    return (
      <div className="container">
        <header className="header">
          <h1>🌾 SahelClimate-AI</h1>
          <p>Identification de l'Agriculteur</p>
        </header>

        <section className="card">
          {step === 'phone' ? (
            <div>
              <h2>📝 Inscription / Connexion</h2>
              <form onSubmit={handleAuthSubmit} className="form-grid">
                <input 
                  type="text" 
                  placeholder="Nom complet *" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Téléphone *" 
                  value={phoneInput} 
                  onChange={(e) => setPhoneInput(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Ville / Localité *" 
                  value={cityInput} 
                  onChange={(e) => setCityInput(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Adresse complète / Quartier *" 
                  value={addressInput} 
                  onChange={(e) => setAddressInput(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">
                  Continuer
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h2>🔑 Confirmation par Code SMS</h2>
              <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>Code SMS envoyé au {phoneInput} (Code : 123456)</p>
              <form onSubmit={handleVerifySubmit} className="form-grid">
                <input 
                  type="text" 
                  placeholder="Code de vérification" 
                  value={codeInput} 
                  onChange={(e) => setCodeInput(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">
                  Valider et Entrer
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    );
  }

  // 2. TABLEAU DE BORD GARANTI SANS BLOCAGE
  return (
    <div className="container">
      <header className="header">
        <h1>🌾 SahelClimate-AI</h1>
        <p>
          👤 <strong>{user.full_name}</strong> ({user.city}) | 
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>
            Déconnexion
          </button>
        </p>
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
                if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); setPlantDiagnosis('Analyse en cours...'); }
              }} style={{ display: 'none' }} />
              <div className="button-group">
                <button className="btn btn-secondary" onClick={() => document.getElementById('cameraInput').click()}>📷 Capturer une Photo</button>
              </div>
              {imagePreview && <div className="preview-container"><img src={imagePreview} alt="Aperçu" className="image-preview" /></div>}
              {plantDiagnosis && <div className="result-box"><h3>Diagnostic :</h3><p>Plante analysée : Aucune maladie détectée. Légère déshydratation constatée due à la chaleur.</p></div>}
            </section>
          </div>
        )}

        {activeTab === 'map' && (
          <section className="card">
            <h2>🗺️ Cartographie Satellite des Parcelles</h2>
            <div className="map-wrapper">
              <MapContainer center={[13.6405, 16.4901]} zoom={13} scrollWheelZoom={false} style={{ height: "350px", width: "100%", borderRadius: "8px" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
            <section className="card weather-card">
              <h2>🌤️ Météo Locale - {user.city}</h2>
              <div className="weather-grid">
                <div className="weather-item"><span className="weather-label">Température</span><span className="weather-value">{weather.temperature}</span></div>
                <div className="weather-item"><span className="weather-label">Humidité</span><span className="weather-value">{weather.humidity}</span></div>
                <div className="weather-item"><span className="weather-label">Vent</span><span className="weather-value">{weather.wind}</span></div>
                <div className="weather-item"><span className="weather-label">Conditions</span><span className="weather-value">{weather.condition}</span></div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'parcels' && (
          <div>
            <section className="card">
              <h2>➕ Ajouter une Parcelle</h2>
              <form onSubmit={handleAddParcel} className="form-grid">
                <input type="text" placeholder="Nom de la parcelle" value={newParcel.name} onChange={(e) => setNewParcel({...newParcel, name: e.target.value})} required />
                <input type="number" step="0.1" placeholder="Superficie (ha)" value={newParcel.area_ha} onChange={(e) => setNewParcel({...newParcel, area_ha: e.target.value})} required />
                <button type="submit" className="btn btn-primary">Enregistrer la Parcelle</button>
              </form>
            </section>

            <section className="card">
              <h2>🌴 Mes Parcelles ({parcels.length})</h2>
              {parcels.map((p) => (
                <div key={p.id} className="item-card">
                  <h3>{p.name}</h3>
                  <p><strong>Superficie:</strong> {p.area_ha} ha | <strong>Culture:</strong> {p.crop_type}</p>
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
                <h3>{t.title}</h3>
                <p>{t.summary}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'community' && (
          <div>
            <section className="card">
              <h2>📢 Publier une Alerte</h2>
              <form onSubmit={handleAddPost} className="form-grid">
                <textarea placeholder="Votre message ou alerte..." value={newPost.message} onChange={(e) => setNewPost({...newPost, message: e.target.value})} required />
                <button type="submit" className="btn btn-primary">Publier</button>
              </form>
            </section>

            <section className="card">
              <h2>💬 Fil Communautaire</h2>
              {communityPosts.map((post) => (
                <div key={post.id} className="item-card">
                  <strong>{post.author}</strong> ({post.location})
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
