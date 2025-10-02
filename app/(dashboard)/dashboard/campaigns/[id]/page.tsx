import { notFound } from 'next/navigation';
import { CampaignService } from '@/app/lib/services/campaigns';
import { checkExistingInvestment } from '@/app/actions/check-investment';
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

  // Obtener campaña e inversión existente en paralelo
  const [campaign, existingInvestment] = await Promise.all([
    CampaignService.getCampaignById(campaignId),
    checkExistingInvestment(campaignId)
  ]);

  if (!campaign) {
    notFound();
  }

  return <CampaignDetailContent campaign={campaign} existingInvestment={existingInvestment} />;

}
