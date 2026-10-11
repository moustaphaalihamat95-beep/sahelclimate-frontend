const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sahelclimate-api.onrender.com";

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Erreur de connexion");
  return await res.json();
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error("Erreur d'inscription");
  return await res.json();
}

export async function fetchParcels() {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels`);
    if (!res.ok) throw new Error("Erreur");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function createParcel(parcelData) {
  const res = await fetch(`${API_BASE_URL}/parcels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parcelData),
  });
  if (!res.ok) throw new Error("Erreur création");
  return await res.json();
}

export async function fetchWaterBalance(parcelId) {
  const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/water-balance`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function fetchParcelNdvi(parcelId) {
  const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/ndvi`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function fetchSolarPumping(parcelId) {
  const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/solar-pumping`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function fetchAiAdvice(parcelId) {
  const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/ai-advice`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function fetchReforestationAdvice(parcelId) {
  const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/reforestation-ai`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function fetchTrainings() {
  const res = await fetch(`${API_BASE_URL}/trainings`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function fetchCommunityPosts() {
  const res = await fetch(`${API_BASE_URL}/community`);
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export async function createCommunityPost(author, message) {
  const res = await fetch(`${API_BASE_URL}/community`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, message }),
  });
  if (!res.ok) throw new Error("Erreur");
  return await res.json();
}

export function downloadReport(parcelId, format = "pdf") {
  window.open(`${API_BASE_URL}/parcels/${parcelId}/export/${format}`, "_blank");
}

// Test intelligent multi-routes pour l'inscription par téléphone
export async function registerWithPhone(name, phone, password) {
  const paths = [
    "/auth/register-phone",
    "/register-phone",
    "/api/auth/register-phone",
    "/api/register-phone"
  ];
  let res;
  for (const path of paths) {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });
    if (res.status !== 404) break;
  }
  if (!res || !res.ok) throw new Error("Erreur d'inscription par téléphone");
  return await res.json();
}

export async function confirmPhoneCode(phone, confirmation_code) {
  const paths = [
    "/auth/confirm-phone",
    "/confirm-phone",
    "/api/auth/confirm-phone",
    "/api/confirm-phone"
  ];
  let res;
  for (const path of paths) {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, confirmation_code }),
    });
    if (res.status !== 404) break;
  }
  if (!res || !res.ok) throw new Error("Code de confirmation incorrect");
  return await res.json();
}

export async function loginWithPhone(phone, password) {
  const paths = [
    "/auth/login-phone",
    "/login-phone",
    "/api/auth/login-phone",
    "/api/login-phone"
  ];
  let res;
  for (const path of paths) {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    if (res.status !== 404) break;
  }
  if (!res || !res.ok) throw new Error("Erreur de connexion");
  return await res.json();
}

export async function sendChatMessage(message, zone) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, zone }),
  });
  if (!res.ok) throw new Error("Erreur de communication avec l'assistant");
  return await res.json();
}

export async function fetchParcelWeather(parcelId) {
  const res = await fetch(`${API_BASE_URL}/parcels/${parcelId}/weather`);
  if (!res.ok) throw new Error("Erreur météo");
  return await res.json();
}
