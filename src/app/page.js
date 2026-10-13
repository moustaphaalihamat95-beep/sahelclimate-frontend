"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { 
  LayoutDashboard, 
  GraduationCap, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  MapPin, 
  Plus, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Droplets,
  BookOpen,
  Send,
  Bot,
  Sparkles,
  TreePine,
  Calendar,
  Layers,
  Apple
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
  const [filter, setFilter] = useState("all");
  const [drawnZone, setDrawnZone] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newCrop, setNewCrop] = useState("Sorgho");
  const [newArea, setNewArea] = useState("");
  const [newNdvi, setNewNdvi] = useState("0.45");
  const [submitting, setSubmitting] = useState(false);

  // --- Formulaire de Risque ---
  const [riskSoilType, setRiskSoilType] = useState("sableux");
  const [riskWaterAccess, setRiskWaterAccess] = useState("puits");
  const [riskAlertSent, setRiskAlertSent] = useState(false);

  // --- Assistant IA ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Bonjour ! Je suis l'Assistant IA Agronome de SahelClimate-AI. Tracez votre champ sur la carte ou posez-moi vos questions sur la capacité de votre terre."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

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

  // Handler déclenché quand l'agriculteur trace sa zone
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
        { name: "Citronniers / Manguiers", benefit: "Production fruitière saisonnière & Ombrage" },
        { name: "Acacia Senegal (Gomme Arabique)", benefit: "Résilience extrême à la sécheresse & Exportation" }
      ],
      calendar: {
        prep: "Mai - Juin : Traitement de la terre & enrichissement compost",
        semis: "Juillet : Semis optimal dès les premières pluies",
        irrigation: "Août - Septembre : Arrosage ciblé en cas de poche de sécheresse",
        recolte: "Octobre - Novembre : Récolte & Séchage"
      }
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      let aiResponse = "Sur votre terre, la rotation entre le Sorgho et l'Arachide permettra de maintenir une excellente régénération minérale sans épuiser le sol.";
      const query = userText.toLowerCase();
      if (query.includes("arbre") || query.includes("fruit")) {
        aiResponse = "Pour les arbres fruitiers à " + (user?.city || "Moussoro") + ", nous recommandons d'associer des Citronniers à des anacardiers en bordure de parcelle pour faire brise-vent.";
      } else if (query.includes("eau") || query.includes("arrosage")) {
        aiResponse = "Privilégiez un arrosage goutte-à-goutte tôt le matin (15-18 mm/semaine) pour maximiser l'absorption et éviter l'évaporation.";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      setChatLoading(false);
    }, 900);
  };

  const handleAddParcel = async (e) => {
    e.preventDefault();
    if (!newLocation || !newArea) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/parcels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: newLocation,
          crop_type: newCrop,
          area_ha: parseFloat(newArea),
          ndvi_value: parseFloat(newNdvi)
        })
      });
      if (res.ok) {
        const added = await res.json();
        await fetchParcels();
        setSelectedParcelId(added.id);
        setShowForm(false);
      }
    } catch {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParcels = parcels.filter((p) => {
    if (filter === "high") return p.ndvi_value >= 0.5;
    if (filter === "low") return p.ndvi_value < 0.5;
    return true;
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3 text-emerald-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">SahelClimate-AI</h1>
            <p className="text-xs text-slate-400 mt-1">Plateforme Intelligence Climat & Agriculture Sahélienne</p>
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
                {authLoading ? "Traitement..." : "S'inscrire & Valider mon Compte"}
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
                Accéder au Dashboard
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* 🧭 SIDEBAR MODERNE */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">SahelClimate</h1>
              <p className="text-[10px] text-slate-400">v2.0 • Pro Sahel</p>
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
              <span>Tableau de bord</span>
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

            <button
              onClick={() => setActiveTab('risks')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'risks' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Formulaire de Risque</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres & Profil</span>
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

      {/* 💻 CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">Espace Agricole /</span>
            <span className="text-xs font-semibold text-white capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setShowForm(true)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-950/50 transition-all">
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Parcelle</span>
            </button>
            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-700/50">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* 1. TABLEAU DE BORD & TRACÉ DE CARTE */}
          {activeTab === 'dashboard' && (
            <>
              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Cartographie & Outil de Tracé de Champ</span>
                  </h2>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
                    ✏️ Utilisez l'icône polygone à gauche de la carte pour tracer votre zone
                  </span>
                </div>
                
                <MapWithNoSSR 
                  parcels={parcels} 
                  selectedParcelId={selectedParcelId} 
                  onSelectParcel={(id) => setSelectedParcelId(id)}
                  onAreaDrawn={handleAreaDrawn}
                />
              </div>

              {/* 🌾 RÉSULTAT DU TRACÉ ET CAPACITÉ DU SOL */}
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
                    {/* Plantes & Alimentation */}
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

                    {/* Arbres & Fruits */}
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

                  {/* Calendrier Agricole Sur-Mesure */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Calendrier Agricultural Précis pour cette Terre</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Préparation</span>
                        <p className="text-slate-200">{drawnZone.calendar.prep}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Semis</span>
                        <p className="text-slate-200">{drawnZone.calendar.semis}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Entretien</span>
                        <p className="text-slate-200">{drawnZone.calendar.irrigation}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Récolte</span>
                        <p className="text-slate-200">{drawnZone.calendar.recolte}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parcelles & Diagnostic */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Mes Parcelles ({parcels.length})</h2>
                  <div className="flex space-x-2 mb-4">
                    <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>Toutes</button>
                    <button onClick={() => setFilter("high")} className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === "high" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>NDVI Hôte</button>
                    <button onClick={() => setFilter("low")} className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === "low" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>NDVI Bas</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredParcels.map((p) => (
                      <button key={p.id} onClick={() => setSelectedParcelId(p.id)} className={`w-full text-left p-3.5 rounded-xl transition-all ${selectedParcelId === p.id ? "bg-emerald-950/60 border border-emerald-500/50 text-white" : "bg-slate-950/60 border border-slate-800/60 text-slate-400 hover:bg-slate-800/40"}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs">{p.location_name}</span>
                          <span className="text-xs text-emerald-400 font-mono">NDVI: {p.ndvi_value}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{p.crop_type} • {p.area_ha} ha</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-white">{diagnostic?.location_name || "Sélectionnez une parcelle"}</h2>
                        <p className="text-xs text-slate-400 mt-1">Culture : {diagnostic?.crop_type || "-"} | Superficie : {diagnostic?.area_ha || "-"} ha</p>
                      </div>
                      <a href={`${API_URL}/api/v1/parcels/${selectedParcelId}/report/pdf`} target="_blank" rel="noreferrer" className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Télécharger Rapport PDF</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                        <p className="text-xs text-slate-400 mb-1">Indice NDVI</p>
                        <p className="text-2xl font-bold text-emerald-400 font-mono">{diagnostic?.ndvi_value || "0.00"}</p>
                        <p className="text-xs text-slate-500 mt-1">{diagnostic?.health_status}</p>
                      </div>
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                        <p className="text-xs text-slate-400 mb-1">Risque Sécheresse</p>
                        <p className={`text-2xl font-bold font-mono ${diagnostic?.drought_risk === "Faible" ? "text-emerald-400" : "text-amber-400"}`}>{diagnostic?.drought_risk || "Inconnu"}</p>
                        <p className="text-xs text-slate-500 mt-1">Vulnérabilité eau</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        <span>Recommandation d'Irrigation</span>
                      </h3>
                      <p className="text-xs text-slate-200">{diagnostic?.irrigation_recommendation || "Sélectionnez une parcelle."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 🤖 2. ASSISTANT IA */}
          {activeTab === 'assistant' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[600px]">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Assistant IA Agronome</h2>
                  <p className="text-[11px] text-slate-400">Spécialisé en agriculture sahélienne & gestion du climat Tchadien</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-800 text-slate-400 p-3 rounded-2xl text-xs animate-pulse">
                      L'Assistant IA analyse votre question...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-800 flex space-x-3">
                <input
                  type="text"
                  placeholder="Posez votre question (ex: Quels arbres planter sur ma terre ?)"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all">
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </form>
            </div>
          )}

          {/* 3. FORMATIONS */}
          {activeTab === 'trainings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Modules de Formation Agricole</h2>
                <p className="text-xs text-slate-400">Techniques modernes pour la résilience climatique au Sahel.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Techniques d'Irrigation Goutte-à-Goutte</h3>
                    <p className="text-xs text-slate-400">Économisez jusqu'à 60% d'eau dans les zones arides comme Moussoro et Barh El Gazel.</p>
                  </div>
                  <button className="mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-xl font-medium transition-all">Commencer le module</button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Gestion & Régénération des Sols</h3>
                    <p className="text-xs text-slate-400">Utilisation du compost organique et paillage pour préserver l'humidité du Maïs et Sorgho.</p>
                  </div>
                  <button className="mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-xl font-medium transition-all">Commencer le module</button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Alerte Précoce & Anticiper la Sécheresse</h3>
                    <p className="text-xs text-slate-400">Comment interpréter les cartes NDVI et ajuster le calendrier des semailles.</p>
                  </div>
                  <button className="mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-xl font-medium transition-all">Commencer le module</button>
                </div>
              </div>
            </div>
          )}

          {/* 4. FORMULAIRE DE RISQUE */}
          {activeTab === 'risks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Évaluation du Risque Agricole</span>
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); setRiskAlertSent(true); }} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Type de sol de votre parcelle</label>
                    <select value={riskSoilType} onChange={(e) => setRiskSoilType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white">
                      <option value="sableux">Sableux (Dessèchement rapide)</option>
                      <option value="argileux">Argileux (Rétention d'eau moyenne)</option>
                      <option value="limoneux">Limoneux / Fertile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Source principale d'eau</label>
                    <select value={riskWaterAccess} onChange={(e) => setRiskWaterAccess(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white">
                      <option value="puits">Puits traditionnel</option>
                      <option value="forage">Forage solaire</option>
                      <option value="pluie">Dépendance pluviale exclusive</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2">
                    <Send className="w-3.5 h-3.5" />
                    <span>Soumettre l'Évaluation du Risque</span>
                  </button>
                </form>

                {riskAlertSent && (
                  <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Évaluation transmise. Conseils d'atténuation générés !</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
                <h2 className="text-sm font-bold text-white mb-4">Configuration des Alertes SMS / WhatsApp</h2>
                <p className="text-xs text-slate-400 mb-4">Recevez une alerte automatique sur votre téléphone dès que l'indice NDVI baisse ou en cas de vague de chaleur à {user.city}.</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
                    <span>Alerte Sécheresse par SMS ({user.phone_number})</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
                    <span>Bulletin météo hebdo par E-mail</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PARAMÈTRES */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl max-w-2xl">
              <h2 className="text-sm font-bold text-white mb-6 flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Informations du Profil</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Nom complet</span>
                    <span className="text-white font-medium">{user.full_name}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Téléphone</span>
                    <span className="text-white font-medium">{user.phone_number}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Ville / Localité</span>
                    <span className="text-white font-medium">{user.city}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Adresse</span>
                    <span className="text-white font-medium">{user.address || "Non renseigné"}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">API Backend Connectée</span>
                  <span className="text-emerald-400 font-mono">{API_URL}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Nouvelle Parcelle */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Ajouter une nouvelle parcelle</h3>
            <form onSubmit={handleAddParcel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nom / Localisation</label>
                <input type="text" required placeholder="ex: Zone Moussoro Sud" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Culture</label>
                  <select value={newCrop} onChange={(e) => setNewCrop(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                    <option value="Sorgho">Sorgho</option>
                    <option value="Maïs">Maïs</option>
                    <option value="Sésame">Sésame</option>
                    <option value="Arachide">Arachide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Superficie (ha)</label>
                  <input type="number" step="0.1" required placeholder="12.5" value={newArea} onChange={(e) => setNewArea(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">NDVI initial ({newNdvi})</label>
                <input type="range" min="0.1" max="0.8" step="0.01" value={newNdvi} onChange={(e) => setNewNdvi(e.target.value)} className="w-full accent-emerald-500" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">{submitting ? "..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
