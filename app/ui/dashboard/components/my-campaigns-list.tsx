import { auth } from '@/app/auth';
import { getUserInvestments } from '@/app/lib/services/campaigns';
import { MyCampaignCard } from './my-campaign-card';

/**
 * Lista de campañas en las que el usuario ha invertido
 */
export async function MyCampaignsList() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  const userInvestments = await getUserInvestments(session.user.email);
  
  // Si no hay inversiones, no renderizar nada
  if (!userInvestments || userInvestments.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {userInvestments.map((investment) => (
        <MyCampaignCard 
          key={investment.campaign.id} 
          campaign={investment.campaign}
          userInvestment={{
            id: investment.id,
            amount: investment.amount,
            plantCount: investment.plantCount,
            createdAt: investment.createdAt,
          }}
        />
      ))}
    </div>
  );
}
