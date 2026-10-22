import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
      Chargement du SIG & Imagerie Satellite HD...
    </div>
  )
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('welcome');
  const [countryCode, setCountryCode] = useState('+235');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState("Moussoro");
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('sig');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [speakingLanguage, setSpeakingLanguage] = useState(null);

  const countries = [
    { name: "Tchad 🇹🇩", code: "+235" },
    { name: "Niger 🇳🇪", code: "+227" },
    { name: "Mali 🇲🇱", code: "+223" },
    { name: "Burkina Faso 🇧🇫", code: "+226" },
    { name: "Sénégal 🇸🇳", code: "+221" },
    { name: "Cameroun 🇨🇲", code: "+237" },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('sahel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const getFullPhone = () => `${countryCode}${phone.trim().replace(/^0+/, '')}`;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = getFullPhone();
      const { data, error } = await supabase.auth.signUp({
        phone: fullPhone,
        password: password,
        options: { data: { full_name: fullName, city: city } }
      });

      if (error) throw error;
      setLoading(false);
      setAuthMode('verify');
    } catch (err) {
      setErrorMsg(err.message || "Erreur d'envoi du SMS OTP");
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

      const loggedUser = { fullName: fullName || 'Agriculteur Sahel', phone: fullPhone, city: city };
      localStorage.setItem('sahel_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
    } catch (err) {
      setErrorMsg("Code OTP invalide ou expiré !");
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
        fullName: data.user?.user_metadata?.full_name || 'Utilisateur Connecté',
        phone: fullPhone,
        city: data.user?.user_metadata?.city || "Moussoro"
      };

      localStorage.setItem('sahel_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
    } catch (err) {
      setErrorMsg("Identifiants incorrects. Vérifiez le numéro et le mot de passe.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sahel_user');
    setUser(null);
    setAuthMode('welcome');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(URL.createObjectURL(file));
      setAnalyzingPhoto(true);
      setScanResult(null);

      setTimeout(() => {
        setAnalyzingPhoto(false);
        setScanResult({
          disease: "Attaque de Chenille Légionnaire d'Automne (Spodoptera frugiperda)",
          confidence: "98.4%",
          severity: "Élevée",
          solutionBio: "Pulvérisation d'un extrait d'huile de Neem bio à 5% dilué dans de l'eau savonneuse tôt le matin.",
          prevention: "Association de cultures Mil/Sorgho avec du Niébé pour repousser les ravageurs."
        });
      }, 2000);
    }
  };

  const speakAdvice = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'fr-FR';
      setSpeakingLanguage(lang);
      msg.onend = () => setSpeakingLanguage(null);
      window.speechSynthesis.speak(msg);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur">
          <div className="text-center mb-6">
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
              🌍 SahelClimate-IA • BAMA 2026
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              SahelClimate<span className="text-emerald-400">-IA</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Plateforme Régionale d'Agro-Intelligence & SIG Sahélien</p>
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
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-xl transition-all"
              >
                Se Connecter (Mon Compte)
              </button>
              <button
                onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-2xl border border-emerald-500/30 transition-all"
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
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
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
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all"
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
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
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
                <label className="text-xs font-bold text-slate-300 block mb-1">Ville / Région</label>
                <input
                  type="text"
                  placeholder="Ex: Moussoro"
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
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all"
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

          {authMode === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-300 mb-1">Code envoyé au :</p>
                <span className="text-sm font-bold text-emerald-400">{getFullPhone()}</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Code SMS (OTP)</label>
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
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all"
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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-8 font-sans max-w-5xl mx-auto pb-28">
      <header className="mb-6 bg-slate-900/80 backdrop-blur p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
                🟢 {user.fullName} ({user.city})
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              SahelClimate<span className="text-emerald-400">-IA</span>
            </h1>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs px-3.5 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-xl border border-slate-700 transition-all font-semibold"
        >
          Déconnexion
        </button>
      </header>

      <nav className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
        {[
          { id: 'sig', label: '🛰️ Carte SIG & Tracé', icon: '📍' },
          { id: 'scan', label: '📸 Scanner IA & Pathologies', icon: '🔍' },
          { id: 'reboisement', label: '🌳 Arbres Anti-Désert', icon: '🌴' },
          { id: 'circulaire', label: '☀️ Forage, Solaire & Pisciculture', icon: '⚡' },
          { id: 'technique', label: '📚 Guides & Audios Vocaux', icon: '🎙️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'sig' && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-bold text-emerald-400 mb-1 flex items-center gap-2">
              <span>🛰️</span> Système d'Information Géographique & Cartographie Esri
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Tracez votre parcelle directement sur l'imagerie spatiale pour calculer la superficie et obtenir le diagnostic pédologique.
            </p>
            <MapComponent />
          </div>
        </section>
      )}

      {activeTab === 'scan' && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl text-center">
            <h2 className="text-xl font-bold text-emerald-400 mb-2">📸 Diagnostic IA par Photo de Feuille / Plante</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Prenez une photo d'une feuille malade ou téléchargez une image pour une détection instantanée de la pathologie.
            </p>

            <label className="inline-flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-3xl cursor-pointer bg-slate-950/50 transition-all w-full max-w-md mx-auto">
              <span className="text-4xl mb-2">📷</span>
              <span className="text-sm font-bold text-emerald-400">Prendre une photo ou Importer</span>
              <span className="text-xs text-slate-500 mt-1">PNG, JPG jusqu'à 10MB</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            {selectedPhoto && (
              <div className="mt-6 max-w-md mx-auto space-y-4">
                <img src={selectedPhoto} alt="Plante scannée" className="w-full h-48 object-cover rounded-2xl border-2 border-emerald-500/30 shadow-lg" />
                
                {analyzingPhoto && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                    <span className="text-xs font-bold text-emerald-400">Analyse IA des symptômes en cours...</span>
                  </div>
                )}

                {scanResult && (
                  <div className="p-5 bg-slate-950 rounded-2xl border-2 border-emerald-500/50 text-left space-y-3 shadow-2xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold">Alerte Pathologie</span>
                      <span className="text-xs text-emerald-400 font-mono">Précision : {scanResult.confidence}</span>
                    </div>
                    <h3 className="font-bold text-white text-sm">{scanResult.disease}</h3>
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-300">
                      <strong>💡 Traitement Bio Recommandé :</strong> {scanResult.solutionBio}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'reboisement' && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-bold text-emerald-400 mb-1">🌴 Arbres Résilients & Grande Muraille Verte</h2>
            <p className="text-xs text-slate-400 mb-4">Sélection d'espèces à haute tolérance à la sécheresse pour fixer les dunes et restaurer les sols arides.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Acacia Senegal (Gomme Arabique)", desc: "Fixation exceptionnelle de l'azote, stoppe l'avancée du désert et génère un revenu économique fort.", img: "🌳" },
                { name: "Balanites aegyptiaca (Dattier du Désert)", desc: "Racines profondes captant l'eau jusqu'à 20m. Production d'huile précieuse et fourrage bovin.", img: "🌴" },
                { name: "Moringa Oleifera (Arbre Miracle)", desc: "Croissance ultra-rapide. Enrichit le sol en matière organique et feuilles hyper-nutritives.", img: "🌿" },
                { name: "Anacardier (Noix de Cajou)", desc: "Excellente barrière brise-vent. Adapté aux sols limono-sableux du Sahel.", img: "🌱" },
              ].map((tree, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex gap-3">
                  <div className="text-3xl p-3 bg-slate-900 rounded-xl border border-slate-800 h-fit">{tree.img}</div>
                  <div>
                    <h3 className="font-bold text-emerald-400 text-sm">{tree.name}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tree.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'circulaire' && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">☀️ Systèmes d'Agriculture Moderne & Économie Circulaire</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-bold text-white text-sm">Forage & Pompage Solaire</h3>
                <p className="text-xs text-slate-400">Pompes immergées alimentées par panneaux photovoltaïques sans coût de carburant. Débit de 10 m³/h.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-2xl">🐟</span>
                <h3 className="font-bold text-white text-sm">Pisciculture & Aquaponie</h3>
                <p className="text-xs text-slate-400">Élevage de Tilapias en bassins. L'eau enrichie en déjections de poissons fertilise directement les cultures.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-2xl">🐄</span>
                <h3 className="font-bold text-white text-sm">Bovins & Biogaz Circulaire</h3>
                <p className="text-xs text-slate-400">Valorisation du fumier bovin en compost mûr et méthanisation pour la production de gaz domestique.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'technique' && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">🎙️ Formations Vocales en Langues Locales</h2>
            <p className="text-xs text-slate-400">Écoutez directement les instructions audio synthétisées pour une compréhension facile sur le terrain.</p>

            <div className="space-y-3">
              {[
                { title: "Guide 1 : Compostage Rapide en 21 jours", text: "Empiler en couches alternées résidus verts et déjections d'élevage. Arroser tous les 3 jours." },
                { title: "Guide 2 : Fabrication d'Insecticide Bio au Neem", text: "Piler 500g de graines de Neem, faire macérer dans 10 litres d'eau pendant 24h avec du savon noir." },
                { title: "Guide 3 : Conservation des Sols par Demi-lunes", text: "Creuser des cuvettes semi-circulaires perpendiculaires à la pente pour freiner l'eau de pluie." },
              ].map((guide, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white text-sm">{guide.title}</h3>
                  <p className="text-xs text-slate-300">{guide.text}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Arabe Tchadien", "Foulfouldé", "Haoussa", "Wolof"].map((lang, lIdx) => (
                      <button
                        key={lIdx}
                        onClick={() => speakAdvice(guide.text, lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          speakingLanguage === lang ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' : 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        🔊 {lang}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
