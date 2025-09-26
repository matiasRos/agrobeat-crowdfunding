import { CampaignResponse } from '@/app/types/campaign';
import { ProducerInfoCard } from '@/app/ui/shared/components/producer-info-card';
import { CampaignDetailsCard } from '@/app/ui/shared/components/campaign-details-card';

interface CampaignDetailInfoProps {
  campaign: CampaignResponse;
}

export function CampaignDetailInfo({ campaign }: CampaignDetailInfoProps) {
  return (
    <div className="space-y-3">
      {/* Detalles de la campaña */}
      <CampaignDetailsCard campaign={campaign} />
      
      {/* Información del productor */}
      <ProducerInfoCard 
        producer={campaign.producer}
        location={campaign.location}
        mapsLink={campaign.mapsLink}
        showTitle={true}
        avatarUrl="/osval-foto.jpg"
      />
    </div>
  );
}
