'use server';

import { auth } from '@/app/auth';
import { CampaignService } from '@/app/lib/services/campaigns';
import { db } from '@/app/lib/db';
import { users, investments } from '@/app/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { sendInvestmentConfirmationEmail, sendAdminInvestmentNotification } from '@/app/lib/services/email';
import { calculatePlantAvailability } from '@/lib/utils';

export interface InvestmentResult {
  success: boolean;
  message: string;
  campaignId?: number;
}

export async function createInvestment(
  campaignId: number,
  plantCount: number,
  investmentAmount: number
): Promise<InvestmentResult> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        message: 'Debes estar autenticado para realizar una inversión'
      };
    }

    // Obtener el ID del usuario desde la base de datos usando el email
    const userResult = await db.select({ 
      id: users.id, 
      name: users.name 
    }).from(users).where(eq(users.email, session.user.email!)).limit(1);
    
    if (userResult.length === 0) {
      return {
        success: false,
        message: 'Usuario no encontrado en la base de datos'
      };
    }
    
    const userId = userResult[0].id;
    const userName = userResult[0].name || session.user.name || 'Usuario';

    // Verificar si el usuario ya tiene una inversión en esta campaña
    const existingInvestment = await db
      .select({ id: investments.id })
      .from(investments)
      .where(and(
        eq(investments.userId, userId),
        eq(investments.campaignId, campaignId)
      ))
      .limit(1);

    if (existingInvestment.length > 0) {
      return {
        success: false,
        message: 'Ya tienes una reserva activa en esta campaña. Solo se permite una reserva por usuario por campaña.'
      };
    }

    // Obtener información de la campaña para validaciones
    const campaignResult = await CampaignService.getCampaignById(campaignId);
    if (!campaignResult) {
      return {
        success: false,
        message: 'Campaña no encontrada'
      };
    }

    // Verificar si la campaña está cerrada
    if (campaignResult.daysLeft <= 0) {
      return {
        success: false,
        message: 'Esta campaña ya está cerrada. No se pueden realizar más reservas.'
      };
    }

    // Verificar disponibilidad de plantas
    const availability = calculatePlantAvailability(campaignResult);
    
    if (availability.isFullyFunded) {
      return {
        success: false,
        message: 'Esta campaña ya está completamente financiada. No hay más plantas disponibles para reservar.'
      };
    }

    if (plantCount > availability.availablePlants) {
      return {
        success: false,
        message: `Solo hay ${availability.availablePlants} plantas disponibles. No puedes reservar ${plantCount} plantas.`
      };
    }

    // Validaciones básicas
    if (plantCount <= 0) {
      return {
        success: false,
        message: 'La cantidad de plantas debe ser mayor a cero'
      };
    }

    if (investmentAmount <= 0) {
      return {
        success: false,
        message: 'El monto de inversión debe ser mayor a cero'
      };
    }

    // Crear la inversión usando el servicio
    const updatedCampaign = await CampaignService.investInCampaign(
      campaignId,
      userId,
      investmentAmount,
      plantCount
    );

    // Enviar emails de confirmación y notificación admin
    const emailData = {
      userEmail: session.user.email,
      userName: userName,
      campaignTitle: updatedCampaign.title,
      plantCount: plantCount,
      investmentAmount: investmentAmount,
      campaignId: campaignId
    };

    try {
      // Enviar email de confirmación al usuario
      await sendInvestmentConfirmationEmail(emailData);
      console.log('Email de confirmación enviado exitosamente');
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
      // No fallar la inversión si el email falla
    }

    try {
      // Enviar notificación a administradores
      await sendAdminInvestmentNotification(emailData);
      console.log('Email de notificación admin enviado exitosamente');
    } catch (adminEmailError) {
      console.error('Error enviando email de notificación admin:', adminEmailError);
      // No fallar la inversión si el email admin falla
    }

    // Revalidar las páginas para mostrar datos actualizados
    revalidatePath('/dashboard');
    revalidatePath(`/campaigns/${campaignId}`);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return {
      success: true,
      message: `Reserva exitosa! Has reservado ${plantCount} plantas por un total de ${formatCurrency(investmentAmount)}. Te contactaremos pronto y recibirás un email de confirmación.`,
      campaignId: updatedCampaign.id
    };

  } catch (error) {
    console.error('Error creating investment:', error);
    
    return {
      success: false,
      message: 'Ocurrió un error al procesar tu inversión. Por favor, inténtalo nuevamente.'
    };
  }
}
