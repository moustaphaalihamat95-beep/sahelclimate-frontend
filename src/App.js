import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sahelclimate-api.onrender.com";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sahel_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Formulaire d'inscription
  const [fullName, setFullName] = useState('Moustapha Ali Hamat');
  const [phone, setPhone] = useState('+23560646072');
  const [city, setCity] = useState('Moussoro');
  const [address, setAddress] = useState('Quartier Ouest'); // Optionnel
  const [email, setEmail] = useState(''); // Optionnel
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [channel, setChannel] = useState('sms'); // 'sms' ou 'email'

  // Vérification
  const [step, setStep] = useState('register'); // 'register', 'verify'
  const [codeInput, setCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('123456');
  const [targetDestination, setTargetDestination] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('weather');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setErrorMsg("Les mots de passe ne correspondent pas !");
    }
    if (channel === 'email' && !email) {
      return setErrorMsg("Veuillez remplir l'adresse e-mail pour recevoir le code par E-mail.");
    }
    
    setLoading(true);
    setErrorMsg('');

    const payload = {
      full_name: fullName,
      phone_number: phone,
      city: city,
      address: address,
      email: email,
      password: password,
      delivery_channel: channel
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const receivedCode = data.verification_code || "123456";
      setGeneratedCode(receivedCode);
      setCodeInput(receivedCode);
      setTargetDestination(data.target || (channel === 'sms' ? phone : email));
      setStep('verify');
    } catch (err) {
      setGeneratedCode("123456");
      setCodeInput("123456");
      setTargetDestination(channel === 'sms' ? phone : (email || phone));
      setStep('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newUser = {
      full_name: fullName,
      phone_number: phone,
      city: city,
      address: address,
      email: email
    };

    try {
      await fetch(`${API_BASE_URL}/auth/confirm-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetDestination, code: codeInput })
      });
    } catch (err) {}

    try {
      localStorage.setItem('sahel_user', JSON.stringify(newUser));
    } catch (err) {}

    setUser(newUser);
    setLoading(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sahel_user');
    } catch (e) {}
    setUser(null);
    setStep('register');
  };

  // ÉCRAN 1 : FORMULAIRE D'INSCRIPTION & VALIDATION
  if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '520px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#2e7d32', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🌾 SahelClimate-AI</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>Création de compte & Authentification</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
          {step === 'register' ? (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2>📝 Créer un Compte</h2>

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nom complet *</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Numéro de téléphone *</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Ville / Localité *</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Adresse complète / Quartier (Optionnel)</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Adresse e-mail (Optionnel)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Mot de passe *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Confirmer le mot de passe *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

              <div style={{ marginTop: '10px', background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  📩 Choisir le mode de réception du code :
                </label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="channel" value="sms" checked={channel === 'sms'} onChange={() => setChannel('sms')} /> 📱 SMS (Téléphone)
                  </label>
                  <label style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="channel" value="email" checked={channel === 'email'} onChange={() => setChannel('email')} /> 📧 E-mail
                  </label>
                </div>
              </div>

              {errorMsg && <p style={{ color: '#d32f2f', fontSize: '0.85rem', margin: 0 }}>{errorMsg}</p>}

              <button type="submit" disabled={loading} style={{ background: '#2e7d32', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                {loading ? "Envoi..." : "S'inscrire / Recevoir le Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2>🔑 Saisir le Code de Validation</h2>
              <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
                Code envoyé par <strong>{channel.toUpperCase()}</strong> à : <strong>{targetDestination}</strong>
              </p>

              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '6px', fontSize: '0.9rem' }}>
                💡 Code de validation généré : <strong style={{ fontSize: '1.2rem' }}>{generatedCode}</strong>
              </div>

              <input 
                type="text" 
                value={codeInput} 
                onChange={(e) => setCodeInput(e.target.value)} 
                required 
                style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1.3rem', textAlign: 'center', letterSpacing: '4px' }} 
              />

              <button type="submit" disabled={loading} style={{ background: '#2e7d32', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? "Validation..." : "Valider mon Compte"}
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
