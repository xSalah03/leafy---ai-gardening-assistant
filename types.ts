
export interface CareInstructions {
  water: string;
  light: string;
  temperature: string;
  soil: string;
  fertilizer: string;
  suggestedWaterDays: number;
  suggestedFertilizeDays: number;
}

export interface Reminder {
  id: string;
  plantId: string;
  plantName: string;
  type: 'water' | 'fertilizer';
  lastDone: number;
  intervalDays: number;
  nextDue: number;
  history?: number[];
}

export interface PlantDetails {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  care: CareInstructions;
  healthStatus?: string;
  timestamp: number;
  imageUrl?: string;
  reminders?: Reminder[];
  isPlant?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RecognitionResult {
  plant: PlantDetails;
}
