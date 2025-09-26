import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { getUserInvestments } from '@/app/lib/services/campaigns';
import { MyCampaignsList } from './my-campaigns-list';

/**
 * Sección de campañas activas del usuario
 * Solo se muestra si el usuario tiene inversiones
 */
export async function MyCampaignsSection() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const userInvestments = await getUserInvestments(Number(session.user.id));

  // Si no hay inversiones, no renderizar la sección completa
  if (!userInvestments || userInvestments.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Mis producciones</h2>
        <p className="text-muted-foreground">
          Gestiona y monitorea tus producciones 
        </p>
      </div>

      <MyCampaignsList />
    </section>
  );
}
