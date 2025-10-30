'use server';

import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils';

/**
 * Servicio de WhatsApp Business API
 * 
 * Este servicio proporciona funcionalidades para enviar mensajes a través de
 * WhatsApp Business API usando la Graph API de Meta.
 * 
 * @module whatsapp
 */

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

/**
 * Configuración del servicio de WhatsApp
 */
interface WhatsAppConfig {
  apiUrl: string;
  accessToken: string;
  phoneNumberId: string;
}

/**
 * Opciones para enviar un mensaje de texto
 */
export interface SendTextMessageOptions {
  /** Número de teléfono del destinatario (formato internacional) */
  to: string;
  /** Contenido del mensaje */
  message: string;
  /** Habilitar preview de URLs en el mensaje (default: true) */
  previewUrl?: boolean;
}

/**
 * Parámetro de una plantilla de WhatsApp
 */
export interface TemplateParameter {
  /** Tipo de parámetro (normalmente 'text') */
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  /** Valor del parámetro (para tipo 'text') */
  text?: string;
  /** Nombre del parámetro (opcional, para templates con variables nombradas) */
  parameter_name?: string;
  /** Datos de moneda (para tipo 'currency') */
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  /** Datos de fecha/hora (para tipo 'date_time') */
  date_time?: {
    fallback_value: string;
  };
  /** Datos de imagen (para tipo 'image') */
  image?: {
    link: string;
  };
  /** Datos de documento (para tipo 'document') */
  document?: {
    link: string;
    filename?: string;
  };
  /** Datos de video (para tipo 'video') */
  video?: {
    link: string;
  };
}

/**
 * Componente de una plantilla de WhatsApp
 */
export interface TemplateComponent {
  /** Tipo de componente */
  type: 'header' | 'body' | 'button';
  /** Parámetros del componente */
  parameters: TemplateParameter[];
  /** Sub-tipo (para buttons: 'url' o 'quick_reply') */
  sub_type?: string;
  /** Índice del botón (si es un botón) */
  index?: number;
}

/**
 * Opciones para enviar un mensaje usando plantilla
 */
export interface SendTemplateMessageOptions {
  /** Número de teléfono del destinatario (formato internacional) */
  to: string;
  /** Nombre de la plantilla en WhatsApp Business */
  templateName: string;
  /** Código de idioma de la plantilla (ej: 'es', 'es_AR', 'en_US') */
  languageCode: string;
  /** Componentes con variables de la plantilla */
  components?: TemplateComponent[];
}

/**
 * Respuesta exitosa de la API de WhatsApp
 */
interface WhatsAppSuccessResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Error de la API de WhatsApp
 */
interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_data?: {
      messaging_product: string;
      details: string;
    };
    fbtrace_id: string;
  };
}

/**
 * Resultado del envío de mensaje
 */
export interface SendMessageResult {
  /** Indica si el mensaje se envió exitosamente */
  success: boolean;
  /** ID del mensaje de WhatsApp (si fue exitoso) */
  messageId?: string;
  /** ID de WhatsApp del destinatario (si fue exitoso) */
  recipientWaId?: string;
  /** Mensaje de error (si falló) */
  error?: string;
  /** Código de error (si falló) */
  errorCode?: number;
}

// ============================================================================
// CONFIGURACIÓN Y VALIDACIÓN
// ============================================================================

/**
 * Obtiene y valida la configuración del servicio de WhatsApp
 * @throws {Error} Si la configuración está incompleta
 */
function getWhatsAppConfig(): WhatsAppConfig {
  const apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v22.0';
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'Configuración de WhatsApp incompleta. ' +
      'Se requieren las variables de entorno: WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID'
    );
  }

  return {
    apiUrl,
    accessToken,
    phoneNumberId,
  };
}

/**
 * Verifica si el servicio de WhatsApp está configurado correctamente
 */
export async function isWhatsAppConfigured(): Promise<boolean> {
  try {
    getWhatsAppConfig();
    return true;
  } catch {
    return false;
  }
}


// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Envía un mensaje de texto por WhatsApp
 * 
 * Esta es la función principal del servicio. Permite enviar mensajes de texto
 * a cualquier número de WhatsApp.
 * 
 * @param options - Opciones para enviar el mensaje
 * @returns Resultado del envío del mensaje
 * 
 * @example
 * ```typescript
 * const result = await sendTextMessage({
 *   to: '+595981123456',
 *   message: 'Hola, este es un mensaje de prueba',
 *   previewUrl: true
 * });
 * 
 * if (result.success) {
 *   console.log('Mensaje enviado:', result.messageId);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function sendTextMessage(
  options: SendTextMessageOptions
): Promise<SendMessageResult> {
  try {
    // Validar configuración
    const config = getWhatsAppConfig();

    // Validar y formatear número de teléfono
    const phoneNumber = formatPhoneNumber(options.to);
    
    if (!isValidPhoneNumber(phoneNumber)) {
      return {
        success: false,
        error: `Número de teléfono inválido: ${options.to}`,
        errorCode: 400,
      };
    }

    // Validar que el mensaje no esté vacío
    if (!options.message || options.message.trim().length === 0) {
      return {
        success: false,
        error: 'El mensaje no puede estar vacío',
        errorCode: 400,
      };
    }

    // Construir URL del endpoint
    const url = `${config.apiUrl}/${config.phoneNumberId}/messages`;

    // Preparar el payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'text',
      text: {
        preview_url: options.previewUrl ?? true,
        body: options.message,
      },
    };

    // Realizar petición a la API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Manejar respuesta
    if (!response.ok) {
      const errorData = data as WhatsAppErrorResponse;
      
      console.error('[WhatsApp Service] Error de API:', {
        status: response.status,
        error: errorData.error,
        to: phoneNumber,
      });

      return {
        success: false,
        error: errorData.error?.message || 'Error al enviar mensaje de WhatsApp',
        errorCode: errorData.error?.code || response.status,
      };
    }

    const successData = data as WhatsAppSuccessResponse;

    console.log('[WhatsApp Service] Mensaje enviado exitosamente:', {
      messageId: successData.messages[0]?.id,
      to: phoneNumber,
      recipientWaId: successData.contacts[0]?.wa_id,
    });

    return {
      success: true,
      messageId: successData.messages[0]?.id,
      recipientWaId: successData.contacts[0]?.wa_id,
    };

  } catch (error) {
    console.error('[WhatsApp Service] Error inesperado:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar mensaje',
      errorCode: 500,
    };
  }
}

// ============================================================================
// UTILIDADES DE RATE LIMITING
// ============================================================================

/**
 * Divide un array en batches del tamaño especificado
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Espera un número específico de milisegundos
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Envía el mismo mensaje a múltiples destinatarios con rate limiting
 * 
 * Implementa rate limiting inteligente:
 * - Envía en batches de 50 mensajes (límite de WhatsApp)
 * - Delay de 1 segundo entre batches
 * - Respeta el límite de 50 mensajes/segundo de WhatsApp
 * 
 * @param phoneNumbers - Array de números de teléfono
 * @param message - Mensaje a enviar
 * @param previewUrl - Habilitar preview de URLs
 * @returns Resultado del envío masivo
 * 
 * @example
 * ```typescript
 * const result = await sendBulkTextMessage(
 *   ['+595981123456', '+595982234567'],
 *   'Mensaje importante para todos'
 * );
 * 
 * console.log(`Enviados: ${result.successful}, Fallidos: ${result.failed}`);
 * ```
 */
export async function sendBulkTextMessage(
  phoneNumbers: string[],
  message: string,
  previewUrl: boolean = true
): Promise<{
  successful: number;
  failed: number;
  total: number;
  results: SendMessageResult[];
}> {
  const BATCH_SIZE = 50; // WhatsApp limit: 50 messages per second
  const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay

  const batches = chunkArray(phoneNumbers, BATCH_SIZE);
  const allResults: SendMessageResult[] = [];

  console.log(
    `[WhatsApp Service] Iniciando envío masivo de ${phoneNumbers.length} mensajes en ${batches.length} batch(es)`
  );

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `[WhatsApp Service] Procesando batch ${i + 1}/${batches.length} (${batch.length} mensajes)`
    );

    const batchResults = await Promise.allSettled(
      batch.map(phone =>
        sendTextMessage({
          to: phone,
          message,
          previewUrl,
        })
      )
    );

    const processedBatchResults = batchResults.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Error desconocido',
        };
      }
    });

    allResults.push(...processedBatchResults);

    // Delay entre batches (excepto en el último)
    if (i < batches.length - 1) {
      console.log(`[WhatsApp Service] Esperando ${DELAY_BETWEEN_BATCHES}ms antes del siguiente batch...`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.length - successful;

  console.log(
    `[WhatsApp Service] Envío masivo completado: ${successful}/${phoneNumbers.length} exitosos, ${failed} fallidos`
  );

  return {
    successful,
    failed,
    total: phoneNumbers.length,
    results: allResults,
  };
}

/**
 * Envía un mensaje usando una plantilla de WhatsApp Business
 * 
 * Las plantillas son mensajes pre-aprobados por Meta que pueden contener variables.
 * Debes crear y aprobar las plantillas en el Manager de WhatsApp Business antes de usarlas.
 * 
 * @param options - Opciones para enviar el mensaje con plantilla
 * @returns Resultado del envío del mensaje
 * 
 * @example
 * ```typescript
 * // Plantilla: "Hola {{1}}, tu inversión de {{2}} plantas fue confirmada"
 * const result = await sendTemplateMessage({
 *   to: '+595981123456',
 *   templateName: 'inversion_confirmada',
 *   languageCode: 'es',
 *   components: [
 *     {
 *       type: 'body',
 *       parameters: [
 *         { type: 'text', text: 'Juan' },
 *         { type: 'text', text: '100' }
 *       ]
 *     }
 *   ]
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Plantilla con header de imagen y botón
 * const result = await sendTemplateMessage({
 *   to: '+595981123456',
 *   templateName: 'nueva_campana',
 *   languageCode: 'es',
 *   components: [
 *     {
 *       type: 'header',
 *       parameters: [
 *         { 
 *           type: 'image', 
 *           image: { link: 'https://ejemplo.com/imagen.jpg' } 
 *         }
 *       ]
 *     },
 *     {
 *       type: 'body',
 *       parameters: [
 *         { type: 'text', text: 'Cultivo de Tomate' },
 *         { type: 'text', text: '15' }
 *       ]
 *     },
 *     {
 *       type: 'button',
 *       sub_type: 'url',
 *       index: 0,
 *       parameters: [
 *         { type: 'text', text: 'campaign-123' } // Para URL dinámica
 *       ]
 *     }
 *   ]
 * });
 * ```
 */
export async function sendTemplateMessage(
  options: SendTemplateMessageOptions
): Promise<SendMessageResult> {
  try {
    // Validar configuración
    const config = getWhatsAppConfig();

    // Validar y formatear número de teléfono
    const phoneNumber = formatPhoneNumber(options.to);
    
    if (!isValidPhoneNumber(phoneNumber)) {
      return {
        success: false,
        error: `Número de teléfono inválido: ${options.to}`,
        errorCode: 400,
      };
    }

    // Validar nombre de plantilla
    if (!options.templateName || options.templateName.trim().length === 0) {
      return {
        success: false,
        error: 'El nombre de la plantilla no puede estar vacío',
        errorCode: 400,
      };
    }

    // Construir URL del endpoint
    const url = `${config.apiUrl}/${config.phoneNumberId}/messages`;

    // Preparar el payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'template',
      template: {
        name: options.templateName,
        language: {
          code: options.languageCode || 'es',
        },
        ...(options.components && options.components.length > 0 && {
          components: options.components,
        }),
      },
    };

    // Log del payload para debugging
    console.log('[WhatsApp Service] 📤 Payload enviado:', JSON.stringify(payload, null, 2));

    // Realizar petición a la API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Manejar respuesta
    if (!response.ok) {
      const errorData = data as WhatsAppErrorResponse;
      
      console.error('[WhatsApp Service] Error de API (Template):', {
        status: response.status,
        error: errorData.error,
        to: phoneNumber,
        template: options.templateName,
      });

      return {
        success: false,
        error: errorData.error?.message || 'Error al enviar mensaje con plantilla de WhatsApp',
        errorCode: errorData.error?.code || response.status,
      };
    }

    const successData = data as WhatsAppSuccessResponse;

    console.log('[WhatsApp Service] Mensaje con plantilla enviado exitosamente:', {
      messageId: successData.messages[0]?.id,
      to: phoneNumber,
      template: options.templateName,
      recipientWaId: successData.contacts[0]?.wa_id,
    });

    return {
      success: true,
      messageId: successData.messages[0]?.id,
      recipientWaId: successData.contacts[0]?.wa_id,
    };

  } catch (error) {
    console.error('[WhatsApp Service] Error inesperado al enviar plantilla:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar mensaje con plantilla',
      errorCode: 500,
    };
  }
}

/**
 * Datos de destinatario para envío masivo de plantillas
 */
export interface BulkTemplateRecipient {
  /** Número de teléfono del destinatario */
  phone: string;
  /** Componentes personalizados para este destinatario */
  components: TemplateComponent[];
  /** Datos adicionales para tracking (opcional) */
  metadata?: {
    userId?: number;
    userName?: string;
    [key: string]: any;
  };
}

/**
 * Envía plantillas personalizadas a múltiples destinatarios con rate limiting
 * 
 * Cada destinatario puede tener variables diferentes en la plantilla.
 * Implementa rate limiting inteligente para cumplir con límites de WhatsApp.
 * 
 * @param templateName - Nombre de la plantilla en WhatsApp Business
 * @param recipients - Array de destinatarios con sus datos personalizados
 * @param languageCode - Código de idioma (default: 'es')
 * @returns Resultado del envío masivo con detalles por destinatario
 * 
 * @example
 * ```typescript
 * const result = await sendBulkTemplateMessage(
 *   'nuevas_actualizaciones_campanias',
 *   [
 *     {
 *       phone: '+595981123456',
 *       components: [createBodyComponent(['Juan', 'Tomate'])],
 *       metadata: { userId: 1, userName: 'Juan' }
 *     },
 *     {
 *       phone: '+595982234567',
 *       components: [createBodyComponent(['María', 'Tomate'])],
 *       metadata: { userId: 2, userName: 'María' }
 *     }
 *   ]
 * );
 * ```
 */
export async function sendBulkTemplateMessage(
  templateName: string,
  recipients: BulkTemplateRecipient[],
  languageCode: string = 'es'
): Promise<{
  successful: number;
  failed: number;
  total: number;
  results: Array<SendMessageResult & { metadata?: any }>;
}> {
  const BATCH_SIZE = 50; // WhatsApp limit: 50 messages per second
  const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay

  const batches = chunkArray(recipients, BATCH_SIZE);
  const allResults: Array<SendMessageResult & { metadata?: any }> = [];

  console.log(
    `[WhatsApp Service] Iniciando envío masivo de plantillas: ${recipients.length} destinatarios en ${batches.length} batch(es)`
  );
  console.log(`[WhatsApp Service] Plantilla: "${templateName}", Idioma: "${languageCode}"`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `[WhatsApp Service] Procesando batch ${i + 1}/${batches.length} (${batch.length} destinatarios)`
    );

    const batchResults = await Promise.allSettled(
      batch.map(async (recipient) => {
        const result = await sendTemplateMessage({
          to: recipient.phone,
          templateName,
          languageCode,
          components: recipient.components,
        });

        return {
          ...result,
          metadata: recipient.metadata,
        };
      })
    );

    const processedBatchResults = batchResults.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Error desconocido',
          metadata: undefined,
        };
      }
    });

    allResults.push(...processedBatchResults);

    // Delay entre batches (excepto en el último)
    if (i < batches.length - 1) {
      console.log(`[WhatsApp Service] Esperando ${DELAY_BETWEEN_BATCHES}ms antes del siguiente batch...`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.length - successful;

  console.log(
    `[WhatsApp Service] Envío masivo de plantillas completado: ${successful}/${recipients.length} exitosos, ${failed} fallidos`
  );

  return {
    successful,
    failed,
    total: recipients.length,
    results: allResults,
  };
}
