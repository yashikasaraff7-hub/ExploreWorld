export interface CitySuggestion {
  name: string;
  description: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface Attraction {
  name: string;
  benefit: string;
  image_prompt: string;
}

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface DangerZone {
  area: string;
  reason: string;
}

export interface TravelGuideData {
  city: string;
  country: string;
  introduction: string;
  weather: {
    summary: string;
    temperature: string;
    packing_suggestions: string;
  };
  attractions: Attraction[];
  map_context: string;
  itinerary: ItineraryDay[];
  local_tips: {
    transport: string;
    food: string;
    safety: string;
    culture: string;
  };
  danger_zones: DangerZone[];
}

export interface GuideResponse {
  data: TravelGuideData | null;
  error?: string;
}

export enum AppState {
  SELECT_COUNTRY,
  SELECT_CITY,
  VIEW_GUIDE
}

export type BudgetLevel = 'Budget' | 'Moderate' | 'Luxury';
