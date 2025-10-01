'use server';

import { sendReservationConfirmationEmail } from '@/app/lib/services/email';

export async function sendReservationEmail(
  investorId: number,
  userEmail: string,
  userName: string,
  campaignTitle: string,
  plantCount: number,
  investmentAmount:string
) {
  try {
    const result = await sendReservationConfirmationEmail({
      userEmail,
      userName: userName || 'Inversor',
      campaignTitle,
      plantCount,
      investmentAmount,
    });

    if (result.success) {
      return { success: true, message: 'Email enviado exitosamente' };
    } else {
      return { success: false, error: result.error || 'Error al enviar el email' };
    }
  } catch (error) {
    console.error('Error en server action:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}
