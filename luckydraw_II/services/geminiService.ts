
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Always use { apiKey: process.env.API_KEY } for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTeamNames = async (numTeams: number, context: string = "Corporate Office"): Promise<string[]> => {
  if (!process.env.API_KEY) return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    // Fix: Access the .text property directly (it's not a method)
    const text = response.text || '{"names":[]}';
    const data = JSON.parse(text);
    return (data.names || []).slice(0, numTeams);
  } catch (error) {
    console.error("Error generating team names:", error);
    return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);
  }
};
