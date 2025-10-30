'use server';

import { db } from '@/app/lib/db';
import { campaigns, investments, users } from '@/app/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendBulkTemplateMessage, type BulkTemplateRecipient } from '@/app/lib/services/whatsapp';
import { createNamedBodyComponent, createUrlButtonComponent } from '@/app/lib/services/whatsapp-helpers';
import type { BulkSendResult, CampaignNotificationOptions } from './types';

/**
 * Envía notificación de actualización de campaña a todos los inversores con pago confirmado
 * 
 * Esta función obtiene todos los inversores que han pagado por una campaña específica
 * y les envía una notificación usando una plantilla de WhatsApp.
 * 
 * @param options - Opciones de envío de notificación
 * @returns Resultado del envío masivo con estadísticas
 * 
 * @example
 * ```typescript
 * const result = await sendCampaignUpdateNotification({
 *   campaignId: 123,
 *   templateName: 'nuevas_actualizaciones_campanias'
 * });
 * 
 * console.log(`Enviados: ${result.successful}/${result.total}`);
 * ```
 */
export async function sendCampaignUpdateNotification(
  options: CampaignNotificationOptions
): Promise<BulkSendResult> {
  const {
    campaignId,
    templateName = 'nuevas_actualizaciones_campanias',
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
    console.log("Preparando inversores para enviar notificación de la campaña: ", campaign.title);
    console.log("Campaña ID: ", campaignId);
    console.log("Test Mode: ", testMode);
    console.log("Test Email: ", testEmail);

    let paidInvestors: Array<{
      userId: number;
      userName: string | null;
      userEmail: string;
      userPhone: string;
      investmentId: number | null;
      plantCount: number | null;
    }> = [];

    // 2. En modo test, buscar solo al usuario sin requerir inversión
    if (testMode && testEmail) {
      console.log(`[WhatsApp Templates] 🧪 MODO TEST: Enviando solo a ${testEmail}`);
      
      const testUser = await db.query.users.findFirst({
        where: and(
          eq(users.email, testEmail),
          isNotNull(users.phone)
        ),
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      if (testUser) {
        paidInvestors = [{
          userId: testUser.id,
          userName: testUser.name,
          userEmail: testUser.email,
          userPhone: testUser.phone!,
          investmentId: null, // En modo test no se requiere inversión real
          plantCount: null,
        }];
      }
    } else {
      // 2. Obtener inversores con pago confirmado y teléfono (modo normal)
      const investorsQuery = await db
        .select({
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          investmentId: investments.id,
          plantCount: investments.plantCount,
        })
        .from(investments)
        .innerJoin(users, eq(investments.userId, users.id))
        .where(and(
          eq(investments.campaignId, campaignId),
          eq(investments.isPaid, true),
          isNotNull(users.phone)
        ));
      
      // Filtrar y asegurar que userPhone no sea null
      paidInvestors = investorsQuery
        .filter(inv => inv.userPhone !== null)
        .map(inv => ({
          ...inv,
          userPhone: inv.userPhone!,
          investmentId: inv.investmentId,
          plantCount: inv.plantCount,
        }));
    }

    if (paidInvestors.length === 0) {
      const message = testMode 
        ? `No se encontró usuario con email ${testEmail} y teléfono` 
        : `No hay inversores con pago confirmado y teléfono para campaña ${campaignId}`;
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
      `[WhatsApp Templates] ${modePrefix}Enviando notificaciones a ${paidInvestors.length} inversor(es) de campaña "${campaign.title}"`
    );

    // 3. Preparar destinatarios para envío masivo
    const recipients: BulkTemplateRecipient[] = paidInvestors.map((investor) => ({
      phone: investor.userPhone!,
      components: [
        createNamedBodyComponent({
          name: investor.userName || 'Inversor',
          planta: campaign.crop,
        }),
        // Botón con URL dinámica: https://invertir.agrobeat.com.py/dashboard/my-campaigns/{{1}}
        createUrlButtonComponent(campaignId.toString(), 0),
      ],
      metadata: {
        userId: investor.userId,
        userName: investor.userName || 'Inversor',
        investmentId: investor.investmentId,
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
      '[WhatsApp Templates] Error inesperado en sendCampaignUpdateNotification:',
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
 * Obtiene la cantidad de inversores con pago confirmado que serán notificados
 * 
 * Útil para mostrar una confirmación antes de enviar notificaciones
 * 
 * @param campaignId - ID de la campaña
 * @returns Cantidad de inversores que recibirán notificación
 * 
 * @example
 * ```typescript
 * const count = await getNotifiableInvestorsCount(123);
 * console.log(`Se notificará a ${count} inversores`);
 * ```
 */
export async function getNotifiableInvestorsCount(
  campaignId: number
): Promise<number> {
  try {
    const investors = await db
      .select({
        userId: users.id,
      })
      .from(investments)
      .innerJoin(users, eq(investments.userId, users.id))
      .where(
        and(
          eq(investments.campaignId, campaignId),
          eq(investments.isPaid, true),
          isNotNull(users.phone)
        )
      );

    return investors.length;
  } catch (error) {
    console.error(
      '[WhatsApp Templates] Error obteniendo cantidad de inversores notificables:',
      error
    );
    return 0;
  }
}

