import { CampaignResponse } from '@/app/types/campaign';
import { Button } from '@/components/ui/button';
import { CampaignProgressCard } from '@/app/ui/shared/components/campaign-progress-card';
import { PaymentStatusBadge } from '@/app/ui/shared/components';
import { formatTimeRemaining, formatCurrency } from '@/lib/utils';
import { ArrowLeft, MapPin, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CampaignStoriesLoader } from './campaign-stories-loader';

interface UserInvestment {
  id: number;
  amount: string;
  plantCount: number;
  isPaid: boolean;
  createdAt: Date;
}

interface MyCampaignTrackingHeroProps {
  campaign: CampaignResponse;
  userInvestment: UserInvestment;
}

export function MyCampaignTrackingHero({ campaign, userInvestment }: MyCampaignTrackingHeroProps) {
  const timeInfo = formatTimeRemaining(campaign.daysLeft, { context: 'tracking' });

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
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
            {/* Badge en mobile - esquina superior */}
            <div className="md:hidden">
              <PaymentStatusBadge isPaid={userInvestment.isPaid} />
            </div>
          </div>

          {/* Información principal */}
          <div className="space-y-4">
            <div className="space-y-2">
              {/* Título con ícono */}
              <div className="flex items-start justify-center gap-4">
                {/* Ícono de la campaña - clickeable para abrir stories */}
                <div className="flex-shrink-0">
                  <CampaignStoriesLoader
                    campaignId={campaign.id}
                    campaignTitle={campaign.title}
                    iconUrl={campaign.iconUrl || campaign.imageUrl}
                    imageUrl={campaign.imageUrl}
                  />
                </div>

                {/* Título y descripción */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                      {campaign.title}
                    </h1>
                    {/* Badge en desktop - al lado del título */}
                    <div className="hidden md:block">
                      <PaymentStatusBadge isPaid={userInvestment.isPaid} />
                    </div>
                  </div>

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
