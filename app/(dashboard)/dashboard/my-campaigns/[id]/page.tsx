import { notFound } from 'next/navigation';
import { auth } from '@/app/auth';
import { CampaignService } from '@/app/lib/services/campaigns';
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

  // Verificar si el usuario es admin
  const isAdmin = session.user.role === 'admin';

  // Obtener la campaña con la inversión del usuario en una sola consulta optimizada
  // Si es admin, no se requiere inversión (requireInvestment = false)
  const result = await CampaignService.getCampaignWithUserInvestment(
    campaignId,
    Number(session.user.id),
    !isAdmin // requireInvestment: false si es admin, true si no lo es
  );

  // Si no existe la campaña o (no es admin y no tiene inversión), retornar 404
  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <MyCampaignTrackingContent 
        campaign={result.campaign} 
        userInvestment={result.userInvestment}
      />
    </div>
  );
}
