'use server';

import { db } from '@/app/lib/db';
import { campaigns, investments, users } from '@/app/lib/db/schema';
import { eq, and, isNotNull, notExists } from 'drizzle-orm';
import { sendBulkTemplateMessage, type BulkTemplateRecipient } from '@/app/lib/services/whatsapp';
import { createNamedBodyComponent } from '@/app/lib/services/whatsapp-helpers';
import type { BulkSendResult, CampaignNotificationOptions } from './types';

/**
 * Envía notificación de nueva campaña disponible a usuarios que NO han invertido
 * 
 * Esta función obtiene todos los usuarios con teléfono que NO han invertido
 * en una campaña específica y les envía una notificación de que está disponible.
 * 
 * @param options - Opciones de envío de notificación
 * @returns Resultado del envío masivo con estadísticas
 * 
 * @example
 * ```typescript
 * const result = await sendNewCampaignAvailableNotification({
 *   campaignId: 123,
 *   templateName: 'nueva_campania_disponible'
 * });
 * 
 * console.log(`Enviados: ${result.successful}/${result.total}`);
 * ```
 */
export async function sendNewCampaignAvailableNotification(
  options: CampaignNotificationOptions
): Promise<BulkSendResult> {
  const {
    campaignId,
    templateName = 'nueva_campania_disponible',
    languageCode = 'es',
    testMode = false,
    testEmail,
  } = options;

  try {
    // 1. Obtener datos de la campaña
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
      columns: {
        id: true,
        title: true,
        crop: true,
      },
    });

    if (!campaign) {
      console.error(`[WhatsApp Templates] Campaña ${campaignId} no encontrada`);
      return {
        successful: 0,
        failed: 0,
        total: 0,
        errors: [{
          phone: '',
          userName: '',
          error: 'Campaña no encontrada',
        }],
      };
    }

    console.log("Preparando notificación de nueva campaña disponible: ", campaign.title);
    console.log("Campaña ID: ", campaignId);
    console.log("Test Mode: ", testMode);
    console.log("Test Email: ", testEmail);

    // 2. Obtener usuarios que NO han invertido en esta campaña y tienen teléfono
    const whereConditions = [
      isNotNull(users.phone),
      // Excluir usuarios que ya invirtieron en esta campaña (con o sin pago)
      notExists(
        db.select()
          .from(investments)
          .where(
            and(
              eq(investments.userId, users.id),
              eq(investments.campaignId, campaignId)
            )
          )
      ),
    ];

    // Si está en modo test, filtrar solo por el email especificado
    if (testMode && testEmail) {
      whereConditions.push(eq(users.email, testEmail));
      console.log(`[WhatsApp Templates] 🧪 MODO TEST: Enviando solo a ${testEmail}`);
    }

    const potentialInvestors = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(users)
      .where(and(...whereConditions));

    if (potentialInvestors.length === 0) {
      const message = testMode 
        ? `No se encontró usuario con email ${testEmail} y teléfono` 
        : `No hay usuarios sin inversión con teléfono para campaña ${campaignId}`;
      console.warn(`[WhatsApp Templates] ${message}`);
      return {
        successful: 0,
        failed: 0,
        total: 0,
        errors: [],
      };
    }

    const modePrefix = testMode ? '🧪 [MODO TEST] ' : '';
    console.log(
      `[WhatsApp Templates] ${modePrefix}Enviando notificaciones de nueva campaña a ${potentialInvestors.length} usuario(s) sin inversión en "${campaign.title}"`
    );

    // 3. Preparar destinatarios para envío masivo
    const recipients: BulkTemplateRecipient[] = potentialInvestors.map((user) => ({
      phone: user.userPhone!,
      components: [
        createNamedBodyComponent({
          name: user.userName || 'Inversor',
          campania: campaign.title,
          planta: campaign.crop,
        }),
      ],
      metadata: {
        userId: user.userId,
        userName: user.userName || 'Inversor',
        campaignId: campaignId,
      },
    }));

    // 4. Enviar notificaciones usando la función de envío masivo con rate limiting
    const bulkResult = await sendBulkTemplateMessage(
      templateName,
      recipients,
      languageCode
    );

    // 5. Procesar errores para formato esperado
    const errors = bulkResult.results
      .filter(r => !r.success)
      .map(r => ({
        phone: r.metadata?.userName ? `Usuario: ${r.metadata.userName}` : 'Desconocido',
        userName: r.metadata?.userName || 'Desconocido',
        error: r.error || 'Error desconocido',
      }));

    return {
      successful: bulkResult.successful,
      failed: bulkResult.failed,
      total: bulkResult.total,
      errors,
    };
  } catch (error) {
    console.error(
      '[WhatsApp Templates] Error inesperado en sendNewCampaignAvailableNotification:',
      error
    );
    
    return {
      successful: 0,
      failed: 0,
      total: 0,
      errors: [{
        phone: '',
        userName: '',
        error: error instanceof Error ? error.message : 'Error inesperado',
      }],
    };
  }
}

/**
 * Obtiene la cantidad de usuarios sin inversión que serán notificados sobre la nueva campaña
 * 
 * Útil para mostrar una confirmación antes de enviar notificaciones
 * 
 * @param campaignId - ID de la campaña
 * @returns Cantidad de usuarios sin inversión que recibirán notificación
 * 
 * @example
 * ```typescript
 * const count = await getPotentialInvestorsCount(123);
 * console.log(`Se notificará a ${count} usuarios sobre la nueva campaña`);
 * ```
 */
export async function getPotentialInvestorsCount(
  campaignId: number
): Promise<number> {
  try {
    const potentialInvestors = await db
      .select({
        userId: users.id,
      })
      .from(users)
      .where(
        and(
          isNotNull(users.phone),
          // Excluir usuarios que ya invirtieron en esta campaña
          notExists(
            db.select()
              .from(investments)
              .where(
                and(
                  eq(investments.userId, users.id),
                  eq(investments.campaignId, campaignId)
                )
              )
          )
        )
      );

    return potentialInvestors.length;
  } catch (error) {
    console.error(
      '[WhatsApp Templates] Error obteniendo cantidad de potenciales inversores:',
      error
    );
    return 0;
  }
}

