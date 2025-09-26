import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Calendar, Clock, TrendingUp } from "lucide-react"
import { CampaignResponse } from "@/app/types/campaign"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CampaignStageInfo {
  stage: string;
  description: string;
  colorClasses: string;
  icon: typeof Clock | typeof Calendar | typeof TrendingUp;
  daysInfo: string | null;
}

// Clases estáticas para asegurar que Tailwind las incluya en el build
const stageColors = {
  preparation: 'bg-blue-50 text-blue-700',
  upcoming: 'bg-gray-50 text-gray-700 ', 
  active: 'bg-green-50 text-green-700 ',
  final: 'bg-purple-50 text-purple-700 '
} as const;

/**
 * Determina la etapa actual de una campaña basándose en su timeline
 * @param campaign - La campaña con su timeline
 * @returns Información sobre la etapa actual
 */
export function getCurrentCampaignStage(campaign: CampaignResponse): CampaignStageInfo {
  if (!campaign.timeline?.events || campaign.timeline.events.length === 0) {
    return {
      stage: 'En preparación',
      description: 'La campaña está en preparación',
      colorClasses: stageColors.preparation,
      icon: Clock,
      daysInfo: null
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparación exacta
  
  const events = campaign.timeline.events
    .map(event => ({
      ...event,
      dateObj: new Date(event.date)
    }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Encontrar la etapa actual
  let currentEvent = null;
  let nextEvent = null;

  for (let i = 0; i < events.length; i++) {
    const eventDate = new Date(events[i].date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate <= today) {
      currentEvent = events[i];
    } else {
      nextEvent = events[i];
      break;
    }
  }

  // Si no hay evento actual, significa que aún no ha comenzado la primera etapa
  if (!currentEvent) {
    const firstEvent = events[0];
    const daysUntilStart = Math.ceil((firstEvent.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      stage: 'Próximamente',
      description: `${firstEvent.title} el ${firstEvent.dateObj.toLocaleDateString('es-PY')}`,
      colorClasses: stageColors.upcoming,
      icon: Calendar,
      daysInfo: daysUntilStart > 0 ? `Faltan ${daysUntilStart} días` : 'Comienza hoy'
    };
  }

  // Si hay evento actual pero también hay siguiente, mostrar el actual
  if (nextEvent) {
    const daysUntilNext = Math.ceil((nextEvent.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      stage: currentEvent.title,
      description: currentEvent.description || `Etapa de ${currentEvent.title.toLowerCase()}`,
      colorClasses: stageColors.active,
      icon: TrendingUp,
      daysInfo: daysUntilNext > 0 ? `Siguiente: ${nextEvent.title} en ${daysUntilNext} días` : `Siguiente: ${nextEvent.title}`
    };
  }

  // Si estamos en la última etapa
  return {
    stage: currentEvent.title,
    description: currentEvent.description || `Etapa de ${currentEvent.title.toLowerCase()}`,
    colorClasses: stageColors.final,
    icon: TrendingUp,
    daysInfo: 'Etapa final'
  };
}

/**
 * Formatea una cantidad en guaraníes paraguayos
 * @param amount - La cantidad a formatear
 * @returns String formateado como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
  }).format(amount);
}
