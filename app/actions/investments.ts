'use server';

import { auth } from '@/app/auth';
import { CampaignService } from '@/app/lib/services/campaigns';
import { db } from '@/app/lib/db';
import { users, investments } from '@/app/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
    const userResult = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email!)).limit(1);
    
    if (userResult.length === 0) {
      return {
        success: false,
        message: 'Usuario no encontrado en la base de datos'
      };
    }
    
    const userId = userResult[0].id;

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
      message: `Reserva exitosa! Has reservado ${plantCount} plantas por un total de ${formatCurrency(investmentAmount)}. Te contactaremos pronto.`,
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
