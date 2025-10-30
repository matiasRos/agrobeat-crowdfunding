'use client';

import { useState, useTransition, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sendCampaignUpdateNotificationAction } from '@/app/actions/send-campaign-update-notification';
import { sendCampaignClosingReminderAction } from '@/app/actions/send-campaign-closing-reminder';
import { getNotifiableInvestorsCount, getNonInvestorsCount } from '@/app/lib/whatsapp-templates';

/**
 * Tipo de notificación a enviar
 */
type NotificationType = 'update' | 'closing-reminder';

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: number;
  campaignTitle: string;
  crop: string;
  investorCount: number;
  notificationType: NotificationType;
}

/**
 * Configuración de diálogo según tipo de notificación
 */
const notificationConfig = {
  'update': {
    title: 'Notificar actualizaciones de campaña',
    description: 'Se enviará una notificación por WhatsApp a los inversores de esta campaña.',
    recipientsLabel: 'Inversores a notificar:',
    recipientsBadgeText: 'con pago confirmado',
    emptyMessage: 'No hay inversores con pago confirmado y número de teléfono para esta campaña.',
    templateName: 'nuevas_actualizaciones_campanias',
    successTitle: '¡Notificaciones enviadas!',
    errorTitle: 'Error al enviar notificaciones',
  },
  'closing-reminder': {
    title: 'Recordar cierre de campaña',
    description: 'Se enviará un recordatorio por WhatsApp a usuarios que NO han invertido en esta campaña.',
    recipientsLabel: 'Usuarios a notificar:',
    recipientsBadgeText: 'sin inversión',
    emptyMessage: 'No hay usuarios sin inversión con número de teléfono para esta campaña.',
    templateName: 'campania_4_disponible',
    successTitle: '¡Recordatorios enviados!',
    errorTitle: 'Error al enviar recordatorios',
  },
};

/**
 * Dialog para confirmar y enviar notificaciones de campaña
 * 
 * Muestra un resumen de la notificación y permite al admin confirmar el envío.
 * Soporta dos tipos de notificaciones:
 * - 'update': Notificar actualizaciones a inversores existentes
 * - 'closing-reminder': Recordar cierre a usuarios sin inversión
 */
export function SendNotificationDialog({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
  crop,
  investorCount,
  notificationType,
}: SendNotificationDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [notifiableCount, setNotifiableCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  const config = notificationConfig[notificationType];

  // Obtener cantidad real de destinatarios cuando se abre el dialog
  useEffect(() => {
    if (open) {
      setIsLoadingCount(true);
      const countFunction = notificationType === 'update' 
        ? getNotifiableInvestorsCount 
        : getNonInvestorsCount;

      countFunction(campaignId)
        .then(count => {
          setNotifiableCount(count);
        })
        .catch(error => {
          console.error('Error obteniendo cantidad de destinatarios:', error);
          setNotifiableCount(0);
        })
        .finally(() => {
          setIsLoadingCount(false);
        });
    }
  }, [open, campaignId, notificationType]);

  const handleSendNotification = (isTestMode: boolean = false) => {
    startTransition(async () => {
      try {
        const actionFunction = notificationType === 'update'
          ? sendCampaignUpdateNotificationAction
          : sendCampaignClosingReminderAction;

        const result = await actionFunction(campaignId, isTestMode);

        if (result.success) {
          const testPrefix = isTestMode ? '🧪 [MODO TEST] ' : '';
          toast.success(`${testPrefix}${config.successTitle}`, {
            description: result.message,
            icon: <CheckCircle2 className="h-4 w-4" />,
          });

          // Cerrar el dialog después de un breve delay
          setTimeout(() => {
            onOpenChange(false);
          }, 500);
        } else {
          toast.error(config.errorTitle, {
            description: result.message,
            icon: <XCircle className="h-4 w-4" />,
          });
        }
      } catch (error) {
        toast.error('Error inesperado', {
          description: 'Ocurrió un error al enviar las notificaciones. Por favor, intenta nuevamente.',
          icon: <XCircle className="h-4 w-4" />,
        });
        console.error('Error enviando notificaciones:', error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de la campaña */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Campaña:</span>
              <span className="text-sm font-semibold">{campaignTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Cultivo:</span>
              <Badge variant="outline">{crop}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{config.recipientsLabel}</span>
              {isLoadingCount ? (
                <div className="flex items-center gap-1 text-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Calculando...</span>
                </div>
              ) : (
                <Badge variant="secondary">
                  {notifiableCount ?? 0} {config.recipientsBadgeText}
                </Badge>
              )}
            </div>
          </div>

          {/* Advertencia si no hay destinatarios */}
          {!isLoadingCount && notifiableCount === 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm text-orange-800">
                {config.emptyMessage}
              </p>
            </div>
          )}

          {/* Plantilla usada */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Plantilla:</span>
            <code className="rounded bg-muted px-2 py-1">{config.templateName}</code>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="sm:flex-1"
          >
            Cancelar
          </Button>
          <div className="flex gap-2 sm:flex-1">
            <Button
              variant="secondary"
              onClick={() => handleSendNotification(true)}
              disabled={isPending || isLoadingCount}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🧪 Test
                </>
              )}
            </Button>
            <Button
              onClick={() => handleSendNotification(false)}
              disabled={isPending || isLoadingCount || notifiableCount === 0}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

