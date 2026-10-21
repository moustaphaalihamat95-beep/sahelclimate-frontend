'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabase';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
      Chargement du SIG & Satellite Pan-Sahélien...
    </div>
  )
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('welcome');
  
  // Champs Formulaires
  const [countryCode, setCountryCode] = useState('+235'); // Tchad par défaut
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState("N'Djamena");
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeModule, setActiveModule] = useState(null);

  const countries = [
    { name: "Tchad 🇹🇩", code: "+235" },
    { name: "Niger 🇳🇪", code: "+227" },
    { name: "Mali 🇲🇱", code: "+223" },
    { name: "Burkina Faso 🇧🇫", code: "+226" },
    { name: "Sénégal 🇸🇳", code: "+221" },
    { name: "Mauritanie 🇲🇷", code: "+222" },
    { name: "Cameroun 🇨🇲", code: "+237" },
    { name: "Nigeria 🇳🇬", code: "+234" },
    { name: "Bénin 🇧🇯", code: "+229" },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('sahel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const getFullPhone = () => {
    let cleaned = phone.trim().replace(/^0+/, '');
    return `${countryCode}${cleaned}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = getFullPhone();
      const { data, error } = await supabase.auth.signUp({
        phone: fullPhone,
        password: password,
        options: {
          data: { full_name: fullName, city: city, country_code: countryCode }
        }
      });

      if (error) throw error;
      setLoading(false);
      setAuthMode('verify');
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'envoi du SMS OTP");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = getFullPhone();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otpCode,
        type: 'sms'
      });

      if (error) throw error;

      const loggedUser = {
        fullName: fullName || 'Agriculteur du Sahel',
        phone: fullPhone,
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = getFullPhone();
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: fullPhone,
        password: password,
      });

      if (error) throw error;

      const loggedUser = {
        fullName: data.user?.user_metadata?.full_name || 'Utilisateur Sahélien',
        phone: fullPhone,
        city: data.user?.user_metadata?.city || "Zone Sahélienne"
      };

      localStorage.setItem('sahel_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
    } catch (err) {
      setErrorMsg("Identifiants incorrects. Vérifiez votre numéro et mot de passe.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sahel_user');
    setUser(null);
    setAuthMode('welcome');
  };

  const modulesData = {
    secheresse: {
      title: "🌤️ Détection Sécheresse & Climat Pan-Sahélien",
      partner: "Agrix Tech / IA Agri Regional",
      content: [
        { label: "Zone Évaluée", val: "Bande Sahélienne & Subsaharienne (Tchad, Niger, Mali, Burkina)" },
        { label: "Indice de Précipitation (SPI)", val: "-0.85 (Risque de Sécheresse Modérée)" },
        { label: "Humidité des Sols", val: "18% - Nécessite Irrigation de soutien" },
        { label: "Préconisation IA", val: "Planifier l'irrigation goutte-à-goutte à 05h00 pour limiter l'évaporation." }
      ]
    },
    arboriculture: {
      title: "🌳 Grande Muraille Verte & Agroforesterie",
      partner: "Haller Farmers / Alliance Sahel",
      content: [
        { label: "Anacardier & Gomme Arabique", val: "Plantes résilientes à haut rendement économique pour le Sahel." },
        { label: "Moringa Oleifera", val: "Régénération des sols arides et sécurité nutritionnelle." },
        { label: "Technique Pan-Sahélienne", val: "Pratique des Zaï et Demi-lunes pour la collecte des eaux d'écoulement." }
      ]
    },
    calendrier: {
      title: "📅 Calendrier Agricole Adaptatif WAF/Sahel",
      partner: "Plantix / FAO Afrique de l'Ouest",
      content: [
        { label: "Fenêtre de Semis Régionale", val: "Dès l'installation de la première pluie utile (>20mm)." },
        { label: "Céréales Résilientes", val: "Sorgho, Millet/Mil, Fonio, Niébé." },
        { label: "Stockage Hermétique", val: "Sacs PICS pour préserver les récoltes sans produits chimiques." }
      ]
    },
    formations: {
      title: "🎙️ Formations Multilingues & Vocales",
      partner: "Access Agriculture / Sahel Voice",
      content: [
        { label: "Langues Supportées", val: "Arabe Tchadien, Foulfouldé/Peul, Haoussa, Bambara, Wolof, Moore, Français." },
        { label: "Format Audio SMS", val: "Diffusion des conseils par synthétiseur vocal en langues locales." },
        { label: "Pratiques Résilientes", val: "Compostage en tas, biopesticides au Neem, diguettes anti-érosion." }
      ]
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
              🌍 Plateforme Panafricaine - BAMA 2026
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              SahelClimate<span className="text-emerald-400">-IA</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">L'IA & le SIG au service de tous les agriculteurs du Sahel</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
              {errorMsg}
            </div>
          )}

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

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pays & Téléphone</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                  >
                    {countries.map((c, i) => (
                      <option key={i} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Numéro sans l'indicatif"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
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

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nom Complet</label>
                <input
                  type="text"
                  placeholder="Ex: Moustapha Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pays & Téléphone</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                  >
                    {countries.map((c, i) => (
                      <option key={i} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ex: 60646072"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Ville / Localité</label>
                <input
                  type="text"
                  placeholder="Ex: N'Djamena, Niamey, Bamako..."
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
                  placeholder="Créer un mot de passe"
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
                {loading ? "Envoi du SMS..." : "S'inscrire (SMS OTP)"}
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

          {authMode === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-300 mb-1">Code envoyé au :</p>
                <span className="text-sm font-bold text-emerald-400">{getFullPhone()}</span>
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans max-w-4xl mx-auto pb-24">
      <header className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold mb-1 border border-emerald-500/20">
            🌍 Membre Sahélien : {user.fullName} ({user.city})
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
          <span>🛰️</span> Cartographie Satellite Esri - Zone Sahélienne
        </h2>
        <MapComponent />
      </section>

      {/* MODULES INTERACTIFS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 mb-2">💡 Services Agronomiques Panafricains</h2>
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
