
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Always use { apiKey: process.env.API_KEY } for initialization as per guidelines
export const generateTeamNames = async (numTeams: number, context: string = "Corporate Office"): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Returning default team names.");
    return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate ${numTeams} creative and professional team names for a company event. The theme is: ${context}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            names: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["names"]
        }
      }
    });

    const text = response.text || '{"names":[]}';
    const data = JSON.parse(text);
    return (data.names || []).slice(0, numTeams);
  } catch (error) {
    console.error("Error generating team names:", error);
    return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);
  }
};
