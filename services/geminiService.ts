import { GoogleGenAI, Type } from "@google/genai";
import { CitySuggestion, GuideResponse, TravelGuideData, BudgetLevel } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches a list of popular cities for a given country.
 */
export const getCitySuggestions = async (country: string): Promise<CitySuggestion[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Suggest 6 popular travel destinations (cities or regions) in ${country}. Return a JSON array where each item has a 'name' and a short 'description'.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as CitySuggestion[];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

/**
 * Generates a full structured travel guide.
 */
export const getTravelGuide = async (city: string, country: string, days: number, budget: BudgetLevel): Promise<GuideResponse> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Act as a friendly, expert local travel guide.
      Create a comprehensive travel guide for **${city}, ${country}** for a ${days}-day trip with a **${budget}** budget.
      
      Include:
      1. Introduction (2-3 sentences)
      2. Weather (Summary, Temp, Packing suggestions) based on current month.
      3. Top 5 Attractions (Name, Benefit, and a VERY SHORT visual description prompt for generating an image - max 3-5 words, mostly nouns).
      4. Map Context (Description of layout).
      5. Itinerary for ${days} days (Morning, Afternoon, Evening). Ensure activities fit the ${budget} budget.
      6. Local Tips (Transport, Food, Safety, Culture).
      7. Danger Zones (Specific areas to avoid or be careful in).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            introduction: { type: Type.STRING },
            weather: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                temperature: { type: Type.STRING },
                packing_suggestions: { type: Type.STRING }
              },
              required: ["summary", "temperature", "packing_suggestions"]
            },
            attractions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  image_prompt: { type: Type.STRING, description: "3-5 words visual description of the landmark." }
                },
                required: ["name", "benefit", "image_prompt"]
              }
            },
            map_context: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  morning: { type: Type.STRING },
                  afternoon: { type: Type.STRING },
                  evening: { type: Type.STRING }
                },
                required: ["day", "morning", "afternoon", "evening"]
              }
            },
            local_tips: {
              type: Type.OBJECT,
              properties: {
                transport: { type: Type.STRING },
                food: { type: Type.STRING },
                safety: { type: Type.STRING },
                culture: { type: Type.STRING }
              },
              required: ["transport", "food", "safety", "culture"]
            },
            danger_zones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["area", "reason"]
              }
            }
          },
          required: ["city", "country", "introduction", "weather", "attractions", "map_context", "itinerary", "local_tips", "danger_zones"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as TravelGuideData;

    return {
      data: data
    };

  } catch (error) {
    console.error("Error generating guide:", error);
    return {
      data: null,
      error: "Failed to generate guide."
    };
  }
};