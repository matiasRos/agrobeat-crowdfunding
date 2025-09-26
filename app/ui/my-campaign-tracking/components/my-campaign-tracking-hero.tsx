import { CampaignResponse } from '@/app/types/campaign';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CampaignProgressCard } from '@/app/ui/shared/components/campaign-progress-card';
import { ArrowLeft, MapPin, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface UserInvestment {
  id: number;
  amount: string;
  plantCount: number;
  createdAt: Date;
}

interface MyCampaignTrackingHeroProps {
  campaign: CampaignResponse;
  userInvestment: UserInvestment;
}

export function MyCampaignTrackingHero({ campaign, userInvestment }: MyCampaignTrackingHeroProps) {
  
  // Función para formatear el tiempo restante
  const formatTimeRemaining = (closingDate: string, daysLeft: number) => {
    if (daysLeft <= 0) {
      return { text: 'Campaña cerrada - En producción', isProduction: true };
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
        <div className="h-[200px] w-full md:h-[200px]">
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
          {/* Header con botón volver */}
          <div className="flex items-start justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
            <Badge variant="outline" className="border-green-400 bg-green-500/20 text-green-300">
              Mi Inversión
            </Badge>
          </div>

          {/* Información principal */}
          <div className="space-y-4">
            <div className="space-y-2">
              {/* Título con ícono */}
              <div className="flex items-start justify-center gap-4">
                {/* Ícono de la campaña */}
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-secondary p-3">
                    <Image
                      src={campaign.iconUrl || campaign.imageUrl}
                      alt={campaign.title}
                      className="h-full w-full object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                </div>

                {/* Título y descripción */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                    {campaign.title}
                  </h1>

                  <p className="text-lg opacity-90 md:text-xl max-w-3xl mt-2">
                    Seguimiento de tu inversión en la producción de {campaign.crop}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
