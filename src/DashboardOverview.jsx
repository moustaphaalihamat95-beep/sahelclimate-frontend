import React, { useState, useEffect } from 'react';
import { fetchParcels } from './api';

export default function DashboardOverview() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchParcels();
      setParcels(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Calculs macroscopiques agrégés
  const totalParcels = parcels.length;
  const totalAreaHa = parcels.reduce((acc, p) => acc + (parseFloat(p.area_ha) || 0), 0);
  
  // Estimation globale (simulée ou calculée par parcelle)
  const estimatedTotalWaterM3 = totalAreaHa * 130.0; // Moyenne indicative par hectare

  // Répartition par type de culture
  const cropCounts = parcels.reduce((acc, p) => {
    acc[p.crop_type] = (acc[p.crop_type] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement du tableau de bord global...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '25px' }}>
        <h1 style={{ color: '#166534', fontSize: '1.8rem', marginBottom: '5px' }}>📊 Tableau de Bord Coopérative & Région</h1>
        <p style={{ color: '#4b5563' }}>Vue macroscopique et consolidée de l'ensemble des parcelles agricoles suivies.</p>
      </header>

      {/* Cartes de Synthèse (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '5px solid #166534' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Total Parcelles Suivies</p>
          <h2 style={{ fontSize: '2rem', color: '#111827' }}>{totalParcels}</h2>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '5px solid #0284c7' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Superficie Totale Cultivée</p>
          <h2 style={{ fontSize: '2rem', color: '#111827' }}>{totalAreaHa.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>ha</span></h2>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '5px solid #d97706' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Besoin Total en Eau Estimé</p>
          <h2 style={{ fontSize: '2rem', color: '#111827' }}>{estimatedTotalWaterM3.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>m³</span></h2>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '5px solid #10b981' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Statut Global des Réseaux</p>
          <h2 style={{ fontSize: '1.2rem', color: '#15803d', marginTop: '10px' }}>🟢 Opérationnel</h2>
        </div>
      </div>

      {/* Section des détails et répartitions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Répartition par cultures */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111827' }}>🌱 Répartition par Cultures</h3>
          {Object.keys(cropCounts).length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Aucune donnée de culture disponible.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(cropCounts).map(([crop, count]) => (
                <li key={crop} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: '500' }}>{crop}</span>
                  <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {count} parcelle(s)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Liste rapide des parcelles enregistrées */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111827' }}>📍 Dernières Parcelles Actives</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', color: '#4b5563' }}>
                  <th style={{ padding: '8px' }}>Nom</th>
                  <th style={{ padding: '8px' }}>Culture</th>
                  <th style={{ padding: '8px' }}>Surface</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px', fontWeight: '500' }}>{p.name}</td>
                    <td style={{ padding: '8px', color: '#4b5563' }}>{p.crop_type}</td>
                    <td style={{ padding: '8px', color: '#4b5563' }}>{p.area_ha} ha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
