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

/**
 * Interfaz para los cálculos de retorno de inversión
 */
export interface InvestmentCalculation {
  investmentAmount: number;
  estimatedIncome: number;
  netProfit: number;
  projectedReturn: number;
  totalReturn: number;
}

/**
 * Calcula el retorno de inversión basado en utilidad neta esperada
 * @param plantCount - Cantidad de plantas
 * @param costPerPlant - Costo por planta
 * @param marketPrice - Precio promedio en el mercado por planta
 * @param expectedReturnPercentage - Porcentaje de retorno esperado (como decimal, ej: 0.20 para 20%)
 * @returns Objeto con todos los cálculos de la inversión
 */
export function calculateInvestmentReturn(
  plantCount: number,
  costPerPlant: number,
  marketPrice: number,
  expectedReturnPercentage: number
): InvestmentCalculation {
  // Calcular inversión total
  const investmentAmount = plantCount * costPerPlant;
  
  // Calcular ingreso estimado total: plantas × precio de mercado
  const estimatedIncome = plantCount * marketPrice;
  
  // Calcular utilidad neta: ingreso estimado - inversión total
  const netProfit = estimatedIncome - investmentAmount;
  
  // Calcular ganancia esperada: porcentaje esperado × utilidad neta
  const projectedReturn = netProfit * expectedReturnPercentage;
  
  // Calcular retorno total: inversión + ganancia
  const totalReturn = investmentAmount + projectedReturn;
  
  return {
    investmentAmount,
    estimatedIncome,
    netProfit,
    projectedReturn,
    totalReturn
  };
}

/**
 * Calcula el retorno de inversión para una campaña específica
 * @param plantCount - Cantidad de plantas
 * @param campaign - Datos de la campaña
 * @returns Objeto con todos los cálculos de la inversión
 */
export function calculateCampaignInvestmentReturn(
  plantCount: number,
  campaign: { costPerPlant: string; marketPrice: string; expectedReturn: string }
): InvestmentCalculation {
  const costPerPlant = parseFloat(campaign.costPerPlant);
  const marketPrice = parseFloat(campaign.marketPrice);
  const expectedReturnPercentage = parseFloat(campaign.expectedReturn) / 100;
  
  return calculateInvestmentReturn(
    plantCount,
    costPerPlant,
    marketPrice,
    expectedReturnPercentage
  );
}

/**
 * Calcula la cantidad total de plantas que corresponde a la meta de financiamiento
 * @param targetAmount - Meta de financiamiento (como string)
 * @param costPerPlant - Costo por planta (como string)
 * @returns Cantidad total de plantas (redondeada hacia abajo)
 */
export function calculateTotalPlantsFromTarget(
  targetAmount: string,
  costPerPlant: string
): number {
  const target = parseFloat(targetAmount);
  const cost = parseFloat(costPerPlant);
  
  if (isNaN(target) || isNaN(cost) || cost === 0) {
    return 0;
  }
  
  // Redondeamos hacia abajo porque no podemos tener plantas parciales
  return Math.floor(target / cost);
}

/**
 * Formatea un número de plantas para mostrar en la UI
 * @param plantCount - Cantidad de plantas
 * @returns String formateado con separadores de miles
 */
export function formatPlantCount(plantCount: number): string {
  return new Intl.NumberFormat('es-PY').format(plantCount);
}

/**
 * Calcula cuántas plantas ya han sido reservadas basándose en el monto recaudado
 * @param raisedAmount - Monto total recaudado (como string)
 * @param costPerPlant - Costo por planta (como string)
 * @returns Cantidad de plantas ya reservadas
 */
export function calculateReservedPlants(
  raisedAmount: string,
  costPerPlant: string
): number {
  const raised = parseFloat(raisedAmount);
  const cost = parseFloat(costPerPlant);
  
  if (isNaN(raised) || isNaN(cost) || cost === 0) {
    return 0;
  }
  
  return Math.floor(raised / cost);
}

/**
 * Interfaz para información de disponibilidad de plantas
 */
export interface PlantAvailabilityInfo {
  totalPlants: number;
  reservedPlants: number;
  availablePlants: number;
  isFullyFunded: boolean;
  availabilityPercentage: number;
}

/**
 * Calcula la disponibilidad de plantas para una campaña
 * @param campaign - Datos de la campaña
 * @returns Información completa sobre disponibilidad de plantas
 */
export function calculatePlantAvailability(
  campaign: { targetAmount: string; raisedAmount: string; costPerPlant: string }
): PlantAvailabilityInfo {
  const totalPlants = calculateTotalPlantsFromTarget(campaign.targetAmount, campaign.costPerPlant);
  const reservedPlants = calculateReservedPlants(campaign.raisedAmount, campaign.costPerPlant);
  const availablePlants = Math.max(0, totalPlants - reservedPlants);
  const isFullyFunded = availablePlants === 0;
  const availabilityPercentage = totalPlants > 0 ? (availablePlants / totalPlants) * 100 : 0;
  
  return {
    totalPlants,
    reservedPlants,
    availablePlants,
    isFullyFunded,
    availabilityPercentage
  };
}

/**
 * Interfaz para el resultado del formateo de tiempo restante
 */
export interface TimeRemainingInfo {
  text: string;
  // Propiedades de estado (booleanas)
  isExpired?: boolean;
  isUrgent?: boolean;
  isWarning?: boolean;
  isNormal?: boolean;
  isProduction?: boolean;
  // Clase CSS para compatibilidad con campaign-card
  color?: string;
}

/**
 * Opciones para personalizar el comportamiento de formatTimeRemaining
 */
export interface FormatTimeRemainingOptions {
  /** Contexto donde se usa la función para personalizar mensajes */
  context?: 'card' | 'hero' | 'tracking' | 'details';
  /** Si se debe incluir la clase CSS en lugar de flags booleanos */
  includeCssClass?: boolean;
  /** Texto personalizado para cuando la campaña está cerrada */
  closedText?: string;
  /** Si se debe usar un formato más descriptivo (ej: "para reservar") */
  useDescriptiveText?: boolean;
}

/**
 * Formatea el tiempo restante de una campaña de manera unificada
 * @param daysLeft - Días restantes hasta el cierre
 * @param options - Opciones para personalizar el comportamiento
 * @returns Información formateada sobre el tiempo restante
 */
export function formatTimeRemaining(
  daysLeft: number,
  options: FormatTimeRemainingOptions = {}
): TimeRemainingInfo {
  const { 
    context = 'hero', 
    includeCssClass = false, 
    closedText,
    useDescriptiveText = false 
  } = options;
  
  // Determinar el texto para campaña cerrada
  let expiredText = closedText || 'Campaña cerrada';
  if (context === 'card' && !closedText) {
    expiredText = 'Cerrada';
  } else if (context === 'tracking' && !closedText) {
    expiredText = 'Campaña cerrada - En producción';
  }
  
  // Determinar el sufijo del texto - ahora más consistente
  const getSuffix = () => {
    if (context === 'card') return '';
    return ' restantes';
  };
  
  // Determinar el texto para "último día"
  const getLastDayText = () => {
    if (useDescriptiveText || context === 'details') {
      return 'Último día para reservar';
    }
    return 'Último día';
  };
  
  if (daysLeft <= 0) {
    return {
      text: expiredText,
      isExpired: true,
      isProduction: context === 'tracking',
      color: includeCssClass ? 'text-red-600' : undefined
    };
  }
  
  if (daysLeft === 1) {
    return {
      text: getLastDayText(),
      isUrgent: true,
      color: includeCssClass ? 'text-red-600' : undefined
    };
  }
  
  if (daysLeft <= 3) {
    return {
      text: `${daysLeft} días${getSuffix()}`,
      isUrgent: true,
      color: includeCssClass ? 'text-red-600' : undefined
    };
  }
  
  if (daysLeft <= 7) {
    return {
      text: `${daysLeft} días${getSuffix()}`,
      isWarning: true,
      color: includeCssClass ? 'text-orange-600' : undefined
    };
  }
  
  return {
    text: `${daysLeft} días${getSuffix()}`,
    isNormal: true,
    color: includeCssClass ? 'text-muted-foreground' : undefined
  };
}

/**
 * Formatea una fecha para mostrar en español
 * @param date - Fecha a formatear (Date o string ISO)
 * @param options - Opciones de formato Intl.DateTimeFormat
 * @returns Fecha formateada en español
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-PY', options).format(dateObj);
}

/**
 * Formatea una fecha en formato corto (dd/mm/yyyy)
 * @param date - Fecha a formatear
 * @returns Fecha en formato corto
 */
export function formatDateShort(date: Date | string): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea un número de teléfono al formato internacional de Paraguay
 * Solo formatea si el número parece ser paraguayo
 * 
 * @param phoneNumber - Número de teléfono a formatear
 * @returns Número de teléfono en formato internacional (con +)
 * 
 * @example
 * formatPhoneNumber('0981123456') // '+595981123456'
 * formatPhoneNumber('981123456')  // '+595981123456'
 * formatPhoneNumber('+595981123456') // '+595981123456'
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remover espacios, guiones, paréntesis y otros caracteres especiales
  let cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  // Si ya tiene el prefijo +, validar y retornar
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Si empieza con 0, reemplazar por código de país de Paraguay
  if (cleaned.startsWith('0')) {
    return '+595' + cleaned.substring(1);
  }
  
  // Si ya tiene el código de país sin +, agregarlo
  if (cleaned.startsWith('595')) {
    return '+' + cleaned;
  }
  
  // Por defecto, asumir que es un número paraguayo
  return '+595' + cleaned;
}

/**
 * Valida si un número de teléfono tiene un formato válido
 * 
 * @param phoneNumber - Número de teléfono a validar
 * @returns true si el formato es válido
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const formatted = formatPhoneNumber(phoneNumber);
  // Validar que tenga al menos el formato +XXX con números (entre 10 y 15 dígitos)
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(formatted);
}