"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-slate-900 animate-pulse rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500">
      Chargement de la carte interactive...
    </div>
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [parcels, setParcels] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState(1);
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [filter, setFilter] = useState("all");

  // État du Formulaire Modal
  const [showForm, setShowForm] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newCrop, setNewCrop] = useState("Sorgho");
  const [newArea, setNewArea] = useState("");
  const [newNdvi, setNewNdvi] = useState("0.45");
  const [submitting, setSubmitting] = useState(false);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/parcels`);
      if (!res.ok) throw new Error("API non disponible");
      const data = await res.json();
      setParcels(Array.isArray(data) ? data : []);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
      setParcels([
        { id: 1, location_name: "Parcelle N'Djamena Nord", area_ha: 15.2, crop_type: "Maïs", ndvi_value: 0.52 },
        { id: 2, location_name: "Zone Bahr El Gazel", area_ha: 8.7, crop_type: "Sorgho", ndvi_value: 0.38 }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiagnostic = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/parcels/${id}/diagnostic`);
      if (!res.ok) throw new Error("Erreur lors de la récupération");
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
          color_code: "green",
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
          color_code: "orange",
          irrigation_recommendation: "Augmenter la fréquence d'irrigation (18-20 mm/semaine)"
        });
      }
    }
  }, []);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  useEffect(() => {
    if (selectedParcelId) {
      fetchDiagnostic(selectedParcelId);
    }
  }, [selectedParcelId, fetchDiagnostic]);

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
        setNewLocation("");
        setNewArea("");
      }
    } catch {
      alert("Erreur lors de l'enregistrement de la parcelle.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParcels = parcels.filter((p) => {
    if (filter === "high") return p.ndvi_value >= 0.5;
    if (filter === "low") return p.ndvi_value < 0.5;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans relative">
      <header className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">SahelClimate-AI</h1>
          <p className="text-xs text-slate-400">Plateforme de Suivi Agricole & Cartographique</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
          >
            <span>+ Ajouter une Parcelle</span>
          </button>
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
            <span className={`w-3 h-3 rounded-full ${backendConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
            <span className="text-xs text-slate-300">
              {backendConnected ? "Backend Connecté" : "Mode Hors-Ligne"}
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto space-y-6">
        {/* Carte Leaflet en Haut */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Carte Interactive des Parcelles</h2>
          <MapWithNoSSR
            parcels={parcels}
            selectedParcelId={selectedParcelId}
            onSelectParcel={(id) => setSelectedParcelId(id)}
          />
        </div>

        {/* Diagnostic et Liste */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Parcelles</h2>
            
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded text-xs font-medium ${filter === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("high")}
                className={`px-3 py-1 rounded text-xs font-medium ${filter === "high" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                NDVI High
              </button>
              <button
                onClick={() => setFilter("low")}
                className={`px-3 py-1 rounded text-xs font-medium ${filter === "low" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                NDVI Low
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-56 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-xs text-slate-400 animate-pulse">Chargement...</p>
              ) : filteredParcels.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">Aucune parcelle dans cette catégorie.</p>
              ) : (
                filteredParcels.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedParcelId(p.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedParcelId === p.id
                        ? "bg-emerald-950/60 border border-emerald-500/50 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{p.location_name}</span>
                      <span className="text-xs text-emerald-400 font-mono">NDVI: {p.ndvi_value}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {p.crop_type} • {p.area_ha} ha
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{diagnostic?.location_name || "Sélectionnez une parcelle"}</h2>
                  <p className="text-xs text-slate-400 mt-1">Culture : {diagnostic?.crop_type || "-"} | Superficie : {diagnostic?.area_ha || "-"} ha</p>
                </div>
                <a
                  href={`${API_URL}/api/v1/parcels/${selectedParcelId}/report/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
                >
                  <span>📄 Imprimer Rapport PDF</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Indice Santé Végétale (NDVI)</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">{diagnostic?.ndvi_value || "0.00"}</p>
                  <p className="text-xs text-slate-500 mt-1">{diagnostic?.health_status}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Risque de Sécheresse</p>
                  <p className={`text-2xl font-bold font-mono ${diagnostic?.drought_risk === "Faible" ? "text-emerald-400" : "text-amber-400"}`}>
                    {diagnostic?.drought_risk || "Inconnu"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Indice de vulnérabilité hydrique</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommandation d'Irrigation</h3>
                <p className="text-sm text-slate-200">{diagnostic?.irrigation_recommendation || "Sélectionnez une parcelle pour afficher la recommandation."}</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
              SahelClimate-AI System v1.0 • Tchad & Zone Sahélienne
            </div>
          </div>
        </div>
      </section>

      {/* Modal d'ajout de parcelle */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Ajouter une nouvelle parcelle</h3>
            <form onSubmit={handleAddParcel} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nom / Localisation</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Zone Moussoro Sud"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Culture</label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sorgho">Sorgho</option>
                    <option value="Maïs">Maïs</option>
                    <option value="Sésame">Sésame</option>
                    <option value="Arachide">Arachide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Superficie (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="12.5"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valeur NDVI estimée ({newNdvi})</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.01"
                  value={newNdvi}
                  onChange={(e) => setNewNdvi(e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
