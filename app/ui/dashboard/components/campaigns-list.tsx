import { CampaignService } from '@/app/lib/services/campaigns';
import { CampaignCard } from './campaign-card';

/**
 * Server Component que obtiene las campañas desde la base de datos
 */
export async function CampaignsList() {
  // Llamada directa al servicio desde el servidor
  const campaigns = await CampaignService.getAllCampaigns();

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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
