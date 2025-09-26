// Re-exportamos los tipos de la base de datos para mantener compatibilidad
export type { Campaign, NewCampaign, CampaignTimeline, NewCampaignTimeline } from '@/app/lib/db/schema';

// Tipo para la respuesta de la API
export interface CampaignResponse {
  id: number;
  title: string;
  description: string;
  crop: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  investorCount: number;
  closingDate: string; // Fecha límite para reservas (ISO string)
  daysLeft: number; // Calculado dinámicamente
  expectedReturn: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  imageUrl: string;
  iconUrl?: string;
  mapsLink?: string;
  // Campos para simulador de inversión
  costPerPlant: string;
  plantsPerM2: number;
  minPlants: number;
  maxPlants: number;
  marketPrice: string;
  producer: {
    name: string;
    experience: number;
  };
  timeline?: {
    title: string;
    events: Array<{
      title: string;
      date: string; // ISO string
      description?: string;
    }>;
  };
  // Indica si el usuario ya invirtió en esta campaña
  isInvestedByUser?: boolean;
}

// Tipo para crear/actualizar campañas desde el frontend
export interface CampaignInput {
  title: string;
  description: string;
  crop: string;
  location: string;
  targetAmount: number;
  closingDate: string; // Fecha límite para reservas (ISO string)
  expectedReturn: number;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  imageUrl: string;
  iconUrl?: string;
  mapsLink?: string;
  // Campos para simulador de inversión
  costPerPlant: number;
  plantsPerM2: number;
  minPlants: number;
  maxPlants: number;
  marketPrice: number;
  // Datos del productor
  producerName: string;
  producerExperience: number;
  producerEmail?: string;
  producerPhone?: string;
  producerLocation?: string;
  // Cronograma de la campaña
  timelineTitle?: string;
  timelineEvents?: Array<{
    title: string;
    date: string; // ISO string
    description?: string;
  }>;
}
