/**
 * Tipos compartidos para templates de WhatsApp
 */

/**
 * Error individual en envío de notificación
 */
export interface NotificationError {
  /** Número de teléfono que falló */
  phone: string;
  /** Nombre del usuario */
  userName: string;
  /** Mensaje de error */
  error: string;
}

/**
 * Resultado de envío masivo de notificaciones
 */
export interface BulkSendResult {
  /** Cantidad de mensajes enviados exitosamente */
  successful: number;
  /** Cantidad de mensajes fallidos */
  failed: number;
  /** Total de intentos de envío */
  total: number;
  /** Lista de errores (si los hay) */
  errors: NotificationError[];
}

/**
 * Opciones para envío de notificaciones de campaña
 */
export interface CampaignNotificationOptions {
  /** ID de la campaña */
  campaignId: number;
  /** Nombre de la plantilla en WhatsApp Business */
  templateName?: string;
  /** Código de idioma (default: 'es') */
  languageCode?: string;
  /** Modo de prueba: solo envía al email especificado */
  testMode?: boolean;
  /** Email del usuario de prueba (requerido si testMode es true) */
  testEmail?: string;
}

