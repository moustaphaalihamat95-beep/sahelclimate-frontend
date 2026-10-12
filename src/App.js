import React, { useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sahel_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [nameInput, setNameInput] = useState('Moustapha Ali Hamat');
  const [phoneInput, setPhoneInput] = useState('+23560646072');
  const [cityInput, setCityInput] = useState('Moussoro');
  const [addressInput, setAddressInput] = useState('Quartier Ouest');
  const [codeInput, setCodeInput] = useState('123456');
  
  const [step, setStep] = useState('phone');
  const [activeTab, setActiveTab] = useState('weather');

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setStep('code');
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const newUser = {
      full_name: nameInput || "Agriculteur Sahel",
      phone_number: phoneInput || "+23560000000",
      city: cityInput || "Moussoro",
      address: addressInput || "Quartier Centre"
    };
    try {
      localStorage.setItem('sahel_user', JSON.stringify(newUser));
    } catch (err) {}
    setUser(newUser);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sahel_user');
    } catch (e) {}
    setUser(null);
    setStep('phone');
  };

  // ÉCRAN 1 : CONNEXION / INSCRIPTION
  if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#2e7d32', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🌾 SahelClimate-AI</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>Plateforme Agricole du Sahel</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
          {step === 'phone' ? (
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2>📝 Inscription / Identification</h2>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nom complet *</label>
              <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Numéro de Téléphone *</label>
              <input type="text" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Ville / Localité *</label>
              <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Adresse / Quartier *</label>
              <input type="text" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <button type="submit" style={{ background: '#2e7d32', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Obtenir le Code de Validation
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2>🔑 Saisir le Code SMS</h2>
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
                💡 Code de test par défaut : <strong>123456</strong>
              </div>
              <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1.2rem', textAlign: 'center' }} />
              
              <button type="submit" style={{ background: '#2e7d32', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Valider et Accéder au Tableau de Bord
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ÉCRAN 2 : TABLEAU DE BORD STABLE
  return (
    <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#2e7d32', color: '#fff', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem' }}>🌾 SahelClimate-AI</h1>
          <small>👤 {user.full_name} ({user.city})</small>
        </div>
        <button onClick={handleLogout} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Déconnexion
        </button>
      </header>

      <div style={{ display: 'flex', gap: '8px', margin: '15px 0', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('weather')} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', background: activeTab === 'weather' ? '#2e7d32' : '#e0e0e0', color: activeTab === 'weather' ? '#fff' : '#000', cursor: 'pointer', fontWeight: 'bold' }}>🌤️ Météo</button>
        <button onClick={() => setActiveTab('parcels')} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', background: activeTab === 'parcels' ? '#2e7d32' : '#e0e0e0', color: activeTab === 'parcels' ? '#fff' : '#000', cursor: 'pointer', fontWeight: 'bold' }}>🌴 Parcelles</button>
        <button onClick={() => setActiveTab('trainings')} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', background: activeTab === 'trainings' ? '#2e7d32' : '#e0e0e0', color: activeTab === 'trainings' ? '#fff' : '#000', cursor: 'pointer', fontWeight: 'bold' }}>📚 Formations</button>
        <button onClick={() => setActiveTab('community')} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', background: activeTab === 'community' ? '#2e7d32' : '#e0e0e0', color: activeTab === 'community' ? '#fff' : '#000', cursor: 'pointer', fontWeight: 'bold' }}>💬 Communauté</button>
      </div>

      <main style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        {activeTab === 'weather' && (
          <div>
            <h2>🌤️ Météo Locale - {user.city}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
              <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}><strong>Température:</strong> 36°C</div>
              <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}><strong>Humidité:</strong> 28%</div>
              <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}><strong>Vent:</strong> 18 km/h (Harmattan)</div>
              <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}><strong>Condition:</strong> Ensoleillé</div>
            </div>
          </div>
        )}

        {activeTab === 'parcels' && (
          <div>
            <h2>🌴 Mes Parcelles Agricoles</h2>
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #2e7d32', marginTop: '10px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>Parcelle Moussoro Est</h3>
              <p style={{ margin: 0 }}>Superficie : 2.5 ha | Culture : Mil / Sorgho | Statut : Irrigation active</p>
            </div>
          </div>
        )}

        {activeTab === 'trainings' && (
          <div>
            <h2>📚 Fiches Agro-Écologiques</h2>
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>Techniques de Compostage Rapide</h3>
              <p style={{ margin: 0 }}>Guide pratique pour fabriquer du compost riche sans gaspiller d'eau au Sahel.</p>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div>
            <h2>💬 Fil Communautaire</h2>
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
              <strong>Mahamat A. (Moussoro)</strong>
              <p style={{ margin: '5px 0 0 0' }}>Alerte : Détection de chenilles sur les cultures au sud du canton.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
