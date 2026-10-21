'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabase';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
      Chargement du SIG & Imagerie Satellite...
    </div>
  )
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('welcome'); // 'welcome', 'login', 'register', 'verify'
  
  // Champs Formulaires
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState("N'Djamena");
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeModule, setActiveModule] = useState(null);

  // Vérification de la session au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('sahel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Formatage international +235
  const formatPhone = (input) => {
    let cleaned = input.trim();
    if (!cleaned.startsWith('+')) {
      cleaned = '+235' + cleaned.replace(/^0+/, '');
    }
    return cleaned;
  };

  // 1. Inscription (Envoi SMS)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formatted = formatPhone(phone);
      const { data, error } = await supabase.auth.signUp({
        phone: formatted,
        password: password,
        options: {
          data: { full_name: fullName, city: city }
        }
      });

      if (error) throw error;
      setLoading(false);
      setAuthMode('verify');
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'inscription par SMS");
      setLoading(false);
    }
  };

  // 2. Vérification OTP SMS
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formatted = formatPhone(phone);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: otpCode,
        type: 'sms'
      });

      if (error) throw error;

      const loggedUser = {
        fullName: fullName || 'Agriculteur Sahel',
        phone: formatted,
        city: city
      };

      localStorage.setItem('sahel_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
    } catch (err) {
      setErrorMsg("Code de validation incorrect ou expiré !");
      setLoading(false);
    }
  };

  // 3. Connexion Directe (Mot de passe)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formatted = formatPhone(phone);
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: formatted,
        password: password,
      });

      if (error) throw error;

      const loggedUser = {
        fullName: data.user?.user_metadata?.full_name || 'Utilisateur Connecté',
        phone: formatted,
        city: data.user?.user_metadata?.city || "N'Djamena"
      };

      localStorage.setItem('sahel_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
    } catch (err) {
      setErrorMsg("Identifiants incorrects. Vérifiez votre numéro et mot de passe.");
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('sahel_user');
    setUser(null);
    setAuthMode('welcome');
  };

  const modulesData = {
    secheresse: {
      title: "🌤️ Détection Sécheresse & Climat",
      partner: "Agrix Tech / IA Agri",
      content: [
        { label: "Indice de Précipitation (SPI)", val: "-0.85 (Sécheresse Modérée)" },
        { label: "Humidité des Sols", val: "18% - Nécessite Irrigation de soutien" },
        { label: "Prévision Météo (Tchad/Sahel)", val: "Ensoleillé, 38°C, Vent Nord-Est 15 km/h" },
        { label: "Préconisation IA", val: "Planifier l'irrigation goutte-à-goutte à 05h00 pour réduire l'évaporation de 40%." }
      ]
    },
    arboriculture: {
      title: "🌳 Arboriculture & Agroforesterie",
      partner: "Haller Farmers",
      content: [
        { label: "Anacardier (Haute Rentabilité)", val: "Plantation en quinconces (8m x 8m). Paillage à la base." },
        { label: "Moringa Oleifera", val: "Fixation de l'azote atmosphérique. Densité : 2500 plants/ha." },
        { label: "Reverdissement des Sols", val: "Réalisation de demi-lunes pour stocker l'eau de pluie." }
      ]
    },
    calendrier: {
      title: "📅 Calendrier Agricole Intelligent",
      partner: "Plantix / FAO",
      content: [
        { label: "Fenêtre Idéale de Semis", val: "15 Juin - 05 Juillet (Dès la 1ère pluie de >20mm)" },
        { label: "Fertilisation Biologique", val: "Apport de compost mûr (5t/ha) 15 jours avant le labour." },
        { label: "Récolte & Stockage", val: "Stockage en sacs hermétiques PICS sans pesticides." }
      ]
    },
    formations: {
      title: "📚 Formations & Guides Pratiques",
      partner: "Access Agriculture",
      content: [
        { label: "Guide 1 : Compostage Rapide", val: "Technique en tas surélevé en 21 jours." },
        { label: "Guide 2 : Protection Biologique", val: "Utilisation d'extraits de Neem contre les chenilles." },
        { label: "Fiche Vocale SMS", val: "Disponible en Arabe Tchadien et Foulfouldé." }
      ]
    }
  };

  // ÉCRAN SI L'UTILISATEUR N'EST PAS ENCORE CONNECTÉ
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
              🟢 BAMA Startup 2026
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              SahelClimate<span className="text-emerald-400">-IA</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Plateforme Climat & Agrotech pour le Sahel</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {/* ÉCRAN D'ACCUEIL : CHOIX DU MODE */}
          {authMode === 'welcome' && (
            <div className="space-y-4">
              <button
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
              >
                Se Connecter (Mon Compte)
              </button>
              <button
                onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 transition-all"
              >
                Créer un Nouveau Compte
              </button>
            </div>
          )}

          {/* FORMULAIRE DE CONNEXION */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Numéro de Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: 60646072 ou +235..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mot de Passe</label>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? "Connexion..." : "Se Connecter"}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="w-full text-center text-xs text-slate-400 hover:text-white mt-2"
              >
                ← Retour
              </button>
            </form>
          )}

          {/* FORMULAIRE D'INSCRIPTION */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nom Complet</label>
                <input
                  type="text"
                  placeholder="Moustapha Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Numéro de Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: 60646072"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Ville / Région</label>
                <input
                  type="text"
                  placeholder="N'Djamena, Moussoro..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mot de Passe</label>
                <input
                  type="password"
                  placeholder="Choisissez un mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all mt-2"
              >
                {loading ? "Envoi du SMS..." : "S'inscrire (Recevoir le SMS)"}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="w-full text-center text-xs text-slate-400 hover:text-white mt-1"
              >
                ← Retour
              </button>
            </form>
          )}

          {/* SAISIE CODE OTP SMS */}
          {authMode === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-300 mb-1">Un code de confirmation a été envoyé au :</p>
                <span className="text-sm font-bold text-emerald-400">{formatPhone(phone)}</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Code de Validation SMS (OTP)</label>
                <input
                  type="text"
                  placeholder="Code à 6 chiffres (Ex: 123456)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-bold tracking-widest text-emerald-400 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? "Vérification..." : "Valider & Accéder"}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // ÉCRAN PRINCIPAL DE L'APPLICATION (APRS CONNEXION)
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans max-w-4xl mx-auto pb-24">
      <header className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold mb-1 border border-emerald-500/20">
            🟢 Connecté : {user.fullName}
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">
            SahelClimate<span className="text-emerald-400">-IA</span>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg border border-slate-700 transition-all"
        >
          Déconnexion
        </button>
      </header>

      {/* CARTE SATELLITE INTERACTIVE */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
          <span>🛰️</span> Cartographie Satellite Esri en Temps Réel
        </h2>
        <MapComponent />
      </section>

      {/* MODULES INTERACTIFS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 mb-2">💡 Services Agronomiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(modulesData).map((key) => (
            <button
              key={key}
              onClick={() => setActiveModule(activeModule === key ? null : key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeModule === key ? 'bg-slate-800 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">{modulesData[key].partner}</span>
                <span className="text-xs text-emerald-400 font-bold">{activeModule === key ? '▲' : '▼'}</span>
              </div>
              <h3 className="font-bold text-white text-base">{modulesData[key].title}</h3>
            </button>
          ))}
        </div>

        {activeModule && modulesData[activeModule] && (
          <div className="mt-4 p-5 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-emerald-400 mb-3">{modulesData[activeModule].title}</h3>
            <div className="space-y-2">
              {modulesData[activeModule].content.map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-100 mt-0.5">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
