import { CampaignResponse } from '@/app/types/campaign';
import { MyCampaignTrackingHero } from './my-campaign-tracking-hero';
import { MyCampaignTrackingInfo } from './my-campaign-tracking-info';


interface UserInvestment {
  id: number;
  amount: string;
  plantCount: number;
  isPaid: boolean;
  createdAt: Date;
  campaign: CampaignResponse;
}

interface MyCampaignTrackingContentProps {
  campaign: CampaignResponse;
  userInvestment: UserInvestment;
}

export function MyCampaignTrackingContent({ campaign, userInvestment }: MyCampaignTrackingContentProps) {
  return (
    <>
      {/* Hero section con información de seguimiento */}
      <MyCampaignTrackingHero campaign={campaign} userInvestment={userInvestment} />
      
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-3">
          {/* Información detallada */}
          <div className="lg:col-span-3">
            <MyCampaignTrackingInfo campaign={campaign} userInvestment={userInvestment} />
          </div>
        </div>
      </div>
    </>
  );
}
