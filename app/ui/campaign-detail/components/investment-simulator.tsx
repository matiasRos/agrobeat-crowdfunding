'use client';

import { useState, useTransition, useEffect } from 'react';
import { CampaignResponse } from '@/app/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { createInvestment } from '@/app/actions/investments';
import { checkExistingInvestment } from '@/app/actions/check-investment';
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
}

export function InvestmentSimulator({ campaign }: InvestmentSimulatorProps) {
  // Usar valores iniciales basados en la configuración mínima de la campaña
  const [plantCount, setPlantCount] = useState(campaign.minPlants);
  const [isPending, startTransition] = useTransition();
  const [investmentResult, setInvestmentResult] = useState<{ success: boolean; message: string } | null>(null);
  const [existingInvestment, setExistingInvestment] = useState<{
    hasInvestment: boolean;
    investment?: { amount: string; plantCount: number; investedAt: Date };
  } | null>(null);

  // Obtener configuración directamente de la campaña (desde la BD)
  const cropConfig = {
    costPerPlant: parseFloat(campaign.costPerPlant),
    plantsPerM2: campaign.plantsPerM2,
    minPlants: campaign.minPlants,
    maxPlants: campaign.maxPlants,
  };

  // Cálculos
  const investmentAmount = plantCount * cropConfig.costPerPlant;
  const expectedReturn = parseFloat(campaign.expectedReturn) / 100;
  const projectedReturn = investmentAmount * expectedReturn;
  const totalReturn = investmentAmount + projectedReturn;
  const areaNeeded = plantCount / cropConfig.plantsPerM2;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Verificar si el usuario ya tiene una inversión en esta campaña
  useEffect(() => {
    const checkInvestment = async () => {
      const result = await checkExistingInvestment(campaign.id);
      setExistingInvestment(result);
    };

    checkInvestment();
  }, [campaign.id]);

  const handlePlantCountChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    // Permitir escribir libremente sin limitar durante la escritura
    setPlantCount(numValue);
  };

  const handleInputBlur = () => {
    // Aplicar límites solo cuando el usuario termine de escribir (pierde el foco)
    const clampedValue = Math.max(
      cropConfig.minPlants,
      Math.min(cropConfig.maxPlants, plantCount)
    );
    setPlantCount(clampedValue);
  };

  const handleInvestment = () => {
    startTransition(async () => {
      try {
        const result = await createInvestment(campaign.id, plantCount, investmentAmount);
        setInvestmentResult(result);

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
          {!existingInvestment?.hasInvestment && (
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simulador de Inversión
            </CardTitle>
          )}
          {existingInvestment?.hasInvestment && (
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Detalles de la inversión
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input de cantidad de plantas */}
          {!existingInvestment?.hasInvestment && (
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
                  onClick={() => setPlantCount(Math.min(cropConfig.maxPlants, plantCount - 1))}
                  disabled={plantCount <= cropConfig.minPlants}
                >
                  <Minus />
                  <span className="sr-only">Decrease</span>
                </Button>
                <Input
                  id="plant-count"
                  type="number"
                  value={plantCount}
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
                  onClick={() => setPlantCount(Math.max(cropConfig.minPlants, plantCount + 1))}
                  disabled={plantCount >= cropConfig.maxPlants}
                >
                  <Plus />
                  <span className="sr-only">Increase</span>
                </Button>

              </div>
              <div className="text-xs text-center space-y-1 text-muted-foreground">
                <p>
                  Este es un proyecto piloto con una pequeña parcela para validar el modelo de inversión.
                </p>
                <p className={`${plantCount < cropConfig.minPlants || plantCount > cropConfig.maxPlants
                  ? 'text-red-500'
                  : 'text-muted-foreground'
                  }`}>
                  Rango permitido: {cropConfig.minPlants} - {cropConfig.maxPlants} plantas
                  {(plantCount < cropConfig.minPlants || plantCount > cropConfig.maxPlants) && (
                    <span className="block text-red-500">⚠️ Valor fuera del rango permitido</span>
                  )}
                </p>
              </div>
            </div>
          )}
          {!existingInvestment?.hasInvestment && (
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

              <div className="bg-muted border border-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium ">Proyección de Retornos</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Ganancia esperada ({parseFloat(campaign.expectedReturn)}%):</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(projectedReturn)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Retorno total:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(totalReturn)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
          <Separator />

          {/* Inversión existente */}
          {existingInvestment?.hasInvestment && existingInvestment.investment && (
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

          {/* Feedback de inversión */}
          {investmentResult && (
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
                <span className="font-medium">{investmentResult.message}</span>
              </div>
            </div>
          )}

          {/* Botón de inversión */}
          {!existingInvestment?.hasInvestment && (
            <Button
              onClick={handleInvestment}
              disabled={
                isPending ||
                plantCount < cropConfig.minPlants ||
                existingInvestment?.hasInvestment
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
                  Reservar Inversión
                </div>
              )}
            </Button>
          )}
          {!existingInvestment?.hasInvestment && (
          <p className="text-xs text-muted-foreground text-center">
            * Esta es una simulación. Los retornos reales pueden variar.
          </p>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
