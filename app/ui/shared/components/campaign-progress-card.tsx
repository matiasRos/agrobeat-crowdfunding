import { Progress } from '@/components/ui/progress';
import { calculateReservedPlants, calculateTotalPlantsFromTarget, formatPlantCount } from '@/lib/utils';

interface CampaignProgressCardProps {
  raisedAmount: string;
  targetAmount: string;
  investorCount: number;
  className?: string;
  title?: string;
  showInvestorCount?: boolean;
  // Nuevos props para mostrar información de plantas
  costPerPlant?: string;
  crop?: string;
  showPlantInfo?: boolean;
}

export function CampaignProgressCard({ 
  raisedAmount, 
  targetAmount, 
  investorCount, 
  className = "",
  title = "Progreso total de la campaña",
  showInvestorCount = true,
  costPerPlant,
  crop,
  showPlantInfo = false
}: CampaignProgressCardProps) {
  const progressPercentage = (parseFloat(raisedAmount) / parseFloat(targetAmount)) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calcular información de plantas si está disponible
  const plantInfo = showPlantInfo && costPerPlant ? {
    totalPlants: calculateTotalPlantsFromTarget(targetAmount, costPerPlant),
    reservedPlants: calculateReservedPlants(raisedAmount, costPerPlant)
  } : null;
  
  // Calcular plantas restantes
  const remainingPlants = plantInfo ? Math.max(0, plantInfo.totalPlants - plantInfo.reservedPlants) : 0;

  return (
    <div className={`space-y-2 bg-background rounded-lg p-4 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-black">{title}</span>
        <span className="font-medium text-muted-foreground">
          {progressPercentage.toFixed(1)}%
        </span>
      </div>
      <Progress value={progressPercentage} className="h-3 bg-gray-200" />
      <div className="flex justify-between text-sm">
        {showInvestorCount ? (
          <span className="text-muted-foreground">
            {investorCount} inversores participando
          </span>
        ) : (
          <span className="text-muted-foreground">
            Recaudado: {formatCurrency(parseFloat(raisedAmount))}
          </span>
        )}
        <span className="text-muted-foreground">
          {showInvestorCount ? (
            `${formatCurrency(parseFloat(raisedAmount))} / ${formatCurrency(parseFloat(targetAmount))}`
          ) : (
            `Meta: ${formatCurrency(parseFloat(targetAmount))}`
          )}
        </span>
      </div>
      
      {/* Información de plantas */}
      {plantInfo && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {formatPlantCount(plantInfo.reservedPlants)} plantas reservadas
          </span>
          <span>
            {remainingPlants > 0 
              ? `${formatPlantCount(remainingPlants)} plantas restantes`
              : '¡Meta completada!'
            }
          </span>
        </div>
      )}
    </div>
  );
}
