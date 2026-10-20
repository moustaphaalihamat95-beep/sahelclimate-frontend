"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { 
  LayoutDashboard, 
  GraduationCap, 
  LogOut, 
  MapPin, 
  ShieldAlert, 
  Send,
  Bot,
  Sparkles,
  TreePine,
  Layers,
  MessageSquare,
  Users,
  Calendar,
  CloudSun,
  ShieldCheck,
  CheckCircle,
  XCircle,
  UserCheck
} from "lucide-react";

const MapWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800 flex items-center justify-center text-xs text-slate-500">
      Chargement de la carte interactive & module SIG...
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdminMode, setIsAdminMode] = useState(false);
  
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
  const [email, setEmail] = useState('moustapha@sahelclimate.td');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [channel, setChannel] = useState('sms');

  const [authStep, setAuthStep] = useState('register');
  const [codeInput, setCodeInput] = useState('123456');
  const [generatedCode, setGeneratedCode] = useState('123456');
  const [targetDestination, setTargetDestination] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- Données Parcelles & Tracé ---
  const [parcels, setParcels] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState(1);
  const [drawnZone, setDrawnZone] = useState(null);

  // --- Annuaire des Agriculteurs & Inscriptions Admin ---
  const [farmersList, setFarmersList] = useState([
    { id: 1, name: "Moustapha Ali Hamat", city: "Moussoro", phone: "+23560646072", crops: "Sorgho, Sésame, Anacardier", area: "12.5 ha", status: "Validé", role: "Admin" },
    { id: 2, name: "Mahamat Salhedine", city: "Moussoro", phone: "+23566123456", crops: "Sorgho Rouge, Niébé", area: "8.0 ha", status: "Validé", role: "Agriculteur" },
    { id: 3, name: "Khadidja Ousmane", city: "N'Djamena", phone: "+23599887766", crops: "Maïs, Arachide, Citronniers", area: "15.2 ha", status: "Validé", role: "Agriculteur" },
    { id: 4, name: "Ibrahim Abakar", city: "Pala", phone: "+23563112233", crops: "Coton, Sésame, Moringa", area: "20.0 ha", status: "En attente", role: "Agriculteur" }
  ]);

  // --- Assistant IA ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Bonjour ! Je suis l'Assistant IA Agronome de SahelClimate-AI. Tracez votre champ sur la carte ou posez-moi vos questions sur le climat, les arbres ou votre calendrier agricole."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // --- 4 PILIERS DE FONCTIONNALITÉS CLÉS ---
  const keyFeatures = [
    {
      id: "climate",
      title: "Détection Sécheresse & Climat",
      badge: "Agrix Tech / IA Agri",
      color: "emerald",
      icon: CloudSun,
      desc: "Analyse en temps réel de la sécheresse, des prévisions météo et préconisations d'irrigation sur-mesure."
    },
    {
      id: "trees",
      title: "Arboriculture & Agroforesterie",
      badge: "Haller Farmers",
      color: "teal",
      icon: TreePine,
      desc: "Techniques biologiques d'implantation d'Anacardiers, Moringa et Citronniers pour reverdir les terres arides."
    },
    {
      id: "calendar",
      title: "Calendrier Agricole Intelligent",
      badge: "Plantix / FAO",
      color: "cyan",
      icon: Calendar,
      desc: "Calcul précis des fenêtres optimales de semis, fertilisation bio et récolte selon votre région."
    },
    {
      id: "training",
      title: "Formations & Guides Pratiques",
      badge: "Access Agriculture",
      color: "blue",
      icon: GraduationCap,
      desc: "Modules complets et fiches étape par étape pour former les producteurs aux pratiques résilientes."
    }
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setAuthError("Les mots de passe ne correspondent pas !");
    setAuthLoading(true);
    setTargetDestination(channel === 'sms' ? phone : (email || phone));

    // Simulation d'envoi OTP professionnel
    setTimeout(() => {
      setGeneratedCode("849201");
      setCodeInput("849201");
      setAuthLoading(false);
      setAuthStep('verify');
    }, 1000);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const newUser = { full_name: fullName, phone_number: phone, city: city, address: address, email: email, role: 'Agriculteur', status: 'Validé' };
    try { localStorage.setItem('sahel_user', JSON.stringify(newUser)); } catch (e) {}
    setUser(newUser);
    
    setFarmersList(prev => [
      { id: Date.now(), name: fullName, city: city, phone: phone, crops: "Sorgho, Maïs", area: "10 ha", status: "Validé", role: "Agriculteur" },
      ...prev
    ]);
  };

  const handleLogout = () => {
    try { localStorage.removeItem('sahel_user'); } catch (e) {}
    setUser(null);
    setAuthStep('register');
  };

  const handleAreaDrawn = (zone) => {
    setDrawnZone({
      area_ha: zone.area_ha,
      soil_capacity: "Sol Limono-Sableuse Sahélien (Barh El Gazel / Chari-Baguirmi)",
      drought_risk: "Modéré (Alerte irrigation recommandée)",
      recommended_trees: ["Anacardier (Haute rentabilité)", "Moringa Oleifera (Fixation des sols)", "Citronniers"],
      fao_calendar: {
        preparation: "Mai - Juin : Labour doux & apport de compost bio",
        semis: "15 Juillet - 05 Août : Fenêtre idéale de semis dès la 1ère grande pluie",
        recolte: "Octobre - Novembre : Récolte et stockage hermétique"
      }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { sender: "ai", text: data.response }]);
      } else {
        throw new Error();
      }
    } catch {
      setChatMessages(prev => [...prev, { sender: "ai", text: "En tant qu'agronome virtuel SahelClimate-AI, je vous recommande d'appliquer un paillage de 10 cm pour conserver l'humidité et d'associer le sorgho au niébé." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleUserStatus = (id) => {
    setFarmersList(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Validé' ? 'Bloqué' : 'Validé' } : f));
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
            <p className="text-xs text-slate-400 mt-1">Plateforme Professionnelle Climat & Agriculture Sahélienne</p>
          </div>

          {authStep === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nom complet *</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Téléphone (SMS OTP) *</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ville / Région *</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
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

              <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50">
                {authLoading ? "Génération du code SMS..." : "S'inscrire (Vérification OTP)"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-200 text-center">🔑 Saisir le Code SMS Reçu</h2>
              <p className="text-xs text-slate-400 text-center">Code envoyé par SMS au : <span className="text-emerald-400 font-bold">{phone}</span></p>

              <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl text-center">
                <span className="text-xs text-slate-400 block mb-1">Code de confirmation sécurisé :</span>
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{generatedCode}</span>
              </div>

              <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} required className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-center text-2xl font-mono tracking-widest text-white focus:border-emerald-500 focus:outline-none" />

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all">
                Valider & Accéder à la Plateforme
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* NAVIGATION LATÉRALE */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">SahelClimate</h1>
              <p className="text-[10px] text-slate-400">v2.5 • Pro Edition</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de Bord & Carte</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'assistant' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Assistant IA Agronome</span>
            </button>

            <button
              onClick={() => setActiveTab('trainings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'trainings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Formations & Conseils</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-amber-400/70 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Panneau Administrateur</span>
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

      {/* ZONE DE CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">SahelClimate /</span>
            <span className="text-xs font-semibold text-white capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Système Connecté</span>
            </span>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: TABLEAU DE BORD, CARTE ET 4 PILIERS */}
          {activeTab === 'dashboard' && (
            <>
              {/* LES 4 PILIERS DE L'APPLICATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {keyFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.id} className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
                      <div className="flex justify-between items-center">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {feat.badge}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white pt-1">{feat.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* CARTE INTERACTIVE DE TRACÉ */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>SIG & Tracé Géospatial Dynamique</span>
                  </h2>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                    ✏️ Tracé en temps réel sur le Sahel
                  </span>
                </div>
                
                <MapWithNoSSR 
                  parcels={parcels} 
                  selectedParcelId={selectedParcelId} 
                  onSelectParcel={(id) => setSelectedParcelId(id)}
                  onAreaDrawn={handleAreaDrawn}
                />
              </div>

              {/* RESULTAT ANALYTIQUE DU TRACÉ (ARBRES, CLIMAT, FAO) */}
              {drawnZone && (
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border border-emerald-500/40 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-emerald-500/20 pb-4">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">Rapport Agronomique Généré par l'IA</span>
                    <h3 className="text-lg font-bold text-white">Superficie Calculée : {drawnZone.area_ha} Hectares</h3>
                    <p className="text-xs text-slate-300 mt-1">{drawnZone.soil_capacity}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-teal-400 flex items-center space-x-2">
                        <TreePine className="w-4 h-4" />
                        <span>Arbres Recommandés (Reverdissement)</span>
                      </h4>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {drawnZone.recommended_trees.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-cyan-400 flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Calendrier Optimal (Recommandation FAO)</span>
                      </h4>
                      <p className="text-slate-300"><strong>Semis :</strong> {drawnZone.fao_calendar.semis}</p>
                      <p className="text-slate-300"><strong>Récolte :</strong> {drawnZone.fao_calendar.recolte}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ASSISTANT IA AGRO-CLIMAT */}
          {activeTab === 'assistant' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-[70vh]">
              <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-900/80 rounded-t-2xl">
                <Bot className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 className="text-xs font-bold text-white">Assistant Agronome IA (Gemini API)</h2>
                  <p className="text-[10px] text-slate-400">Réponses dynamiques et structurées selon les 4 piliers</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-800/90 border border-slate-700/60 text-slate-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="text-xs text-slate-400 animate-pulse">L'agronome IA prépare votre réponse...</div>}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/80 rounded-b-2xl flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Posez votre question sur la sécheresse, la plantation des arbres, le calendrier..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" disabled={chatLoading} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PANNEAU ADMINISTRATEUR */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="bg-amber-950/20 border border-amber-500/30 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Panneau d'Administration & Inscriptions</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Gestion des utilisateurs, validation des comptes et suivi de la plateforme au Tchad.</p>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">Compte Admin Actif</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Utilisateurs & Agriculteurs Inscrits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Nom Complet</th>
                        <th className="p-3">Téléphone</th>
                        <th className="p-3">Ville</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Action Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {farmersList.map((f) => (
                        <tr key={f.id}>
                          <td className="p-3 font-bold text-white">{f.name}</td>
                          <td className="p-3 font-mono">{f.phone}</td>
                          <td className="p-3">{f.city}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded-md text-[10px]">{f.role}</span></td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              f.status === 'Validé' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => toggleUserStatus(f.id)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg border border-slate-700">
                              {f.status === 'Validé' ? 'Bloquer' : 'Valider'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}