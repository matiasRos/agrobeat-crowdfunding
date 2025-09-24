import { CampaignResponse } from '@/app/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CampaignTimeline } from './campaign-timeline';
import { RiskInfoDialog } from './risk-info-dialog';
import {
  User,
  Award,
  MapPin,
  Sprout,
  Calendar,
  TrendingUp,
  Shield,
  Target,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface CampaignDetailInfoProps {
  campaign: CampaignResponse;
}

export function CampaignDetailInfo({ campaign }: CampaignDetailInfoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskBadgeVariant = (risk: CampaignResponse['riskLevel']) => {
    switch (risk) {
      case 'Bajo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alto':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Detalles de la campaña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detalles de la Campaña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Meta de Financiamiento</span>
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(parseFloat(campaign.targetAmount))}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Fecha de Cierre</span>
              </div>
              <p className="text-xl font-bold">
                {new Date(campaign.closingDate).toLocaleDateString('es-PY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className={`text-sm font-medium ${
                campaign.daysLeft <= 0 ? 'text-red-600' :
                campaign.daysLeft <= 3 ? 'text-red-600' :
                campaign.daysLeft <= 7 ? 'text-orange-600' :
                'text-muted-foreground'
              }`}>
                {campaign.daysLeft <= 0 ? 'Campaña cerrada' :
                 campaign.daysLeft === 1 ? 'Último día para reservar' :
                 `${campaign.daysLeft} días restantes`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Retorno Esperado</span>
                <RiskInfoDialog riskLevel={campaign.riskLevel} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold">
                  {parseFloat(campaign.expectedReturn)}%
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Riesgo:</span>
                  <Badge variant="outline" className={`text-xs ${getRiskBadgeVariant(campaign.riskLevel)} flex items-center gap-1`}>
                    <AlertTriangle className="h-3 w-3" />
                    {campaign.riskLevel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma integrado */}
          {campaign.timeline && campaign.timeline.events.length > 0 && (
            <>
              <Separator />
              <CampaignTimeline campaign={campaign} showAsCard={false} />
            </>
          )}
        </CardContent>
      </Card>
      {/* Información del productor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Productor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{campaign.producer.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">

                <span>{campaign.producer.experience} años de experiencia</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Award className="h-4 w-4" /> Verificado
            </Badge>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span><strong>Ubicación:</strong> {campaign.location}</span>
              </div>
              {campaign.mapsLink && (
                <a
                  href={campaign.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver en Maps
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
