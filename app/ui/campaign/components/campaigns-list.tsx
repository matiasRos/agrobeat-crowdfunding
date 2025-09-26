import { CampaignService } from '@/app/lib/services/campaigns';
import { CampaignCard } from './campaign-card';
import { CampaignResponse } from '@/app/types/campaign';
import { auth } from '@/app/auth';

// Función para agrupar campañas por mes
function groupCampaignsByMonth(campaigns: CampaignResponse[]) {
  const groups = new Map<string, CampaignResponse[]>();
  
  campaigns.forEach((campaign) => {
    const date = new Date(campaign.closingDate);
    const monthKey = date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(campaign);
  });
  
  // Convertir a array y ordenar por fecha
  return Array.from(groups.entries())
    .map(([monthKey, campaigns]) => ({
      month: monthKey,
      campaigns: campaigns.sort((a, b) => 
        new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime()
      )
    }))
    .sort((a, b) => {
      // Ordenar grupos por el mes más temprano de cada grupo
      const dateA = new Date(a.campaigns[0].closingDate);
      const dateB = new Date(b.campaigns[0].closingDate);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Server Component que obtiene las campañas desde la base de datos
 */
export async function CampaignsList() {
  // Obtener sesión del usuario
  const session = await auth();
  
  // Llamada directa al servicio desde el servidor, marcando campañas del usuario si está logueado
  const campaigns = await CampaignService.getAllCampaigns(
    session?.user?.id ? Number(session.user.id) : undefined
  );

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No hay campañas disponibles
        </h3>
        <p className="text-sm text-muted-foreground">
          Las campañas aparecerán aquí cuando estén activas.
        </p>
      </div>
    );
  }

  // Agrupar campañas por mes
  const campaignsByMonth = groupCampaignsByMonth(campaigns);

  return (
    <div className="space-y-8">
      {campaignsByMonth.map(({ month, campaigns: monthCampaigns }) => (
        <div key={month} className="space-y-4">
          {/* Subtítulo del mes */}
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-semibold text-foreground capitalize">
              {month}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {monthCampaigns.length} {monthCampaigns.length === 1 ? 'campaña' : 'campañas'} disponible{monthCampaigns.length === 1 ? '' : 's'}
            </p>
          </div>
          
          {/* Grid de campañas del mes */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {monthCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
