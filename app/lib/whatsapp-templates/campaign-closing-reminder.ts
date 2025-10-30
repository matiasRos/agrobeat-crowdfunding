'use server';

import { db } from '@/app/lib/db';
import { campaigns, investments, users } from '@/app/lib/db/schema';
import { eq, and, isNotNull, notExists } from 'drizzle-orm';
import { sendBulkTemplateMessage, type BulkTemplateRecipient } from '@/app/lib/services/whatsapp';
import { createNamedBodyComponent } from '@/app/lib/services/whatsapp-helpers';
import type { BulkSendResult, CampaignNotificationOptions } from './types';

/**
 * Envía recordatorio de cierre de campaña a usuarios que NO han invertido
 * 
 * Esta función obtiene todos los usuarios con teléfono que NO han invertido
 * en una campaña específica y les envía un recordatorio de que está por cerrarse.
 * 
 * @param options - Opciones de envío de notificación
 * @returns Resultado del envío masivo con estadísticas
 * 
 * @example
 * ```typescript
 * const result = await sendCampaignClosingReminder({
 *   campaignId: 123,
 *   templateName: 'campania_4_disponible'
 * });
 * 
 * console.log(`Enviados: ${result.successful}/${result.total}`);
 * ```
 */
export async function sendCampaignClosingReminder(
  options: CampaignNotificationOptions
): Promise<BulkSendResult> {
  const {
    campaignId,
    templateName = 'campania_4_disponible',
    languageCode = 'es',
    testMode = false,
    testEmail,
  } = options;

  try {
    // 1. Obtener datos de la campaña con días restantes
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
      columns: {
        id: true,
        title: true,
        closingDate: true,
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

    // 2. Calcular días restantes (usando misma lógica que en campaigns.ts)
    const closingDate = new Date(campaign.closingDate);
    closingDate.setHours(23, 59, 59, 999);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = closingDate.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 3. Validar que la campaña aún esté abierta
    if (daysLeft <= 0) {
      console.warn(`[WhatsApp Templates] Campaña ${campaignId} ya está cerrada`);
      return {
        successful: 0,
        failed: 0,
        total: 0,
        errors: [{
          phone: '',
          userName: '',
          error: 'La campaña ya está cerrada',
        }],
      };
    }

    // 4. Obtener usuarios que NO han invertido en esta campaña y tienen teléfono
    const whereConditions = [
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
      ),
    ];

    // Si está en modo test, filtrar solo por el email especificado
    if (testMode && testEmail) {
      whereConditions.push(eq(users.email, testEmail));
      console.log(`[WhatsApp Templates] 🧪 MODO TEST: Enviando solo a ${testEmail}`);
    }

    const nonInvestors = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(users)
      .where(and(...whereConditions));

    if (nonInvestors.length === 0) {
      console.warn(
        `[WhatsApp Templates] No hay usuarios sin inversión con teléfono para campaña ${campaignId}`
      );
      return {
        successful: 0,
        failed: 0,
        total: 0,
        errors: [],
      };
    }

    const modePrefix = testMode ? '🧪 [MODO TEST] ' : '';
    console.log(
      `[WhatsApp Templates] ${modePrefix}Enviando recordatorios a ${nonInvestors.length} usuario(s) sin inversión para campaña "${campaign.title}"`
    );
    console.log(
      `[WhatsApp Templates] Días restantes: ${daysLeft}`
    );

    // 5. Preparar destinatarios para envío masivo
    const recipients: BulkTemplateRecipient[] = nonInvestors.map((user) => ({
      phone: user.userPhone!,
      components: [
        createNamedBodyComponent({
          nombre: user.userName || 'Inversor',
          nro_campania: campaign.title,
          dias_restantes: daysLeft.toString(),
        }),
      ],
      metadata: {
        userId: user.userId,
        userName: user.userName || 'Inversor',
        campaignId: campaignId,
        daysLeft: daysLeft,
      },
    }));

    // 6. Enviar recordatorios usando la función de envío masivo con rate limiting
    const bulkResult = await sendBulkTemplateMessage(
      templateName,
      recipients,
      languageCode
    );

    // 7. Procesar errores para formato esperado
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
      '[WhatsApp Templates] Error inesperado en sendCampaignClosingReminder:',
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
 * Obtiene la cantidad de usuarios sin inversión que serán notificados
 * 
 * Útil para mostrar una confirmación antes de enviar recordatorios
 * 
 * @param campaignId - ID de la campaña
 * @returns Cantidad de usuarios sin inversión que recibirán recordatorio
 * 
 * @example
 * ```typescript
 * const count = await getNonInvestorsCount(123);
 * console.log(`Se notificará a ${count} usuarios sin inversión`);
 * ```
 */
export async function getNonInvestorsCount(
  campaignId: number
): Promise<number> {
  try {
    const nonInvestors = await db
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

    return nonInvestors.length;
  } catch (error) {
    console.error(
      '[WhatsApp Templates] Error obteniendo cantidad de usuarios sin inversión:',
      error
    );
    return 0;
  }
}

