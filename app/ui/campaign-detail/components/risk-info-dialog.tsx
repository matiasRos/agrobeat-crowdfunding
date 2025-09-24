'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Info, TrendingDown, TrendingUp, Shield, BarChart3, Sprout } from 'lucide-react';
import { CampaignResponse } from '@/app/types/campaign';

interface RiskInfoDialogProps {
  riskLevel: CampaignResponse['riskLevel'];
}

export function RiskInfoDialog({ riskLevel }: RiskInfoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getRiskInfo = (risk: CampaignResponse['riskLevel']) => {
    switch (risk) {
      case 'Bajo':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <TrendingUp className="h-4 w-4" />,
          description: 'Menor volatilidad esperada'
        };
      case 'Medio':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertTriangle className="h-4 w-4" />,
          description: 'Volatilidad moderada'
        };
      case 'Alto':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <TrendingDown className="h-4 w-4" />,
          description: 'Mayor volatilidad esperada'
        };
    }
  };

  const riskInfo = getRiskInfo(riskLevel);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          <Info className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Información sobre Riesgos de Inversión
          </DialogTitle>
          <DialogDescription>
            Es importante que entiendas los riesgos antes de invertir
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pb-4">
          {/* Nivel de riesgo actual */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Nivel de riesgo de esta campaña:</span>
            <Badge variant="outline" className={`${riskInfo.color} flex items-center gap-1`}>
              {riskInfo.icon}
              {riskLevel}
            </Badge>
          </div>

          <Separator />

          {/* Información general de riesgos */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Advertencia Importante
            </h4>
            <div className="bg-muted rounded-lg p-3 text-sm border">
              <p className="font-medium mb-2">
                Esta NO es una inversión garantizada como un CDA o préstamo.
              </p>
              <p className="text-muted-foreground">
                Los retornos dependen del desempeño de la producción agrícola y las condiciones del mercado.
              </p>
            </div>
          </div>

          {/* Escenarios de retorno */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Escenarios de Retorno
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Escenario esperado:</strong> El retorno esperado es del 15% al 22%, según el precio de venta de mercado en cosecha.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Escenario desfavorable:</strong> Si el precio baja un 10%, el retorno sería del 12%.
                </span>
              </div>
            </div>
          </div>

          {/* Factores de riesgo */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Factores de Riesgo
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Condiciones climáticas adversas</li>
              <li>• Fluctuaciones en precios de mercado</li>
              <li>• Plagas o enfermedades de cultivos</li>
              <li>• Cambios en regulaciones</li>
              <li>• Problemas logísticos o de transporte</li>
            </ul>
          </div>

          <Separator />

          <div className="bg-muted rounded-lg p-3 text-sm border">
            <p className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Recomendación:</strong> Solo invierte dinero que puedas permitirte perder y considera diversificar tus inversiones.
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
