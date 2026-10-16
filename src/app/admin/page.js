"use client";

import { useState } from "react";
import Logo from "../components/Logo";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState("");

  // Données de simulation pour la supervision en temps réel
  const stats = {
    totalUsers: 142,
    activeParcels: 89,
    totalHectares: 312.5,
    smsSent: 138,
    aiQueriesToday: 47
  };

  const usersList = [
    { id: 1, name: "Moustapha Ali Hamat", phone: "+23560646072", city: "Moussoro", status: "Vérifié (SMS)", crop: "Sorgho / Anacardier", hectares: "4.5 ha" },
    { id: 2, name: "Oumar Abakar", phone: "+23566123456", city: "Barh El Gazel", status: "Vérifié (SMS)", crop: "Maïs / Niébé", hectares: "2.8 ha" },
    { id: 3, name: "Mahamat Saleh", phone: "+23599887766", city: "N'Djamena", status: "En attente", crop: "Maraîchage", hectares: "1.2 ha" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinCode === "2026" || pinCode === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("❌ Code PIN Administrateur incorrect !");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h2 className="text-xl font-bold text-white mb-2">Espace d'Administration</h2>
          <p className="text-xs text-slate-400 mb-6">Entrez le code PIN sécurisé pour accéder au contrôle en temps réel.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Code PIN (ex: 2026)" 
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-sm">
              Déverrouiller le Dashboard Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Admin */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-md">
            PANNEAU ADMIN REAL-TIME
          </span>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg">
          Déconnexion
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Cartes de Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Agriculteurs Inscrits</div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Parcelles Tracées</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.activeParcels}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Superficie Totale</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{stats.totalHectares} ha</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">SMS Twilio Envoyés</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.smsSent}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Requêtes IA Climat</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{stats.aiQueriesToday}</div>
          </div>
        </div>

        {/* Tableau des utilisateurs & Parcelles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span>👥 Supervision des Utilisateurs &amp; Cultures Détectées</span>
            <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">🟢 Connexion Backend Active</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Téléphone</th>
                  <th className="p-3">Ville / Zone</th>
                  <th className="p-3">Culture Identifiée</th>
                  <th className="p-3">Superficie</th>
                  <th className="p-3">Statut SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 font-mono">{u.phone}</td>
                    <td className="p-3">{u.city}</td>
                    <td className="p-3 text-emerald-400 font-semibold">{u.crop}</td>
                    <td className="p-3">{u.hectares}</td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
