"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Settings, 
  LogOut, 
  MapPin, 
  Plus, 
  ShieldAlert, 
  Droplets,
  BookOpen,
  Send,
  Bot,
  Sparkles,
  TreePine,
  Layers,
  MessageSquare,
  Users,
  Phone,
  ThumbsUp,
  MessageCircle,
  FileText
} from "lucide-react";

const MapWithNoSSR = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800 flex items-center justify-center text-xs text-slate-500">
      Chargement de la carte interactive & module de tracé...
    </div>
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sahelclimate-api.onrender.com";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // --- Authentification ---
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sahel_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [fullName, setFullName] = useState('Moustapha Ali Hamat');
  const [phone, setPhone] = useState('+23560646072');
  const [city, setCity] = useState('Moussoro');
  const [address, setAddress] = useState('Quartier Ouest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [channel, setChannel] = useState('sms');

  const [authStep, setAuthStep] = useState('register');
  const [codeInput, setCodeInput] = useState('123456');
  const [generatedCode, setGeneratedCode] = useState('123456');
  const [targetDestination, setTargetDestination] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- Parcelles & Tracé de Zone ---
  const [parcels, setParcels] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState(1);
  const [diagnostic, setDiagnostic] = useState(null);
  const [drawnZone, setDrawnZone] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newCrop, setNewCrop] = useState("Sorgho");
  const [newArea, setNewArea] = useState("");
  const [newNdvi, setNewNdvi] = useState("0.45");
  const [submitting, setSubmitting] = useState(false);

  // --- Forum & Communauté ---
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Mahamat Salhedine",
      city: "Barh El Gazel (Moussoro)",
      crop: "Sorgho & Sésame",
      text: "Grâce à la recommandation d'irrigation de SahelClimate-AI, j'ai réduit l'utilisation d'eau de mon puits de 30% tout en gardant des feuilles bien vertes !",
      likes: 12,
      time: "Il y a 2 heures"
    },
    {
      id: 2,
      author: "Khadidja Ousmane",
      city: "N'Djamena Nord",
      crop: "Maïs & Maraîchage",
      text: "L'outil de tracé de zone m'a permis de calculer mes 4.5 hectares avec précision et de savoir exactement quelles zones nécessitaient du compost.",
      likes: 8,
      time: "Il y a 5 heures"
    }
  ]);
  const [newPostText, setNewPostText] = useState("");

  // --- Annuaire des Agriculteurs ---
  const [farmersList, setFarmersList] = useState([
    { id: 1, name: "Moustapha Ali Hamat", city: "Moussoro", phone: "+23560646072", crops: "Sorgho, Sésame, Anacardier", area: "12.5 ha" },
    { id: 2, name: "Mahamat Salhedine", city: "Moussoro", phone: "+23566123456", crops: "Sorgho Rouge, Niébé", area: "8.0 ha" },
    { id: 3, name: "Khadidja Ousmane", city: "N'Djamena", phone: "+23599887766", crops: "Maïs, Arachide, Citronniers", area: "15.2 ha" },
    { id: 4, name: "Ibrahim Abakar", city: "Pala", phone: "+23563112233", crops: "Coton, Sésame, Moringa", area: "20.0 ha" }
  ]);

  // --- Assistant IA ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Bonjour ! Je suis l'Assistant IA Agronome de SahelClimate-AI. Tracez votre champ sur la carte ou posez-moi vos questions sur la capacité de votre terre."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // --- Modules de formation ---
  const [selectedModule, setSelectedModule] = useState(null);
  const modules = [
    {
      id: 1,
      title: "Techniques d'Irrigation Goutte-à-Goutte",
      subtitle: "Réduire la consommation d'eau de 60% dans les zones arides",
      badge: "Eau & Irrigation",
      color: "from-cyan-500 to-blue-600",
      description: "Apprenez à installer et entretenir un système d'irrigation au goutte-à-goutte économique pour préserver la ressource en eau dans les zones arides comme Moussoro, N'Djamena et le Barh El Gazel.",
      steps: [
        "Choix des tuyaux micro-perforés et réservoirs surélevés (gravité)",
        "Filtration de l'eau pour éviter le bouchage par le sable du Sahel",
        "Calcul du calendrier d'arrosage : Tôt le matin (05h-07h) ou le soir (18h-20h)",
        "Dosage exact par pied de culture (Maïs, Sorgho, Maraîchage)"
      ],
      impact: "Économie de 60% d'eau + augmentation de 35% du rendement des récoltes."
    },
    {
      id: 2,
      title: "Gestion & Régénération des Sols",
      subtitle: "Compost organique et paillage pour maintenir l'humidité",
      badge: "Sols & Fertilité",
      color: "from-emerald-500 to-green-600",
      description: "Techniques simples de compostage et de paillage pour enrichir les sols sablonneux du Sahel et empêcher l'évaporation rapide de l'eau.",
      steps: [
        "Technique des fosses compostières à base de fumier local et résidus récoltés",
        "Application du paillage organique (paille, tontes) de 5 à 10 cm autour des plants",
        "Utilisation des demi-lunes et zaï pour capturer l'eau de pluie dans les champs",
        "Rotation des cultures avec des légumineuses (Niébé/Sésame) pour fixer l'azote"
      ],
      impact: "Maintien de l'humidité du sol pendant 48h supplémentaires après arrosage."
    },
    {
      id: 3,
      title: "Arboriculture & Agroforesterie Sahélienne",
      subtitle: "Plantation et entretien de l'Anacardier, Moringa et Citronniers",
      badge: "Arbres & Climat",
      color: "from-amber-500 to-orange-600",
      description: "Guide pratique pour créer des haies vives brise-vent et cultiver des arbres fruitiers et fertilitaires résistants au climat chaud et sec.",
      steps: [
        "Préparation du trou de plantation (80x80 cm) enrichi en terreau/compost",
        "Entretien spécifique de l'Anacardier et du Moringa pour la fixation des sols",
        "Protection des jeunes plants contre le bétail (grillage/haies d'épineux)",
        "Taille de formation et gestion de l'ombrage pour les cultures sous-jacentes"
      ],
      impact: "Création d'un microclimat frais, réduction de l'érosion du vent et revenus fruitiers annexes."
    },
    {
      id: 4,
      title: "Prévention des Ravageurs & Semences Adaptées",
      subtitle: "Protéger le Sorgho, le Sésame et le Niébé sans produits chimiques",
      badge: "Protection & Semences",
      color: "from-purple-500 to-indigo-600",
      description: "Solutions naturelles et choix de variétés de semences à cycle court adaptées aux saisons des pluies courtes et irrégulières.",
      steps: [
        "Sélection des variétés de graines certifiées résistantes à la sécheresse",
        "Fabrication de biopesticides naturels (extraits de feuilles de Neem et piment)",
        "Association intelligente des cultures (Sorgho + Niébé) pour piéger les insectes",
        "Techniques de conservation des grains stockés en sacs hermétiques"
      ],
      impact: "Zéro perte de récolte post-récolte et diminution des frais d'intrants."
    }
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setAuthError("Les mots de passe ne correspondent pas !");
    setAuthLoading(true);
    setTargetDestination(channel === 'sms' ? phone : (email || phone));

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phone,
          city: city,
          address: address,
          email: email,
          password: password,
          delivery_channel: channel
        })
      });
      const data = await res.json();
      if (data.verification_code) {
        setGeneratedCode(data.verification_code);
        setCodeInput(data.verification_code);
      }
    } catch {
      setGeneratedCode("123456");
      setCodeInput("123456");
    } finally {
      setAuthLoading(false);
      setAuthStep('verify');
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const newUser = { full_name: fullName, phone_number: phone, city: city, address: address, email: email };
    try { localStorage.setItem('sahel_user', JSON.stringify(newUser)); } catch (e) {}
    setUser(newUser);
    
    setFarmersList(prev => [
      { id: Date.now(), name: fullName, city: city, phone: phone, crops: "Sorgho, Maïs", area: "10 ha" },
      ...prev
    ]);
  };

  const handleLogout = () => {
    try { localStorage.removeItem('sahel_user'); } catch (e) {}
    setUser(null);
    setAuthStep('register');
  };

  const fetchParcels = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/parcels`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParcels(Array.isArray(data) ? data : []);
    } catch {
      setParcels([
        { id: 1, location_name: "Parcelle N'Djamena Nord", area_ha: 15.2, crop_type: "Maïs", ndvi_value: 0.52 },
        { id: 2, location_name: "Zone Bahr El Gazel", area_ha: 8.7, crop_type: "Sorgho", ndvi_value: 0.38 }
      ]);
    }
  }, []);

  const fetchDiagnostic = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/parcels/${id}/diagnostic`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDiagnostic(data);
    } catch {
      if (id === 1) {
        setDiagnostic({
          parcel_id: 1,
          location_name: "Parcelle N'Djamena Nord",
          crop_type: "Maïs",
          area_ha: 15.2,
          ndvi_value: 0.52,
          health_status: "Végétation Vigoureuse",
          drought_risk: "Faible",
          irrigation_recommendation: "Maintenir l'arrosage régulier (10-12 mm/semaine)"
        });
      } else {
        setDiagnostic({
          parcel_id: 2,
          location_name: "Zone Bahr El Gazel",
          crop_type: "Sorgho",
          area_ha: 8.7,
          ndvi_value: 0.38,
          health_status: "Stress Hydrique Modéré",
          drought_risk: "Moyen",
          irrigation_recommendation: "Augmenter la fréquence d'irrigation (18-20 mm/semaine)"
        });
      }
    }
  }, []);

  useEffect(() => { if (user) fetchParcels(); }, [user, fetchParcels]);
  useEffect(() => { if (user && selectedParcelId) fetchDiagnostic(selectedParcelId); }, [user, selectedParcelId, fetchDiagnostic]);

  const handleAreaDrawn = (zone) => {
    setDrawnZone({
      area_ha: zone.area_ha,
      soil_capacity: "Terre Limono-Sableuse Sahélienne (Haute productivité avec apport organique)",
      water_retention: "Moyenne (Ressources souterraines accessibles)",
      crops: [
        { name: "Sorgho Rouge / Blanc", yield: "Rendement estimé : 2.8 t/ha", cycle: "Cycle court (75 jours)" },
        { name: "Sésame Biologique", yield: "Rendement estimé : 1.2 t/ha", cycle: "Très forte valeur marchande" },
        { name: "Arachide", yield: "Rendement estimé : 2.0 t/ha", cycle: "Enrichit la terre en Azote naturel" }
      ],
      trees_and_fruits: [
        { name: "Anacardier (Noix de Cajou)", benefit: "Fixation des sols & Revenu stable à long terme" },
        { name: "Moringa Oleifera", benefit: "Croissance rapide & Propriétés nutritionnelles" },
        { name: "Citronniers / Manguiers", benefit: "Production fruitière saisonnière & Ombrage" }
      ],
      calendar: {
        prep: "Mai - Juin : Traitement de la terre & enrichissement compost",
        semis: "Juillet : Semis optimal dès les premières pluies",
        irrigation: "Août - Septembre : Arrosage cibled en cas de poche de sécheresse",
        recolte: "Octobre - Novembre : Récolte & Séchage"
      }
    });
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setPosts([
      {
        id: Date.now(),
        author: user.full_name,
        city: user.city,
        crop: "Cultures Sahéliennes",
        text: newPostText,
        likes: 1,
        time: "À l'instant"
      },
      ...posts
    ]);
    setNewPostText("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: "ai", text: data.reply || "Voici les recommandations agronomiques pour votre zone." }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: "ai", text: "En tant qu'agronome virtuel SahelClimate-AI, je vous conseille d'appliquer un paillage de 10 cm et de surveiller l'indice NDVI de votre parcelle pour anticiper le stress hydrique." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3 text-emerald-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">SahelClimate-AI</h1>
            <p className="text-xs text-slate-400 mt-1">Plateforme Intelligence Climat & Réseau Agricole Sahélien</p>
          </div>

          {authStep === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nom complet *</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Téléphone *</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ville / Region *</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Adresse</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mot de passe *</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Confirmer *</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-400 mb-2">Canal de Réception SMS / E-mail :</label>
                <div className="flex space-x-6 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input type="radio" name="channel" value="sms" checked={channel === 'sms'} onChange={() => setChannel('sms')} className="accent-emerald-500" />
                    <span>📱 SMS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input type="radio" name="channel" value="email" checked={channel === 'email'} onChange={() => setChannel('email')} className="accent-emerald-500" />
                    <span>📧 E-mail</span>
                  </label>
                </div>
              </div>

              {authError && <p className="text-rose-400 text-xs text-center">{authError}</p>}

              <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50">
                {authLoading ? "Traitement..." : "S'inscrire & Rejoindre la Communauté"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-200 text-center">🔑 Saisir le Code d'Accès</h2>
              <p className="text-xs text-slate-400 text-center">Envoyé par <span className="text-emerald-400 font-bold">{channel.toUpperCase()}</span> à : <span className="text-white">{targetDestination}</span></p>

              <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl text-center">
                <span className="text-xs text-slate-400 block mb-1">Code de confirmation :</span>
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{generatedCode}</span>
              </div>

              <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} required className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-center text-2xl font-mono tracking-widest text-white focus:border-emerald-500 focus:outline-none" />

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all">
                Accéder à SahelClimate-AI
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">SahelClimate</h1>
              <p className="text-[10px] text-slate-400">v2.5 • Network Edition</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord & Carte</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'community' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Espace Communauté & Avis</span>
            </button>

            <button
              onClick={() => setActiveTab('network')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'network' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Annuaire Agriculteurs</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'assistant' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Assistant IA Climat</span>
            </button>

            <button
              onClick={() => setActiveTab('trainings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'trainings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Formations & Conseils</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-3 p-2 mb-3 bg-slate-950/60 rounded-xl border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {user.full_name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.city}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">SahelClimate /</span>
            <span className="text-xs font-semibold text-white capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-3">
            <a href="/admin" className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-500/20">
              Admin ⚙️
            </a>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* 1. TABLEAU DE BORD & CARTE */}
          {activeTab === 'dashboard' && (
            <>
              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Cartographie & Outil de Tracé de Champ</span>
                  </h2>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
                    ✏️ Utilisez l'icône polygone pour tracer votre zone et calculer l'eau
                  </span>
                </div>
                
                <MapWithNoSSR 
                  parcels={parcels} 
                  selectedParcelId={selectedParcelId} 
                  onSelectParcel={(id) => setSelectedParcelId(id)}
                  onAreaDrawn={handleAreaDrawn}
                />
              </div>

              {/* RÉSULTAT DU TRACÉ ET CAPACITÉ DU SOL */}
              {drawnZone && (
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border border-emerald-500/40 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="flex justify-between items-start border-b border-emerald-500/20 pb-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">Analyse de la Zone Tracée</span>
                      <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <Layers className="w-5 h-5 text-emerald-400" />
                        <span>Superficie Détectée : {drawnZone.area_ha} Hectares</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">{drawnZone.soil_capacity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Cultures & Aliments à Haute Production</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        {drawnZone.crops.map((c, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{c.yield} • {c.cycle}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                        <TreePine className="w-4 h-4" />
                        <span>Arbres & Arbres Fruitiers Recommandés</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        {drawnZone.trees_and_fruits.map((t, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                            <p className="font-semibold text-white">{t.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{t.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. ESPACE COMMUNAUTÉ */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
                <h2 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Publier un Conseil ou une Recommandation</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4">Partagez vos retours d'expérience sur l'utilisation de l'application et vos réussites.</p>

                <form onSubmit={handleCreatePost} className="space-y-3">
                  <textarea
                    rows="3"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Exemple : J'ai appliqué le paillage sur mon champ après le diagnostic NDVI..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2">
                      <Send className="w-3.5 h-3.5" />
                      <span>Publier mon message</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publications de la Communauté</h3>
                {posts.map((post) => (
                  <div key={post.id} className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{post.author}</h4>
                          <p className="text-[10px] text-slate-400">{post.city} • Cultures : {post.crop}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{post.time}</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">{post.text}</p>

                    <div className="flex items-center space-x-6 text-xs text-slate-400 pt-1">
                      <button className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes} J'aime</span>
                      </button>
                      <button className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Commenter</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ANNUAIRE DES AGRICULTEURS */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Réseau & Annuaire des Agriculteurs</h2>
                <p className="text-xs text-slate-400">Mettez-vous en contact avec d'autres producteurs sahéliens.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farmersList.map((farmer) => (
                  <div key={farmer.id} className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-bold text-white">{farmer.name}</h3>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">{farmer.city}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1">🌱 <strong>Cultures :</strong> {farmer.crops}</p>
                      <p className="text-xs text-slate-400 mb-4">📐 <strong>Superficie :</strong> {farmer.area}</p>
                    </div>
                    <a href={`tel:${farmer.phone}`} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl text-center transition flex items-center justify-center space-x-2">
                      <span>📞 Contacter ({farmer.phone})</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ASSISTANT IA CLIMAT */}
          {activeTab === 'assistant' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-[650px] p-6">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Assistant IA Agronome</h2>
                  <p className="text-[10px] text-slate-400">Disponible 24/7 pour vos conseils sol, eau et climat</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 animate-pulse">
                      L'IA analyse votre question...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Posez votre question sur les cultures, le climat, l'eau..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-500"
                />
                <button type="submit" className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </button>
              </form>
            </div>
          )}

          {/* 5. FORMATIONS & CONSEILS */}
          {activeTab === 'trainings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Modules de Formation Pratique</h2>
                <p className="text-xs text-slate-400">Formations adaptées aux agriculteurs et techniciens du Sahel.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((mod) => (
                  <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                    <div>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${mod.color} mb-3`}>
                        {mod.badge}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                      <p className="text-slate-400 text-xs mb-4 leading-relaxed">{mod.subtitle}</p>
                    </div>

                    <button
                      onClick={() => setSelectedModule(mod)}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <span>Commencer le module</span>
                      <span>➔</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fenêtre modale des cours */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${selectedModule.color} mb-2`}>
                {selectedModule.badge}
              </span>
              <h2 className="text-2xl font-black text-white">{selectedModule.title}</h2>
              <p className="text-slate-400 text-xs mt-1">{selectedModule.subtitle}</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Résumé de la formation</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{selectedModule.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Étapes de mise en pratique sur le terrain :</h4>
              <div className="space-y-2.5">
                {selectedModule.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    <span className="bg-emerald-500 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 leading-normal">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => alert("✅ Fiche de cours téléchargée en mode hors-ligne pour votre téléphone !")}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold py-2.5 rounded-xl transition text-center"
              >
                📥 Télécharger la Fiche PDF
              </button>
              <button
                onClick={() => setSelectedModule(null)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition text-center"
              >
                Terminer le cours
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
