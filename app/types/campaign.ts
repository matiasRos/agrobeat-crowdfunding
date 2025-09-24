// Re-exportamos los tipos de la base de datos para mantener compatibilidad
export type { Campaign, NewCampaign } from '@/app/lib/db/schema';

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
  // Campos para simulador de inversión
  costPerPlant: string;
  plantsPerM2: number;
  minPlants: number;
  maxPlants: number;
  producer: {
    name: string;
    experience: number;
  };
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
  // Campos para simulador de inversión
  costPerPlant: number;
  plantsPerM2: number;
  minPlants: number;
  maxPlants: number;
  // Datos del productor
  producerName: string;
  producerExperience: number;
  producerEmail?: string;
  producerPhone?: string;
  producerLocation?: string;
}
