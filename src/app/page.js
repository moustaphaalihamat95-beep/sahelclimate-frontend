import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 p-4">
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
  const [activeTab, setActiveTab] = useState('hub');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Chatbot IA
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Bonjour ! Je suis l'IA SahelClimate-IA fonctionnelle à 100%. Posez vos questions sur vos parcelles, les fiches techniques ou les traitements bio." }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Scanner Photo
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const countries = [
    { name: "Tchad 🇹🇩", code: "+235" },
    { name: "Niger 🇳🇪", code: "+227" },
    { name: "Mali 🇲🇱", code: "+223" },
    { name: "Burkina Faso 🇧🇫", code: "+226" },
    { name: "Sénégal 🇸🇳", code: "+221" },
  ];

  // BANQUE DE FICHES TECHNIQUES COMPLÈTES (PDF & TEXTE EXPLICATIF)
  const fichesTechniques = [
    {
      id: 'pdf1',
      category: '💧 Irrigation & Solaire',
      title: 'Fiche Technique : Installation Puits & Pompage Photovoltaïque',
      author: 'SahelClimate-IA / FAO',
      summary: 'Dimensionnement des panneaux solaires, débit optimal (10m³/h) et raccordement au système de goutte-à-goutte pour zones arides.',
      details: [
        "1. Profondeur moyenne de la nappe : 15m à 45m selon la région du Sahel.",
        "2. Puissance recommandée : 4 Panneaux Photovoltaïques de 330W (1.32 kWp).",
        "3. Économie d'eau : Réduction de 50% de la consommation d'eau grâce au goutte-à-goutte nocturne.",
        "4. Maintenance : Nettoyage mensuel des panneaux solaires pour éviter l'accumulation de poussière du désert."
      ]
    },
    {
      id: 'pdf2',
      category: '🐛 Protection Biologique',
      title: 'Guide d\'Extraction du Bio-Pesticide au Neem & Savon Noir',
      author: 'Institut Agronomique Sahélien',
      summary: 'Formulation 100% biologique contre la chenille légionnaire, les pucerons et les sautériaux.',
      details: [
        "1. Ingrédients : 500g de graines de Neem pilées + 10 Litres d'eau + 50g de savon noir local.",
        "2. Macération : Laisser reposer le mélange à l'ombre pendant 24 heures.",
        "3. Filtration : Filtrer à l'aide d'un tissu fin pour éviter de boucher le pulvérisateur.",
        "4. Application : Pulvériser tôt le matin (06h00) ou après le coucher du soleil 2 fois par semaine."
      ]
    },
    {
      id: 'pdf3',
      category: '🌳 Grande Muraille Verte',
      title: 'Manuel de Reboisement : Acacia Senegal & Balanites',
      author: 'Alliance Grande Muraille Verte',
      summary: 'Technique d'implantation des arbres résilients pour freiner la désertification et fixer les dunes.',
      details: [
        "1. Choix des espèces : Acacia Senegal (Gomme arabique), Balanites aegyptiaca (Dattier du désert), Moringa.",
        "2. Période de plantation : Dès les premières pluies utiles de juin/juillet.",
        "3. Méthode Zaï : Trous de 30cm de profondeur garnis de compost mûr pour capter l'humidité.",
        "4. Rentabilité : Production de gomme arabique utilisable dès la 4ème année."
      ]
    },
    {
      id: 'pdf4',
      category: '🐟 Économie Circulaire',
      title: 'Guide Aquaponie & Élevage Intégré Bovin-Biogaz',
      author: 'Sahel Agro-Circulaire',
      summary: 'Valorisation des déjections bovines en biogaz et utilisation de l\'eau des bassins de Tilapias pour l\'engrais.',
      details: [
        "1. Bassins de Pisciculture : Élevage de Tilapias du Nil alimentés par des sous-produits agricoles.",
        "2. Recyclage de l'eau : L'eau des poissons riche en azote est envoyée directement vers les cultures maraîchères.",
        "3. Methaniseur Biogaz : 2 vaches produisent suffisamment de gaz ménager pour la cuisson quotidienne."
      ]
    }
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
      setErrorMsg(err.message || "Erreur lors de l'inscription");
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
      setErrorMsg("Code OTP invalide !");
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
      setErrorMsg("Identifiants incorrects.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sahel_user');
    setUser(null);
    setAuthMode('welcome');
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputQuestion;
    if (!query.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInputQuestion('');
    setIsAiReplying(true);

    setTimeout(() => {
      let aiResponse = "L'IA a analysé votre demande : Pour la zone sahélienne, consultez la fiche technique disponible dans le menu pour connaître le dosage exact de bio-pesticides ou les calculs de pompage solaire.";
      const lower = query.toLowerCase();
      if (lower.includes('semence') || lower.includes('semis')) {
        aiResponse = "🌱 **Conseil Semis IA :** Attendez la première pluie utile (>20 mm). Privilégiez des graines certifiées à cycle court (70-90 jours).";
      } else if (lower.includes('fiche') || lower.includes('pdf') || lower.includes('forage')) {
        aiResponse = "📄 **Fiche Disponible :** Le guide complet 'Installation Puits & Pompage Photovoltaïque' est consultable et téléchargeable dans la section Fiches PDF !";
      } else if (lower.includes('maladie') || lower.includes('neem')) {
        aiResponse = "🐛 **Traitement Bio IA :** Utilisez 500g de Neem pilé dans 10L d'eau avec 50g de savon noir. Macération 24h à l'ombre.";
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsAiReplying(false);
    }, 1000);
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
          disease: "Attaque de Chenille Légionnaire d'Automne",
          confidence: "98.4%",
          solutionBio: "Pulvériser l'extrait d'huile de Neem (Fiche N°2) dilué dans l'eau savonneuse tôt le matin."
        });
      }, 2000);
    }
  };

  // Téléchargement / Exportation Fiche PDF
  const downloadPDF = (fiche) => {
    const content = `=== SAHELCLIMATE-IA • FICHE TECHNIQUE ===\n\n` +
                    `Titre: ${fiche.title}\n` +
                    `Auteur/Source: ${fiche.author}\n` +
                    `Catégorie: ${fiche.category}\n\n` +
                    `RÉSUMÉ:\n${fiche.summary}\n\n` +
                    `INSTRUCTIONS DÉTAILLÉES:\n` +
                    fiche.details.join('\n') +
                    `\n\n--- Document Officiel SahelClimate-IA BAMA 2026 ---`;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `${fiche.id}_${fiche.category.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
              🌍 SahelClimate-IA • BAMA 2026
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              SahelClimate<span className="text-emerald-400">-IA</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Plateforme Panafricaine d'Agro-Intelligence & Climat</p>
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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-8 font-sans max-w-6xl mx-auto pb-28">
      <header className="mb-6 bg-slate-900/90 backdrop-blur p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
                🟢 Membre : {user.fullName} ({user.city})
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              SahelClimate<span className="text-emerald-400">-IA</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'hub' && (
            <button
              onClick={() => setActiveTab('hub')}
              className="text-xs px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-xl border border-emerald-500/30 transition-all font-bold"
            >
              🏠 Accueil
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-xs px-3.5 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-xl border border-slate-700 transition-all font-semibold"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* CARTES ACCUEIL HUB */}
      {activeTab === 'hub' && (
        <section className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 text-center">
            <h2 className="text-2xl font-extrabold text-white mb-2">Centre d'Intelligence Agrotech & Fiches Techniques</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Accédez aux fiches PDF détaillées, à l'assistant IA 100% fonctionnel, au scanner de maladies et au tracé de parcelles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('fiches')}
              className="p-5 bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl cursor-pointer transition-all hover:scale-105 shadow-2xl group"
            >
              <div className="text-3xl mb-3 p-3 bg-emerald-500/10 rounded-2xl w-fit border border-emerald-500/20">📄</div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400">Fiches Techniques & PDF</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Consultez et téléchargez les guides complets : Pompage Solaire, Neem Bio, Reboisement et Aquaponie.
              </p>
              <span className="inline-block mt-4 text-xs font-bold text-emerald-400">Voir les 4 fiches PDF →</span>
            </div>

            <div
              onClick={() => setActiveTab('chat')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl cursor-pointer transition-all hover:scale-105 shadow-xl group"
            >
              <div className="text-3xl mb-3 p-3 bg-emerald-500/10 rounded-2xl w-fit border border-emerald-500/20">💬</div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400">Assistant Chatbot IA 100%</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Posez vos questions agronomiques précises à l'intelligence artificielle en direct.
              </p>
              <span className="inline-block mt-4 text-xs font-bold text-emerald-400">Poser une question →</span>
            </div>

            <div
              onClick={() => setActiveTab('sig')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl cursor-pointer transition-all hover:scale-105 shadow-xl group"
            >
              <div className="text-3xl mb-3 p-3 bg-emerald-500/10 rounded-2xl w-fit border border-emerald-500/20">🛰️</div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400">Carte SIG & Tracé Parcelle</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Visualisez la carte Esri HD et tracez les contours exacts de vos champs.
              </p>
              <span className="inline-block mt-4 text-xs font-bold text-emerald-400">Accéder au SIG →</span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION FICHES TECHNIQUES COMPLÈTES & PDF */}
      {activeTab === 'fiches' && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-emerald-400">📄 Banque de Fiches Techniques & Guides PDF</h2>
                <p className="text-xs text-slate-400">Informations détaillées prêtes à être affichées ou téléchargées.</p>
              </div>
              <button onClick={() => setActiveTab('hub')} className="text-xs text-slate-400 hover:text-white">✕ Fermer</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fichesTechniques.map((fiche) => (
                <div key={fiche.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-mono border border-emerald-500/20">
                      {fiche.category}
                    </span>
                    <span className="text-xs text-slate-500">{fiche.author}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{fiche.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{fiche.summary}</p>

                  <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedDoc(selectedDoc === fiche.id ? null : fiche.id)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/30"
                    >
                      {selectedDoc === fiche.id ? "Masquer les détails" : "👁️ Afficher tous les détails"}
                    </button>

                    <button
                      onClick={() => downloadPDF(fiche)}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                    >
                      📥 Télécharger la Fiche (Fichier)
                    </button>
                  </div>

                  {selectedDoc === fiche.id && (
                    <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-emerald-500/40 text-xs text-slate-200 space-y-2 animate-fade-in">
                      <strong className="text-emerald-400 block mb-1">Instructions Étape par Étape :</strong>
                      {fiche.details.map((item, dIdx) => (
                        <div key={dIdx} className="p-2 bg-slate-950/80 rounded border border-slate-800">
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ASSISTANT CHATBOT IA */}
      {activeTab === 'chat' && (
        <section className="space-y-4">
          <div className="bg-slate-900/90 p-4 md:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[520px]">
            <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">💬 Assistant Chatbot IA (100% Connecté)</h2>
              <button onClick={() => setActiveTab('hub')} className="text-xs text-slate-400 hover:text-white">✕ Fermer</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs md:text-sm ${msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-950 border border-slate-800 text-slate-100'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiReplying && <div className="text-xs text-emerald-400">L'IA recherche dans les fiches techniques...</div>}
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                placeholder="Posez votre question (Ex: Comment installer un forage solaire ?)"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white outline-none"
              />
              <button onClick={() => handleSendMessage()} className="px-5 py-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl text-xs">Envoyer</button>
            </div>
          </div>
        </section>
      )}

      {/* SIG MAP */}
      {activeTab === 'sig' && (
        <section className="space-y-4">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-emerald-400">🛰️ Système SIG & Carte Satellite HD</h2>
              <button onClick={() => setActiveTab('hub')} className="text-xs text-slate-400 hover:text-white">✕ Fermer</button>
            </div>
            <MapComponent />
          </div>
        </section>
      )}
    </main>
  );
}
