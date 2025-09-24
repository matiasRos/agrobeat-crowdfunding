import { CampaignResponse } from '@/app/types/campaign';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MapPin, Clock, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CampaignDetailHeroProps {
  campaign: CampaignResponse;
}

export function CampaignDetailHero({ campaign }: CampaignDetailHeroProps) {
  const progressPercentage = (parseFloat(campaign.raisedAmount) / parseFloat(campaign.targetAmount)) * 100;
  
  // Función para formatear el tiempo restante
  const formatTimeRemaining = (closingDate: string, daysLeft: number) => {
    const closing = new Date(closingDate);
    const now = new Date();
    
    if (daysLeft <= 0) {
      return { text: 'Campaña cerrada', isExpired: true };
    }
    
    if (daysLeft === 1) {
      return { text: 'Último día', isUrgent: true };
    }
    
    if (daysLeft <= 3) {
      return { text: `${daysLeft} días restantes`, isUrgent: true };
    }
    
    if (daysLeft <= 7) {
      return { text: `${daysLeft} días restantes`, isWarning: true };
    }
    
    return { text: `${daysLeft} días restantes`, isNormal: true };
  };
  
  const timeInfo = formatTimeRemaining(campaign.closingDate, campaign.daysLeft);

  const getRiskBadgeVariant = (risk: CampaignResponse['riskLevel']) => {
    switch (risk) {
      case 'Bajo': return 'default';
      case 'Medio': return 'secondary';
      case 'Alto': return 'destructive';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="w-full">
      <div className="relative overflow-hidden">
        {/* Imagen de fondo */}
        <div className="h-[550px] w-full md:h-[450px]">
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay negro transparente */}
          <div className="absolute inset-0 bg-black/80" />
        </div>

        {/* Contenido superpuesto */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white md:p-8 container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8">
          {/* Header con botón volver y badge de riesgo */}
          <div className="flex items-start justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
          
          </div>

          {/* Información principal */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin className="h-4 w-4" />
                {campaign.mapsLink ? (
                  <a
                    href={campaign.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-300 transition-colors underline decoration-1 underline-offset-2"
                  >
                    {campaign.location}
                  </a>
                ) : (
                  <span>{campaign.location}</span>
                )}
                <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                  {campaign.crop}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {campaign.title}
              </h1>

              <p className="text-lg opacity-90 md:text-xl max-w-3xl">
                {campaign.description}
              </p>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm opacity-75">Meta</span>
                </div>
                <p className="font-semibold">
                  {formatCurrency(parseFloat(campaign.targetAmount))}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm opacity-75">Inversores</span>
                </div>
                <p className="font-semibold">{campaign.investorCount}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm opacity-75">Tiempo restante</span>
                </div>
                <p className={`font-semibold ${
                  timeInfo.isExpired ? 'text-red-300' :
                  timeInfo.isUrgent ? 'text-red-300' :
                  timeInfo.isWarning ? 'text-yellow-300' :
                  'text-white'
                }`}>
                  {timeInfo.text}
                </p>
                <p className="text-xs opacity-75">
                  Cierra: {new Date(campaign.closingDate).toLocaleDateString('es-PY', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm opacity-75">Retorno est.</span>
                </div>
                <p className="font-semibold">{parseFloat(campaign.expectedReturn)}%</p>
              </div>
            </div>

            {/* Progreso de financiamiento */}
            <div className="space-y-2 bg-background rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-black">Progreso de financiamiento</span>
                <span className="font-medium text-muted-foreground">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-gray-200" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recaudado: {formatCurrency(parseFloat(campaign.raisedAmount))}</span>
                <span className="text-muted-foreground">Meta: {formatCurrency(parseFloat(campaign.targetAmount))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
