import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { prompt, contextData } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      Tu es l'intelligence artificielle centrale de "SahelClimate-IA", un assistant agronomique expert du Sahel et particulièrement du Tchad.
      Ton rôle est d'analyser les questions des agriculteurs et de fournir des réponses d'une grande précision scientifique, pratiques, structurées et adaptées aux conditions climatiques locales (gestion de la sécheresse, types de sols, techniques d'irrigation, choix des semences résistantes).
      
      Données contextuelles de la parcelle (si ce n'est pas vide) : ${JSON.stringify(contextData || {})}
      
      Réponds toujours de manière claire, professionnelle, avec des conseils actionnables étape par étape, exactement comme le font les grands assistants conversationnels (ChatGPT ou Gemini).
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    const responseText = result.response.text();

    return res.status(200).json({ success: true, response: responseText });
  } catch (error) {
    console.error("Erreur IA:", error);
    return res.status(500).json({ success: false, error: "Erreur lors de la génération de la réponse par l'IA." });
  }
}