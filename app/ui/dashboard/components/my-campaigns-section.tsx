import { Suspense } from 'react';
import { MyCampaignsList } from './my-campaigns-list';

/**
 * Sección de campañas activas del usuario
 * Solo se muestra si el usuario tiene inversiones
 */
export function MyCampaignsSection() {
  return (
    <section className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Mis Campañas Activas</h2>
        <p className="text-muted-foreground">
          Gestiona y monitorea tus inversiones en producción agrícola
        </p>
      </div>

      <MyCampaignsList />
    </section>
  );
}
