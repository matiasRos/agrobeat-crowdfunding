import { auth } from '@/app/auth';
import { getUserInvestments } from '@/app/lib/services/campaigns';
import { MyCampaignsTabs } from './my-campaigns-tabs';

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
      // Ordenar grupos por el mes más temprano de cada grupo (descendente)
      const dateA = new Date(a.investments[0].campaign.closingDate);
      const dateB = new Date(b.investments[0].campaign.closingDate);
      return dateB.getTime() - dateA.getTime();
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

  return <MyCampaignsTabs investmentsByMonth={investmentsByMonth} />;
}
