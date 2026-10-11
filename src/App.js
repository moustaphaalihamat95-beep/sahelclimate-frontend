import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sahelclimate-api.onrender.com";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [plantDiagnosis, setPlantDiagnosis] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);

  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Gestion du choix / de la capture de photo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPlantDiagnosis('');
    }
  };

  // Envoi de l'image au backend pour analyse
  const handleAnalyzePlant = async () => {
    if (!selectedImage) return alert("Veuillez sélectionner ou prendre une photo de plante.");
    
    setLoadingImage(true);
    setPlantDiagnosis('');

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-plant-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setPlantDiagnosis(data.diagnosis);
      } else {
        setPlantDiagnosis(`Erreur : ${data.detail || "Problème d'analyse"}`);
      }
    } catch (error) {
      setPlantDiagnosis(`Erreur de connexion : ${error.message}`);
    } finally {
      setLoadingImage(false);
    }
  };

  // Gestion du fichier audio
  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAudio(file);
      setTranscription('');
    }
  };

  // Envoi de l'audio au backend pour transcription
  const handleTranscribeAudio = async () => {
    if (!selectedAudio) return alert("Veuillez sélectionner ou enregistrer un fichier audio.");

    setLoadingAudio(true);
    setTranscription('');

    const formData = new FormData();
    formData.append('file', selectedAudio);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/voice-to-text`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setTranscription(data.text);
      } else {
        setTranscription(`Erreur : ${data.detail || "Problème de transcription"}`);
      }
    } catch (error) {
      setTranscription(`Erreur de connexion : ${error.message}`);
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🌱 Tumaï Green Sahel</h1>
        <p>Assistant IA Agro-Écologique pour le Sahel</p>
      </header>

      <main className="main-content">
        {/* Module Vision / Diagnostic Photo */}
        <section className="card">
          <h2>📸 Diagnostic Santé de la Plante</h2>
          <p>Prenez une photo d'une feuille ou culture malade pour obtenir un traitement écologique.</p>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            id="cameraInput"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          
          <div className="button-group">
            <button 
              className="btn btn-secondary"
              onClick={() => document.getElementById('cameraInput').click()}
            >
              📷 Prendre / Chosir une photo
            </button>
            
            {selectedImage && (
              <button 
                className="btn btn-primary" 
                onClick={handleAnalyzePlant}
                disabled={loadingImage}
              >
                {loadingImage ? "Analyse en cours..." : "🔍 Analyser la plante"}
              </button>
            )}
          </div>

          {imagePreview && (
            <div className="preview-container">
              <img src={imagePreview} alt="Aperçu culture" className="image-preview" />
            </div>
          )}

          {plantDiagnosis && (
            <div className="result-box">
              <h3>Résultat du Diagnostic :</h3>
              <p>{plantDiagnosis}</p>
            </div>
          )}
        </section>

        {/* Module Vocal / Whisper */}
        <section className="card">
          <h2>🎙️ Assistant Vocal Agricole</h2>
          <p>Posez votre question en enregistrant un message vocal.</p>

          <input 
            type="file" 
            accept="audio/*" 
            id="audioInput"
            onChange={handleAudioChange}
            style={{ display: 'none' }}
          />

          <div className="button-group">
            <button 
              className="btn btn-secondary"
              onClick={() => document.getElementById('audioInput').click()}
            >
              🎤 Sélectionner / Enregistrer un vocal
            </button>

            {selectedAudio && (
              <button 
                className="btn btn-primary" 
                onClick={handleTranscribeAudio}
                disabled={loadingAudio}
              >
                {loadingAudio ? "Transcription en cours..." : "📝 Transcrire la voix"}
              </button>
            )}
          </div>

          {transcription && (
            <div className="result-box">
              <h3>Texte transcrit :</h3>
              <p>{transcription}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
