import { CampaignResponse } from '@/app/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CampaignTimeline } from '@/app/ui/campaign-detail/components/campaign-timeline';
import { ProducerInfoCard } from '@/app/ui/shared/components/producer-info-card';
import { CampaignDetailsCard } from '@/app/ui/shared/components/campaign-details-card';
import {
  Sprout,
  TrendingUp,
  Target,
  DollarSign,
  PieChart,
  Clock
} from 'lucide-react';

interface UserInvestment {
  id: number;
  amount: string;
  plantCount: number;
  createdAt: Date;
}

interface MyCampaignTrackingInfoProps {
  campaign: CampaignResponse;
  userInvestment: UserInvestment;
}

export function MyCampaignTrackingInfo({ campaign, userInvestment }: MyCampaignTrackingInfoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateExpectedReturn = () => {
    const investment = parseFloat(userInvestment.amount);
    const returnRate = parseFloat(campaign.expectedReturn) / 100;
    return investment * returnRate;
  };

  const calculateMyParticipation = () => {
    const myInvestment = parseFloat(userInvestment.amount);
    const totalRaised = parseFloat(campaign.raisedAmount);
    return totalRaised > 0 ? (myInvestment / totalRaised) * 100 : 0;
  };

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {/* Mi Inversión Detallada */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resumen de Mi Inversión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Monto Invertido</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(parseFloat(userInvestment.amount))}
              </p>
              <p className="text-xs text-green-600">
                Invertido el {new Date(userInvestment.createdAt).toLocaleDateString('es-PY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Plantas Reservadas</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {userInvestment.plantCount}
              </p>
              <p className="text-xs text-blue-600">
                A {formatCurrency(parseFloat(campaign.costPerPlant))} c/u
              </p>
            </div>

            <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">Retorno Esperado</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {formatCurrency(calculateExpectedReturn())}
              </p>
              <p className="text-xs text-purple-600">
                {parseFloat(campaign.expectedReturn)}% de retorno
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Mi Participación en la Campaña</span>
              </div>
              <p className="text-xl font-bold">
                {calculateMyParticipation().toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Del total recaudado hasta ahora
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Estado de la Campaña</span>
              </div>
              <p className={`text-xl font-bold ${
                campaign.daysLeft <= 0 ? 'text-green-600' :
                campaign.daysLeft <= 3 ? 'text-red-600' :
                campaign.daysLeft <= 7 ? 'text-orange-600' :
                'text-blue-600'
              }`}>
                {campaign.daysLeft <= 0 ? 'En Producción' :
                 campaign.daysLeft === 1 ? 'Último día' :
                 `${campaign.daysLeft} días restantes`}
              </p>
              <p className="text-sm text-muted-foreground">
                {campaign.daysLeft <= 0 ? 'La campaña está en fase de producción' : 'Para el cierre de reservas'}
              </p>
            </div>
          </div>

          {/* Cronograma de la campaña */}
          {campaign.timeline && campaign.timeline.events.length > 0 && (
            <>
              <Separator />
              <CampaignTimeline campaign={campaign} showAsCard={false} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Información del Productor y Campaña */}
      <div className="space-y-3">
        {/* Información del productor */}
        <ProducerInfoCard 
          producer={campaign.producer}
          location={campaign.location}
          mapsLink={campaign.mapsLink}
          avatarUrl="/osval-foto.jpg"
        />

        {/* Detalles de la campaña */}
        <CampaignDetailsCard campaign={campaign} showTimeline={false} />
      </div>
    </div>
  );
}
