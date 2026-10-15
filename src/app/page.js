"use client";

import { useState } from "react";
import Logo from "./components/Logo";

export default function Home() {
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
        "Techniques de conservation des grains stockés (sacs hermétiques hermétiques)"
      ],
      impact: "Zéro perte de récolte post-récolte et diminution des frais d'intrants."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Barre de Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <Logo />
        <div className="flex gap-2">
          <a href="#modules" className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 font-semibold transition">
            Formations (4)
          </a>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="px-4 py-10 max-w-5xl mx-auto text-center">
        <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full mb-3">
          🎓 Académie SahelClimate-IA
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Modules de Formation Agricole
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Techniques modernes et adaptées à la résilience climatique au Tchad et dans le Sahel. Apprenez à optimiser vos récoltes et protéger vos terres.
        </p>
      </section>

      {/* Grille des 4 Modules */}
      <section id="modules" className="px-4 pb-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${mod.color}`}>
                  {mod.badge}
                </span>
                <span className="text-xs text-slate-500 font-mono">Module #{mod.id}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">{mod.subtitle}</p>
            </div>

            <button
              onClick={() => setSelectedModule(mod)}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <span>Commencer le module</span>
              <span>➔</span>
            </button>
          </div>
        ))}
      </section>

      {/* Fenêtre Modale Interactive du Cours */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            {/* Bouton Fermer */}
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            {/* En-tête de la modale */}
            <div className="mb-6">
              <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${selectedModule.color} mb-2`}>
                {selectedModule.badge}
              </span>
              <h2 className="text-2xl font-black text-white">{selectedModule.title}</h2>
              <p className="text-slate-400 text-xs mt-1">{selectedModule.subtitle}</p>
            </div>

            {/* Description */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Résumé de la formation</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{selectedModule.description}</p>
            </div>

            {/* Étapes pratiques */}
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

            {/* Impact mesuré */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 mb-6 flex items-center gap-3">
              <span className="text-xl">📈</span>
              <div>
                <div className="text-[11px] font-bold text-amber-400">Impact Terrain Attendu</div>
                <div className="text-xs text-slate-300">{selectedModule.impact}</div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={() => alert("✅ Fiche de cours téléchargée en mode hors-ligne pour votre téléphone !")}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold py-2.5 rounded-xl transition text-center"
              >
                📥 Télécharger la Fiche PDF
              </button>
              <button
                onClick={() => setSelectedModule(null)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition text-center shadow-lg shadow-emerald-900/30"
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
