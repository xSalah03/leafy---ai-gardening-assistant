
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PlantDetails, ChatMessage } from "../types";

// Using gemini-2.5-flash for high performance and search-grounding capabilities.
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Helper to clean JSON strings from the model response.
 */
const cleanJsonResponse = (text: string): string => {
  if (!text) return "";
  return text.replace(/```json\n?|```/g, "").trim();
};

export const identifyPlant = async (base64Image: string): Promise<PlantDetails> => {
  // Using environment variable directly as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this image. First, determine if the main subject is a real plant (living biological plant).
    Identify it and provide comprehensive details in JSON format.
    
    Fields required:
    - isPlant: boolean. True if it is a plant, false if it is an inanimate object, animal, person, or unrecognized.
    - commonName: The most widely used name (or object name if not a plant).
    - scientificName: The Latin botanical name (or "N/A" if not a plant).
    - description: A brief, poetic overview.
    - healthStatus: A quick assessment (or "N/A" if not a plant).
    - care: An object containing water, light, temperature, soil, fertilizer, suggestedWaterDays, and suggestedFertilizeDays. 
      (If isPlant is false, provide "N/A" for string fields and 0 for numeric fields).
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isPlant: { type: Type.BOOLEAN },
          commonName: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          description: { type: Type.STRING },
          healthStatus: { type: Type.STRING },
          care: {
            type: Type.OBJECT,
            properties: {
              water: { type: Type.STRING },
              light: { type: Type.STRING },
              temperature: { type: Type.STRING },
              soil: { type: Type.STRING },
              fertilizer: { type: Type.STRING },
              suggestedWaterDays: { type: Type.INTEGER },
              suggestedFertilizeDays: { type: Type.INTEGER }
            },
            required: ["water", "light", "temperature", "soil", "fertilizer", "suggestedWaterDays", "suggestedFertilizeDays"]
          }
        },
        required: ["isPlant", "commonName", "scientificName", "description", "care"]
      }
    }
  });

  const rawText = response.text;
  if (!rawText) throw new Error("The AI returned an empty response.");
  
  try {
    const cleanedText = cleanJsonResponse(rawText);
    const data = JSON.parse(cleanedText);
    
    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
  } catch (e) {
    console.error("JSON Parsing Error:", rawText);
    throw new Error("Failed to parse botanical data. Clearer photo needed.");
  }
};

export interface ChatResponse {
  text: string;
  sources?: { title: string; uri: string }[];
}

export const chatWithAssistant = async (history: ChatMessage[]): Promise<ChatResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }]
    })),
    config: {
      systemInstruction: "You are 'Leafy', an expert botanist. Help users identify plants and troubleshooting care issues. You use Google Search to stay updated on local planting times and pests. Be professional, warm, and highly practical.",
      tools: [{ googleSearch: {} }]
    }
  });

  const textContent = response.text || "I apologize, I couldn't find an answer for that right now.";

  // Enhanced safe extraction of grounding chunks for website citations
  // Explicitly checking for candidates, metadata, and chunks as requested.
  const candidate = response.candidates?.[0];
  const groundingMetadata = candidate?.groundingMetadata;
  const groundingChunks = groundingMetadata?.groundingChunks;

  let sources: { title: string; uri: string }[] = [];

  if (Array.isArray(groundingChunks)) {
    sources = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || chunk.maps?.title || 'External Resource',
        uri: chunk.web?.uri || chunk.maps?.uri || ''
      }))
      .filter((s: { title: string; uri: string }) => s.uri !== '');
  }

  return {
    text: String(textContent),
    sources: sources.length > 0 ? sources : undefined
  };
};

export const generatePlantImage = async (commonName: string, description: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Truncate description to provide a concise prompt context
  const shortDesc = description.slice(0, 300); 

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ 
          text: `A professional, realistic botanical photograph of the plant ${commonName}. ${shortDesc}. The image should be highly detailed, showing foliage and natural characteristics suitable for a gardening app.` 
        }]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Error generating plant image:", e);
  }
  return null;
};

export const generateObjectImage = async (commonName: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ 
          text: `A clean, high-quality, minimalist illustration or 3D icon of ${commonName} centered on a neutral, soft gray background. The style should be modern and suitable for a professional app interface.` 
        }]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Error generating object image:", e);
  }
  return null;
};
