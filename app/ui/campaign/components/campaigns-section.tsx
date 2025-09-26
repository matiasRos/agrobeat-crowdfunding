import { Suspense } from 'react';
import { CampaignsList } from './campaigns-list';
import { CampaignsLoading } from './campaigns-loading';

/**
 * Sección principal de campañas con Suspense
 */
export function CampaignsSection() {
  return (
    <section className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Campañas Disponibles</h2>
        <p className="text-muted-foreground">
          Explora las oportunidades de inversión en producción agrícola sostenible
        </p>
      </div>
      
      <Suspense fallback={<CampaignsLoading />}>
        <CampaignsList />
      </Suspense>
    </section>
  );
}
