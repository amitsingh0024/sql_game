import { GoogleGenAI } from "@google/genai";
import { GlitchReport } from '../types';

let client: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (e) {
  console.error("Failed to init Gemini client", e);
}

export const generateSystemStatus = async (): Promise<string> => {
  if (!client) {
    return "MULTIVERSE SYNC: UNSTABLE. MAGIC LEAK DETECTED IN SECTOR 7.";
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a short, high-energy status message for a 'Multiverse Monitor' dashboard. Theme: SQL is magic, reality is breaking. Max 15 words. Use caps.",
    });
    return response.text || "REALITY ANCHOR FAILURE. INITIATING EMERGENCY PATCH.";
  } catch (error) {
    console.warn("Gemini API error", error);
    return "CONNECTION INTERRUPTED. DIMENSIONAL DRIFT ACTIVE.";
  }
};

export const generateGlitchReport = async (): Promise<GlitchReport> => {
  const fallback: GlitchReport = {
    id: "ANOMALY-X99",
    dimension: "THE NULL VOID",
    severity: "CRITICAL",
    technicalFault: "Missing WHERE clause in deletion logic.",
    manifestation: "Everything in the city is slowly turning into the color beige.",
    flavor: "It's super boring and literally erasing personalities."
  };

  if (!client) return fallback;

  try {
    const prompt = `
      Generate a JSON object for a 'Reality Glitch' in a game where SQL is magic.
      The glitch is a database error manifesting as a physical crisis in a multiverse.
      
      Theme: Spider-Verse style, chaotic, funny, Gen Alpha friendly.
      
      Fields:
      - id: string (e.g. RIFT-01)
      - dimension: string (e.g. Neon Tokyo, The Floating Isles)
      - severity: 'LOW' | 'CRITICAL' | 'REALITY_COLLAPSE'
      - technicalFault: string (The SQL error, e.g., 'Unbounded JOIN')
      - manifestation: string (The physical chaos, e.g., 'Every cat is now an infinite hydra.')
      - flavor: string (Witty comment from a squad member)
      
      Return ONLY valid JSON.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    return JSON.parse(text) as GlitchReport;

  } catch (error) {
    console.warn("Gemini API error for report", error);
    return fallback;
  }
};