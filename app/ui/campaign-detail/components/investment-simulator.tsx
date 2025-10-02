'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignResponse } from '@/app/types/campaign';
import { ExistingInvestmentResult } from '@/app/actions/check-investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { createInvestment } from '@/app/actions/investments';
import { calculateCampaignInvestmentReturn, formatCurrency, calculatePlantAvailability, formatPlantCount } from '@/lib/utils';
import {
  Calculator,
  Sprout,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  DollarSign
} from 'lucide-react';

interface InvestmentSimulatorProps {
  campaign: CampaignResponse;
  existingInvestment: ExistingInvestmentResult;
}

export function InvestmentSimulator({ campaign, existingInvestment }: InvestmentSimulatorProps) {
  const router = useRouter();

  // Usar valores iniciales basados en la configuración mínima de la campaña
  const [plantCount, setPlantCount] = useState(campaign.minPlants);
  const [inputValue, setInputValue] = useState(campaign.minPlants.toString());
  const [isPending, startTransition] = useTransition();
  const [investmentResult, setInvestmentResult] = useState<{ success: boolean; message: string } | null>(null);

  // Obtener configuración directamente de la campaña (desde la BD)
  const cropConfig = {
    costPerPlant: parseFloat(campaign.costPerPlant),
    plantsPerM2: campaign.plantsPerM2,
    minPlants: campaign.minPlants,
    maxPlants: campaign.maxPlants,
  };

  // Cálculos de disponibilidad de plantas
  const availability = calculatePlantAvailability(campaign);

  // Verificar si la campaña está cerrada (por tiempo o por plantas agotadas)
  const isCampaignClosed = campaign.daysLeft <= 0 || availability.isFullyFunded;
  const isClosedByTime = campaign.daysLeft <= 0;
  const isClosedByFullyFunded = availability.isFullyFunded && campaign.daysLeft > 0;

  // Cálculos basados en utilidad neta esperada usando función utilitaria
  const calculations = calculateCampaignInvestmentReturn(plantCount, campaign);
  const { investmentAmount, estimatedIncome, netProfit, projectedReturn, totalReturn } = calculations;

  const handlePlantCountChange = (value: string) => {
    // Permitir escribir libremente, incluyendo strings vacíos
    setInputValue(value);

    // Solo actualizar plantCount si hay un número válido
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setPlantCount(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < cropConfig.minPlants) {
      const newValue = cropConfig.minPlants;
      setPlantCount(newValue);
      setInputValue(newValue.toString());
      return;
    }

    // Aplicar límites considerando plantas disponibles
    const maxAllowed = Math.min(
      cropConfig.maxPlants,
      availability.availablePlants
    );

    const clampedValue = Math.max(
      cropConfig.minPlants,
      Math.min(maxAllowed, numValue)
    );
    setPlantCount(clampedValue);
    setInputValue(clampedValue.toString());
  };

  const handleInvestment = () => {
    startTransition(async () => {
      try {
        const result = await createInvestment(campaign.id, plantCount, investmentAmount);
        setInvestmentResult(result);

        // Si la inversión fue exitosa, redirigir después de 3 segundos
        if (result.success) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      } catch (error) {
        setInvestmentResult({
          success: false,
          message: 'Error inesperado al procesar la inversión'
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulador principal */}
      <Card >
        <CardHeader>
          {/* Titulo del simulador */}
          {isCampaignClosed && !existingInvestment.hasInvestment && (
            <CardTitle className="flex items-center gap-2 text-green-800 font-medium">
              <CheckCircle className="h-5 w-5" />
              Campaña completamente financiada
            </CardTitle>
          )}
          {isCampaignClosed && existingInvestment.hasInvestment && (
            <CardTitle className="flex items-center gap-2 text-blue-800 font-medium">
              <CheckCircle className="h-5 w-5" />
              Tu reserva está en producción
            </CardTitle>
          )}
          {!isCampaignClosed && !existingInvestment.hasInvestment && (
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simulador de Inversión
            </CardTitle>
          )}
          {!isCampaignClosed && existingInvestment.hasInvestment && (
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Detalles de la inversión
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mensaje de campaña cerrada por tiempo */}
          {isClosedByTime && !existingInvestment.hasInvestment && (
            <div className="rounded-lg p-4 border bg-red-50 border-red-200 text-red-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Esta campaña ya está cerrada</span>
              </div>
              <div className="text-sm space-y-1">
                <p>El período de reservas finalizó el {new Date(campaign.closingDate).toLocaleDateString('es-PY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}.</p>
                <p>La campaña ahora está en fase de producción. Si ya tienes una reserva activa, puedes hacer seguimiento desde tu dashboard.</p>
              </div>
            </div>
          )}

          {/* Mensaje de campaña completamente financiada */}
          {isClosedByFullyFunded && !existingInvestment.hasInvestment && (
            <div className="rounded-lg p-4 border bg-green-50 border-green-200 text-green-800">
              <div className="text-sm space-y-1">
                <p>Esta campaña alcanzó el 100% de su meta de financiamiento.</p>
                <p>Ya no hay plantas disponibles para reservar. ¡Gracias por tu interés!</p>
                <p className="mt-2 font-medium">Mantente atento a futuras oportunidades de inversión.</p>
              </div>
            </div>
          )}

          {/* Input de cantidad de plantas - Solo si campaña activa y sin inversión previa */}
          {!isCampaignClosed && !existingInvestment.hasInvestment && (
            <div className="space-y-4">
              <Label htmlFor="plant-count" className="flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Cantidad de plantas de {campaign.crop.toLowerCase()}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => {
                    const newValue = Math.max(cropConfig.minPlants, plantCount - 1);
                    setPlantCount(newValue);
                    setInputValue(newValue.toString());
                  }}
                  disabled={plantCount <= cropConfig.minPlants}
                >
                  <Minus />
                  <span className="sr-only">Decrease</span>
                </Button>
                <Input
                  id="plant-count"
                  type="number"
                  value={inputValue}
                  onChange={(e) => handlePlantCountChange(e.target.value)}
                  onBlur={handleInputBlur}
                  min={cropConfig.minPlants}
                  max={cropConfig.maxPlants}
                  className="text-center text-lg font-semibold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => {
                    const maxAllowed = Math.min(cropConfig.maxPlants, availability.availablePlants);
                    const newValue = Math.min(maxAllowed, plantCount + 1);
                    setPlantCount(newValue);
                    setInputValue(newValue.toString());
                  }}
                /*disabled={plantCount >= Math.min(cropConfig.maxPlants, availability.availablePlants)}*/
                >
                  <Plus />
                  <span className="sr-only">Increase</span>
                </Button>

              </div>
              <div className="text-xs text-center space-y-1 text-muted-foreground">
                <p>
                  Este es un proyecto piloto con una pequeña parcela para validar el modelo de inversión.
                </p>


                <p className={`${plantCount < cropConfig.minPlants ||
                  plantCount > Math.min(cropConfig.maxPlants, availability.availablePlants)
                  ? 'text-red-500'
                  : 'text-muted-foreground'
                  }`}>
                  Rango permitido: {cropConfig.minPlants} - {Math.min(cropConfig.maxPlants, availability.availablePlants)} plantas
                  {(plantCount < cropConfig.minPlants || plantCount > Math.min(cropConfig.maxPlants, availability.availablePlants)) && (
                    <span className="block text-red-500">⚠️ Valor fuera del rango permitido</span>
                  )}
                </p>
              </div>
            </div>
          )}
          
          {/* Cálculos y proyecciones - Solo si campaña activa y sin inversión previa */}
          {!isCampaignClosed && !existingInvestment.hasInvestment && (
            <>
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Costo por planta:</span>
                    <span className="font-medium">{formatCurrency(cropConfig.costPerPlant)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-sm font-medium">Inversión total:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(investmentAmount)}
                    </span>
                  </div>
                </div>

                <div className="bg-muted border border-muted rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Proyección de Retornos</span>
                  </div>

                  {/* Desglose del cálculo */}
                  <div className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Precio promedio de venta por unidad:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(campaign.marketPrice))}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ingreso estimado ({plantCount} plantas):</span>
                        <span className="font-medium">{formatCurrency(estimatedIncome)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Menos inversión inicial:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(investmentAmount)}</span>
                      </div>

                      <Separator className="my-2" />

                      <div className="flex justify-between items-center">
                        <span className="font-medium">Utilidad neta:</span>
                        <span className="font-bold">{formatCurrency(netProfit)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Ganancia esperada */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ganancia esperada ({parseFloat(campaign.expectedReturn)}% de utilidad neta):</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(projectedReturn)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Retorno total a recibir:</span>
                        <span className="font-bold text-xl">
                          {formatCurrency(totalReturn)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Inversión existente - campaña activa */}
          {!isCampaignClosed && existingInvestment.hasInvestment && existingInvestment.investment && (
            <div className="rounded-lg p-4 border bg-green-50 border-none text-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Ya tienes una reserva activa</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Plantas reservadas:</strong> {existingInvestment.investment.plantCount}</p>
                <p><strong>Monto invertido:</strong> {formatCurrency(parseFloat(existingInvestment.investment.amount))}</p>
                <p><strong>Fecha de reserva:</strong> {new Date(existingInvestment.investment.investedAt).toLocaleDateString('es-PY')}</p>
              </div>
            </div>
          )}

          {/* Inversión existente - campaña cerrada */}
          {isCampaignClosed && existingInvestment.hasInvestment && existingInvestment.investment && (
            <div className="rounded-lg p-4 border bg-blue-50 border-blue-200 text-blue-800">
              <div className="text-sm space-y-1">
                <p><strong>Plantas reservadas:</strong> {existingInvestment.investment.plantCount}</p>
                <p><strong>Monto invertido:</strong> {formatCurrency(parseFloat(existingInvestment.investment.amount))}</p>
                <p><strong>Fecha de reserva:</strong> {new Date(existingInvestment.investment.investedAt).toLocaleDateString('es-PY')}</p>
                <p className="mt-2 font-medium">Puedes hacer seguimiento del progreso desde tu dashboard.</p>
              </div>
            </div>
          )}

          {/* Feedback de inversión - Solo si campaña activa y sin inversión previa */}
          {!isCampaignClosed && !existingInvestment.hasInvestment && investmentResult && (
            <div className={`rounded-lg p-4 border ${investmentResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              <div className="flex items-center gap-2">
                {investmentResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <div className="flex-1">
                  <span className="font-medium">{investmentResult.message}</span>
                  {investmentResult.success && (
                    <div className="mt-2 text-sm">
                      Redirigiendo al dashboard en unos segundos...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón de inversión y disclaimer - Solo si campaña activa y sin inversión previa */}
          {!isCampaignClosed && !existingInvestment.hasInvestment && (
            <>
              <Button
                onClick={handleInvestment}
                disabled={
                  isPending ||
                  plantCount < cropConfig.minPlants ||
                  plantCount > availability.availablePlants ||
                  availability.isFullyFunded ||
                  existingInvestment.hasInvestment
                }
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Procesando inversión...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Reservar {plantCount} plantas
                  </div>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                * Simulación basada en utilidad neta esperada según precio de mercado actual. Los retornos reales pueden variar según condiciones del mercado y la producción.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
