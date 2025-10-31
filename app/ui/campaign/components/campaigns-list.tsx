import { CampaignService } from '@/app/lib/services/campaigns';
import { CampaignResponse } from '@/app/types/campaign';
import { auth } from '@/app/auth';
import { CampaignsTabs } from './campaigns-tabs';

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
      // Ordenar grupos por el mes más temprano de cada grupo (descendente)
      const dateA = new Date(a.campaigns[0].closingDate);
      const dateB = new Date(b.campaigns[0].closingDate);
      return dateB.getTime() - dateA.getTime();
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

  return <CampaignsTabs campaignsByMonth={campaignsByMonth} />;
}
