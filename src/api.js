const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function fetchParcels() {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/`);
    if (!res.ok) throw new Error("Erreur lors de la récupération des parcelles");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [
      { id: 1, name: "Parcelle N'Djamena Nord", latitude: 12.1348, longitude: 15.0557, crop_type: "Maïs", area_ha: 2.5 },
      { id: 2, name: "Parcelle Moussoro Sud", latitude: 13.6406, longitude: 16.4901, crop_type: "Sorgho", area_ha: 4.0 }
    ];
  }
}

export async function createParcel(parcelData) {
  const res = await fetch(`${API_BASE_URL}/parcels/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parcelData),
  });
  if (!res.ok) throw new Error("Erreur lors de la création de la parcelle");
  return await res.json();
}

export async function fetchWaterBalance(parcelId) {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/water-balance`);
    if (!res.ok) throw new Error("Erreur lors du calcul du bilan hydrique");
    return await res.json();
  } catch (err) {
    console.error(err);
    return {
      etc_mm: 5.2,
      precipitation_mm: 0.0,
      deficit_mm: 5.2,
      recommended_irrigation_m3: 130.0,
      status: "IRRIGATION_NEEDED"
    };
  }
}

export function downloadReport(parcelId, format = "pdf") {
  window.open(`${API_BASE_URL}/parcels/${parcelId}/export/${format}`, "_blank");
}
