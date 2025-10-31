'use server';

import { auth } from '@/app/auth';
import {
  sendNewCampaignAvailableNotification,
  type BulkSendResult,
} from '@/app/lib/whatsapp-templates';

/**
 * Resultado de la acción de envío de notificaciones de nueva campaña
 */
export interface SendNewCampaignActionResult {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Mensaje descriptivo del resultado */
  message: string;
  /** Estadísticas de envío (si fue exitoso) */
  stats?: BulkSendResult;
}

/**
 * Server Action para enviar notificaciones de nueva campaña disponible
 * 
 * Esta acción verifica que el usuario sea administrador antes de permitir
 * el envío de notificaciones masivas por WhatsApp a usuarios que NO han invertido.
 * 
 * El template usado es 'nueva_campania_disponible' que incluye:
 * - Nombre del usuario
 * - Título de la campaña
 * - Tipo de cultivo/planta
 * 
 * @param campaignId - ID de la campaña
 * @param testMode - Si es true, solo envía al email del usuario autenticado
 * @returns Resultado de la operación con estadísticas
 * 
 * @example
 * ```typescript
 * const result = await sendNewCampaignNotificationAction(123);
 * if (result.success) {
 *   console.log(`Enviados: ${result.stats?.successful} notificaciones`);
 * }
 * ```
 */
export async function sendNewCampaignNotificationAction(
  campaignId: number,
  testMode: boolean = false
): Promise<SendNewCampaignActionResult> {
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
        `[Send New Campaign Notification] Usuario ${session.user.email} intentó enviar notificaciones sin permisos`
      );
      return {
        success: false,
        message: 'No tienes permisos para enviar notificaciones. Solo administradores pueden realizar esta acción.',
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
      `[Send New Campaign Notification] Admin ${session.user.email} enviando notificaciones de nueva campaña${modeLabel} para campaña ${campaignId}`
    );

    // Enviar notificaciones (usa el template por defecto definido en la función)
    const stats = await sendNewCampaignAvailableNotification({
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
      message = `¡Notificaciones enviadas exitosamente! Se notificó a ${stats.successful} usuario${stats.successful !== 1 ? 's' : ''} sobre la nueva campaña.`;
    } else if (stats.successful > 0) {
      message = `Notificaciones parcialmente enviadas: ${stats.successful} exitosos, ${stats.failed} fallidos de ${stats.total} totales.`;
    } else {
      message = `Error: No se pudo enviar ninguna notificación. ${stats.failed} intentos fallidos.`;
    }

    console.log(
      `[Send New Campaign Notification] Resultado: ${stats.successful}/${stats.total} exitosos para campaña ${campaignId}`
    );

    return {
      success: stats.successful > 0,
      message,
      stats,
    };
  } catch (error) {
    console.error(
      '[Send New Campaign Notification] Error inesperado:',
      error
    );

    return {
      success: false,
      message: `Error inesperado al enviar notificaciones: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`,
    };
  }
}

