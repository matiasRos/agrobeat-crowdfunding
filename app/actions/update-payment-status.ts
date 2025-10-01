'use server';

import { auth } from '@/app/auth';
import { CampaignService } from '@/app/lib/services/campaigns';
import { db } from '@/app/lib/db';
import { users, investments, campaigns } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { sendPaymentConfirmationEmail } from '@/app/lib/services/email';
import { formatCurrency } from '@/lib/utils';

export interface UpdatePaymentStatusResult {
  success: boolean;
  message: string;
}

export async function updatePaymentStatus(
  investmentId: number,
  isPaid: boolean
): Promise<UpdatePaymentStatusResult> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        message: 'Debes estar autenticado para realizar esta acción'
      };
    }

    // Verificar que el usuario es administrador
    const userResult = await db.select({ 
      id: users.id, 
      role: users.role 
    }).from(users).where(eq(users.email, session.user.email!)).limit(1);
    
    if (userResult.length === 0) {
      return {
        success: false,
        message: 'Usuario no encontrado en la base de datos'
      };
    }
    
    if (userResult[0].role !== 'admin') {
      return {
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      };
    }

    // Si se está marcando como pagado, obtener datos de la inversión para enviar email
    let investmentData = null;
    if (isPaid) {
      const investmentResult = await db
        .select({
          investment: investments,
          user: users,
          campaign: campaigns,
        })
        .from(investments)
        .leftJoin(users, eq(investments.userId, users.id))
        .leftJoin(campaigns, eq(investments.campaignId, campaigns.id))
        .where(eq(investments.id, investmentId))
        .limit(1);

      if (investmentResult.length > 0 && investmentResult[0].user && investmentResult[0].campaign) {
        investmentData = {
          userEmail: investmentResult[0].user.email,
          userName: investmentResult[0].user.name || 'Usuario',
          campaignTitle: investmentResult[0].campaign.title,
          plantCount: investmentResult[0].investment.plantCount,
          investmentAmount: formatCurrency(parseFloat(investmentResult[0].investment.amount))
        };
      }
    }

    // Actualizar el estado de pago
    const updateResult = await CampaignService.updateInvestmentPaymentStatus(
      investmentId,
      isPaid
    );

    if (!updateResult) {
      return {
        success: false,
        message: 'No se pudo actualizar el estado de pago de la inversión'
      };
    }

    // Si se marcó como pagado y tenemos los datos, enviar email de confirmación
    if (isPaid && investmentData) {
      try {
        await sendPaymentConfirmationEmail(investmentData);
        console.log('Email de confirmación de pago enviado exitosamente');
      } catch (emailError) {
        console.error('Error enviando email de confirmación de pago:', emailError);
        // No fallar la operación si el email falla
      }
    }

    // Revalidar la página de administración para mostrar datos actualizados
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      message: `Estado de pago actualizado a ${isPaid ? 'pagado' : 'pendiente'} exitosamente${isPaid && investmentData ? '. Se ha enviado un email de confirmación al usuario.' : ''}`
    };

  } catch (error) {
    console.error('Error updating payment status:', error);
    
    return {
      success: false,
      message: 'Ocurrió un error al actualizar el estado de pago. Por favor, inténtalo nuevamente.'
    };
  }
}
