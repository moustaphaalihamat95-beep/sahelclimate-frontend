'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-3"></div>
      Chargement du SIG & Imagerie Satellite Esri...
    </div>
  )
});

export default function Home() {
  const [activeModule, setActiveModule] = useState(null);

  const modulesData = {
    secheresse: {
      title: "🌤️ Détection Sécheresse & Climat",
      partner: "Agrix Tech / IA Agri",
      content: [
        { label: "Indice de Précipitation (SPI)", val: "-0.85 (Sécheresse Modérée)" },
        { label: "Humidité des Sols", val: "18% - Nécessite Irrigation de soutien" },
        { label: "Prévision Météo (N'Djamena/Sahel)", val: "Ensoleillé, 38°C, Vent Nord-Est 15 km/h" },
        { label: "Préconisation IA", val: "Planifier l'irrigation goutte-à-goutte tôt le matin (05h00) pour réduire l'évaporation de 40%." }
      ]
    },
    arboriculture: {
      title: "🌳 Arboriculture & Agroforesterie",
      partner: "Haller Farmers",
      content: [
        { label: "Anacardier (Haute Rentabilité)", val: "Plantation en quinconces (8m x 8m). Paillage organique obligatoire à la base." },
        { label: "Moringa Oleifera", val: "Fixation de l'azote atmosphérique. Densité : 2500 plants/ha pour production de feuilles." },
        { label: "Citronniers & Agrumes", val: "Protection contre les vents secs avec des haies brise-vent d'Acacia." },
        { label: "Technique de Reverdissement", val: "Réalisation de demi-lunes pour stocker l'eau de pluie au pied des arbres." }
      ]
    },
    calendrier: {
      title: "📅 Calendrier Agricole Intelligent",
      partner: "Plantix / FAO",
      content: [
        { label: "Fenêtre Idéale de Semis", val: "15 Juin - 05 Juillet (Dès la 1ère grande pluie de >20mm)" },
        { label: "Fertilisation Biologique", val: "Apport de compost mûr (5t/ha) 15 jours avant le labour." },
        { label: "Période de Sarclage", val: "1er sarclage à J+15 après levée, 2nd sarclage à J+35." },
        { label: "Récolte & Stockage", val: "Octobre - Novembre. Utilisation de sacs hermétiques PICS sans pesticides." }
      ]
    },
    formations: {
      title: "📚 Formations & Guides Pratiques",
      partner: "Access Agriculture",
      content: [
        { label: "Guide 1 : Compostage Rapide", val: "Technique en tas surélevé avec résidus de culture et fientes d'élevage (21 jours)." },
        { label: "Guide 2 : Gestion Intégrée des Ravageurs", val: "Utilisation d'extraits de feuilles de Neem contre la chenille légionnaire." },
        { label: "Guide 3 : Conservation des Eaux et Sols", val: "Tracé de lignes de niveau et fabrication de diguettes en pierres sèches." },
        { label: "Fiche Vocale SMS / audio", val: "Module prêt pour diffusion en langue locale (Foulfouldé, Arabe Tchadien)." }
      ]
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans max-w-4xl mx-auto pb-24">
      {/* En-tête de l'application */}
      <header className="mb-6 text-center border-b border-slate-800 pb-4">
        <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold mb-2 border border-emerald-500/20">
          🟢 BAMA Startup 2026 - Plateforme Officielle
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
          SahelClimate<span className="text-emerald-400">-IA</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Système d'Information Géographique & IA Agronomique pour le Sahel
        </p>
      </header>

      {/* VRAIE CARTE SATELLITE ESRI */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
          <span>🛰️</span> SIG & Imagerie Satellite en Temps Réel
        </h2>
        <MapComponent />
      </section>

      {/* MODULES INTERACTIFS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 mb-2">
          💡 Services Agronomiques & Formations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Module 1 */}
          <button 
            onClick={() => setActiveModule(activeModule === 'secheresse' ? null : 'secheresse')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeModule === 'secheresse' ? 'bg-slate-800 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">Agrix Tech / IA Agri</span>
              <span className="text-xs text-emerald-400 font-bold">{activeModule === 'secheresse' ? '▲ Masquer' : '▼ Ouvrir'}</span>
            </div>
            <h3 className="font-bold text-white text-base">Détection Sécheresse & Climat</h3>
            <p className="text-xs text-slate-400 mt-1">Analyse météo, prévisions d'irrigation et alertes sécheresse.</p>
          </button>

          {/* Module 2 */}
          <button 
            onClick={() => setActiveModule(activeModule === 'arboriculture' ? null : 'arboriculture')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeModule === 'arboriculture' ? 'bg-slate-800 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">Haller Farmers</span>
              <span className="text-xs text-emerald-400 font-bold">{activeModule === 'arboriculture' ? '▲ Masquer' : '▼ Ouvrir'}</span>
            </div>
            <h3 className="font-bold text-white text-base">Arboriculture & Agroforesterie</h3>
            <p className="text-xs text-slate-400 mt-1">Implantation d'Anacardiers, Moringa et reverdissement des terres.</p>
          </button>

          {/* Module 3 */}
          <button 
            onClick={() => setActiveModule(activeModule === 'calendrier' ? null : 'calendrier')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeModule === 'calendrier' ? 'bg-slate-800 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">Plantix / FAO</span>
              <span className="text-xs text-emerald-400 font-bold">{activeModule === 'calendrier' ? '▲ Masquer' : '▼ Ouvrir'}</span>
            </div>
            <h3 className="font-bold text-white text-base">Calendrier Agricole Intelligent</h3>
            <p className="text-xs text-slate-400 mt-1">Fenêtres optimales de semis, fertilisation et récolte.</p>
          </button>

          {/* Module 4 */}
          <button 
            onClick={() => setActiveModule(activeModule === 'formations' ? null : 'formations')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeModule === 'formations' ? 'bg-slate-800 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">Access Agriculture</span>
              <span className="text-xs text-emerald-400 font-bold">{activeModule === 'formations' ? '▲ Masquer' : '▼ Ouvrir'}</span>
            </div>
            <h3 className="font-bold text-white text-base">Formations & Guides Pratiques</h3>
            <p className="text-xs text-slate-400 mt-1">Modules de formation pas à pas pour les producteurs.</p>
          </button>
        </div>

        {/* PANNEAU D'AFFICHAGE DU MODULE SÉLECTIONNÉ */}
        {activeModule && modulesData[activeModule] && (
          <div className="mt-4 p-5 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-emerald-400">{modulesData[activeModule].title}</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Source : {modulesData[activeModule].partner}
              </span>
            </div>

            <div className="space-y-3">
              {modulesData[activeModule].content.map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
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
