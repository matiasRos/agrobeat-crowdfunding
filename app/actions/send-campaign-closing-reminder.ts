'use server';

import { auth } from '@/app/auth';
import {
  sendCampaignClosingReminder,
  type BulkSendResult,
} from '@/app/lib/whatsapp-templates';

/**
 * Resultado de la acción de envío de recordatorios
 */
export interface SendReminderActionResult {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Mensaje descriptivo del resultado */
  message: string;
  /** Estadísticas de envío (si fue exitoso) */
  stats?: BulkSendResult;
}

/**
 * Server Action para enviar recordatorios de cierre de campaña
 * 
 * Esta acción verifica que el usuario sea administrador antes de permitir
 * el envío de recordatorios masivos por WhatsApp a usuarios que NO han invertido.
 * 
 * El template usado es 'campania_4_disponible' que incluye:
 * - Nombre del usuario
 * - Título de la campaña
 * - Días restantes para cerrar
 * 
 * @param campaignId - ID de la campaña
 * @param testMode - Si es true, solo envía al email del usuario autenticado
 * @returns Resultado de la operación con estadísticas
 * 
 * @example
 * ```typescript
 * const result = await sendCampaignClosingReminderAction(123);
 * if (result.success) {
 *   console.log(`Enviados: ${result.stats?.successful} recordatorios`);
 * }
 * ```
 */
export async function sendCampaignClosingReminderAction(
  campaignId: number,
  testMode: boolean = false
): Promise<SendReminderActionResult> {
  try {
    // Verificar autenticación
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: 'No estás autenticado. Por favor, inicia sesión.',
      };
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== 'admin') {
      console.warn(
        `[Send Campaign Reminder] Usuario ${session.user.email} intentó enviar recordatorios sin permisos`
      );
      return {
        success: false,
        message: 'No tienes permisos para enviar recordatorios. Solo administradores pueden realizar esta acción.',
      };
    }

    // Validar campaignId
    if (!campaignId || campaignId <= 0) {
      return {
        success: false,
        message: 'ID de campaña inválido.',
      };
    }

    const modeLabel = testMode ? ' [MODO TEST]' : '';
    console.log(
      `[Send Campaign Reminder] Admin ${session.user.email} enviando recordatorios${modeLabel} para campaña ${campaignId}`
    );

    // Enviar recordatorios (usa el template por defecto definido en la función)
    const stats = await sendCampaignClosingReminder({
      campaignId,
      testMode,
      testEmail: testMode ? session.user.email : undefined,
    });

    // Verificar si hubo errores críticos
    if (stats.total === 0) {
      return {
        success: false,
        message: stats.errors[0]?.error || 'No hay usuarios para notificar.',
        stats,
      };
    }

    // Construir mensaje de resultado
    let message = '';
    if (stats.successful === stats.total) {
      message = `¡Recordatorios enviados exitosamente! Se notificó a ${stats.successful} usuario${stats.successful !== 1 ? 's' : ''}.`;
    } else if (stats.successful > 0) {
      message = `Recordatorios parcialmente enviados: ${stats.successful} exitosos, ${stats.failed} fallidos de ${stats.total} totales.`;
    } else {
      message = `Error: No se pudo enviar ningún recordatorio. ${stats.failed} intentos fallidos.`;
    }

    console.log(
      `[Send Campaign Reminder] Resultado: ${stats.successful}/${stats.total} exitosos para campaña ${campaignId}`
    );

    return {
      success: stats.successful > 0,
      message,
      stats,
    };
  } catch (error) {
    console.error(
      '[Send Campaign Reminder] Error inesperado:',
      error
    );

    return {
      success: false,
      message: `Error inesperado al enviar recordatorios: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`,
    };
  }
}

