import { CampaignResponse } from '@/app/types/campaign';
import { CampaignDetailHero } from './campaign-detail-hero';
import { CampaignDetailInfo } from './campaign-detail-info';
import { InvestmentSimulator } from './investment-simulator';

interface CampaignDetailContentProps {
  campaign: CampaignResponse;
}

export function CampaignDetailContent({ campaign }: CampaignDetailContentProps) {
  return (
    <>
      {/* Hero section con imagen y título */}
      <CampaignDetailHero campaign={campaign} />
      <div >
        <main className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8 ">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Información detallada de la campaña */}
            <div className="lg:col-span-2">
              <InvestmentSimulator campaign={campaign} />
            </div>
            <div className="lg:col-span-1">
              <CampaignDetailInfo campaign={campaign} />
            </div>

            {/* Simulador de inversión */}

          </div>
        </main>
      </div>

    </>
  );
}
