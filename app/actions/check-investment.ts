'use server';

import { auth } from '@/app/auth';
import { db } from '@/app/lib/db';
import { users, investments } from '@/app/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ExistingInvestmentResult {
  hasInvestment: boolean;
  investment?: {
    amount: string;
    plantCount: number;
    investedAt: Date;
  };
}

export async function checkExistingInvestment(campaignId: number): Promise<ExistingInvestmentResult> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.email) {
      return { hasInvestment: false };
    }

    // Obtener el ID del usuario
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email!))
      .limit(1);
    
    if (userResult.length === 0) {
      return { hasInvestment: false };
    }
    
    const userId = userResult[0].id;

    // Buscar inversión existente
    const existingInvestment = await db
      .select({
        amount: investments.amount,
        plantCount: investments.plantCount,
        investedAt: investments.investedAt,
      })
      .from(investments)
      .where(and(
        eq(investments.userId, userId),
        eq(investments.campaignId, campaignId)
      ))
      .limit(1);

    if (existingInvestment.length > 0) {
      return {
        hasInvestment: true,
        investment: {
          amount: existingInvestment[0].amount,
          plantCount: existingInvestment[0].plantCount,
          investedAt: existingInvestment[0].investedAt!,
        }
      };
    }

    return { hasInvestment: false };
  } catch (error) {
    console.error('Error checking existing investment:', error);
    return { hasInvestment: false };
  }
}
