import { auth } from '@/app/auth';
import { getUserInvestments } from '@/app/lib/services/campaigns';
import { MyCampaignCard } from './my-campaign-card';

// Función para agrupar inversiones por mes de cierre de campaña
function groupInvestmentsByMonth(investments: any[]) {
  const groups = new Map<string, any[]>();
  
  investments.forEach((investment) => {
    const date = new Date(investment.campaign.closingDate);
    const monthKey = date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(investment);
  });
  
  // Convertir a array y ordenar por fecha
  return Array.from(groups.entries())
    .map(([monthKey, investments]) => ({
      month: monthKey,
      investments: investments.sort((a, b) => 
        new Date(a.campaign.closingDate).getTime() - new Date(b.campaign.closingDate).getTime()
      )
    }))
    .sort((a, b) => {
      // Ordenar grupos por el mes más temprano de cada grupo
      const dateA = new Date(a.investments[0].campaign.closingDate);
      const dateB = new Date(b.investments[0].campaign.closingDate);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Lista de campañas en las que el usuario ha invertido
 */
export async function MyCampaignsList() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const userInvestments = await getUserInvestments(Number(session.user.id));
  
  // Si no hay inversiones, no renderizar nada
  if (!userInvestments || userInvestments.length === 0) {
    return null;
  }

  // Agrupar inversiones por mes
  const investmentsByMonth = groupInvestmentsByMonth(userInvestments);

  return (
    <div className="space-y-8">
      {investmentsByMonth.map(({ month, investments: monthInvestments }) => (
        <div key={month} className="space-y-4">
          {/* Subtítulo del mes */}
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-semibold text-foreground capitalize">
              {month}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {monthInvestments.length} {monthInvestments.length === 1 ? 'inversión' : 'inversiones'} activa{monthInvestments.length === 1 ? '' : 's'}
            </p>
          </div>
          
          {/* Grid de campañas del mes */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {monthInvestments.map((investment) => (
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
        </div>
      ))}
    </div>
  );
}
