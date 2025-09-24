import { notFound } from 'next/navigation';
import { CampaignService } from '@/app/lib/services/campaigns';
import { CampaignDetailContent } from '@/app/ui/campaign-detail/components/campaign-detail-content';

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const campaignId = parseInt(params.id, 10);

  if (isNaN(campaignId)) {
    notFound();
  }

  const campaign = await CampaignService.getCampaignById(campaignId);

  if (!campaign) {
    notFound();
  }

  return <CampaignDetailContent campaign={campaign} />;

}
