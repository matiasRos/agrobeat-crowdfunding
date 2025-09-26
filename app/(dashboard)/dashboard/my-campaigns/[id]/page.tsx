import { notFound } from 'next/navigation';
import { auth } from '@/app/auth';
import { CampaignService, getUserInvestments } from '@/app/lib/services/campaigns';
import { MyCampaignTrackingContent } from '@/app/ui/my-campaign-tracking/components/my-campaign-tracking-content';

interface MyCampaignTrackingPageProps {
  params: {
    id: string;
  };
}

export default async function MyCampaignTrackingPage({ params }: MyCampaignTrackingPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    notFound();
  }

  const campaignId = parseInt(params.id);
  
  if (isNaN(campaignId)) {
    notFound();
  }

  // Obtener la campaña
  const campaign = await CampaignService.getCampaignById(campaignId);
  
  if (!campaign) {
    notFound();
  }

  // Verificar que el usuario tiene inversiones en esta campaña
  const userInvestments = await getUserInvestments(Number(session.user.id));
  const userInvestment = userInvestments?.find(inv => inv.campaign.id === campaignId);

  if (!userInvestment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <MyCampaignTrackingContent 
        campaign={campaign} 
        userInvestment={userInvestment}
      />
    </div>
  );
}
