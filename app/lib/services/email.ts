'use server';

import { Resend } from 'resend';
import {
  createInvestmentConfirmationTemplate,
  createAdminNotificationTemplate,
  createReservationConfirmationTemplate,
  createWelcomeEmailTemplate,
  createPaymentConfirmationTemplate,
} from '@/app/lib/email-templates';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export interface InvestmentEmailData {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  plantCount: number;
  investmentAmount: number;
  campaignId: number;
}

// Función helper para formatear moneda paraguaya
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
      }).format(amount);
    };

export async function sendInvestmentConfirmationEmail(data: InvestmentEmailData) {
  try {
    const { userEmail, userName, campaignTitle, plantCount, investmentAmount } = data;

    const formattedAmount = formatCurrency(investmentAmount);
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;

    // Crear template usando la nueva función
    const template = createInvestmentConfirmationTemplate({
      userName,
      campaignTitle,
      plantCount,
      formattedAmount,
      dashboardUrl,
    });

    // Configurar el remitente usando tu dominio verificado
    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';

    // Enviar email
    const result = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('Email enviado exitosamente:', result);
    return { success: true, messageId: result.data?.id };

  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para notificar a administradores sobre nueva inversión
export async function sendAdminInvestmentNotification(data: InvestmentEmailData) {
  try {
    const { userEmail, userName, campaignTitle, plantCount, investmentAmount } = data;

    const formattedAmount = formatCurrency(investmentAmount);

    // Crear template usando la nueva función
    const template = createAdminNotificationTemplate({
      userName,
      userEmail,
      campaignTitle,
      plantCount,
      formattedAmount,
    });

    // Email de administradores (puedes configurar múltiples emails)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@tudominio.com'];
    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';

    // Enviar email a administradores
    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('Email de notificación admin enviado exitosamente:', result);
    return { success: true, messageId: result.data?.id };

  } catch (error) {
    console.error('Error enviando email de notificación admin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para enviar email de reserva confirmada
export async function sendReservationConfirmationEmail(data: {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  plantCount: number;
  investmentAmount: string;
}) {
  try {
    const { userEmail, userName, campaignTitle, plantCount, investmentAmount } = data;

    const formattedAmount = investmentAmount;
    const whatsappNumber = '+595971781947';
    const whatsappLink = `https://wa.me/595971781947`;

    // Crear template usando la nueva función
    const template = createReservationConfirmationTemplate({
      userName,
      campaignTitle,
      plantCount,
      formattedAmount,
      whatsappLink,
      whatsappNumber,
    });

    // Configurar el remitente usando tu dominio verificado
    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';

    // Enviar email
    const result = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('Email de reserva confirmada enviado exitosamente:', result);
    return { success: true, messageId: result.data?.id };

  } catch (error) {
    console.error('Error enviando email de reserva confirmada:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para enviar email de confirmación de pago
export async function sendPaymentConfirmationEmail(data: {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  plantCount: number;
  investmentAmount: string;
}) {
  try {
    const { userEmail, userName, campaignTitle, plantCount, investmentAmount } = data;

    const formattedAmount = investmentAmount;
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;

    // Crear template usando la nueva función
    const template = createPaymentConfirmationTemplate({
      userName,
      campaignTitle,
      plantCount,
      formattedAmount,
      dashboardUrl,
    });

    // Configurar el remitente usando tu dominio verificado
    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';

    // Enviar email
    const result = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('Email de confirmación de pago enviado exitosamente:', result);
    return { success: true, messageId: result.data?.id };

  } catch (error) {
    console.error('Error enviando email de confirmación de pago:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para enviar emails de bienvenida (opcional)
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
    
    // Crear template usando la nueva función
    const template = createWelcomeEmailTemplate({
      userName,
      dashboardUrl,
    });

    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}