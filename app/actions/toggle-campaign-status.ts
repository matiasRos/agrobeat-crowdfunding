'use server';

import { revalidatePath } from 'next/cache';
import { CampaignService } from '@/app/lib/services/campaigns';
import { sendNewCampaignNotificationToAll } from '@/app/lib/services/email';
import { db } from '@/app/lib/db';
import { campaigns, users } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/app/auth';

interface ToggleCampaignStatusResult {
  success: boolean;
  isActive?: boolean;
  error?: string;
  emailsSent?: number;
}

export async function toggleCampaignStatus(
  campaignId: number
): Promise<ToggleCampaignStatusResult> {
  try {
    // Verificar autenticación
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No autenticado. Por favor, inicia sesión.',
      };
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== 'admin') {
      return {
        success: false,
        error: 'No tienes permisos para realizar esta acción.',
      };
    }

    // Obtener el estado actual de la campaña antes de cambiarla
    const [currentCampaign] = await db
      .select({ isActive: campaigns.isActive })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!currentCampaign) {
      return {
        success: false,
        error: 'Campaña no encontrada.',
      };
    }

    const wasInactive = !currentCampaign.isActive;

    // Alternar el estado de la campaña
    const newStatus = await CampaignService.toggleCampaignStatus(campaignId);

    // Si la campaña se está activando (de inactiva a activa), enviar emails
    if (wasInactive && newStatus) {
      // Obtener datos completos de la campaña
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId))
        .limit(1);

      if (campaign) {
        // Obtener todos los usuarios registrados
        const allUsers = await db
          .select({
            email: users.email,
            name: users.name,
          })
          .from(users);

        // Formatear la fecha de cierre
        const closingDate = new Date(campaign.closingDate);
        const formattedClosingDate = closingDate.toLocaleDateString('es-PY', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        // Enviar notificaciones a todos los usuarios
        const emailResult = await sendNewCampaignNotificationToAll(
          allUsers,
          {
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            campaignDescription: campaign.description,
            crop: campaign.crop,
            location: campaign.location,
            expectedReturn: campaign.expectedReturn,
            closingDate: formattedClosingDate,
          }
        );

        console.log(`Emails enviados para nueva campaña: ${emailResult.totalSent}/${emailResult.totalUsers}`);

        // Revalidar las rutas relacionadas
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard');

        return {
          success: true,
          isActive: newStatus,
          emailsSent: emailResult.totalSent,
        };
      }
    }

    // Revalidar las rutas relacionadas
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      isActive: newStatus,
    };
  } catch (error) {
    console.error('Error toggling campaign status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar el estado de la campaña',
    };
  }
}

