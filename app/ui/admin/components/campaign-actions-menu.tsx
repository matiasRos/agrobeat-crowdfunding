'use client';

import { useState } from 'react';
import { MoreVertical, MessageSquare, Bell, Megaphone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SendNotificationDialog } from '@/app/ui/admin/components/send-notification-dialog';

interface CampaignActionsMenuProps {
  campaignId: number;
  campaignTitle: string;
  crop: string;
  investorCount: number;
}

/**
 * Tipo de notificación a enviar
 */
type NotificationType = 'update' | 'closing-reminder' | 'new-campaign' | null;

/**
 * Menú de acciones para una campaña en el panel de administración
 * 
 * Proporciona opciones rápidas como enviar notificaciones a inversores
 * y recordatorios de cierre a usuarios sin inversión
 */
export function CampaignActionsMenu({
  campaignId,
  campaignTitle,
  crop,
  investorCount,
}: CampaignActionsMenuProps) {
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<NotificationType>(null);

  const handleOpenDialog = (type: Exclude<NotificationType, null>) => {
    setNotificationType(type);
    setNotificationDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setNotificationDialogOpen(false);
    // Resetear el tipo después de un pequeño delay para evitar flicker
    setTimeout(() => setNotificationType(null), 200);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Abrir menú de acciones"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuLabel>Notificaciones por WhatsApp</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleOpenDialog('new-campaign')}
            className="cursor-pointer"
          >
            <Megaphone className="mr-2 h-4 w-4" />
            <span>Anunciar nueva campaña</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDialog('update')}
            className="cursor-pointer"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Notificar actualizaciones</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDialog('closing-reminder')}
            className="cursor-pointer"
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Recordar cierre de campaña</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {notificationType && (
        <SendNotificationDialog
          open={notificationDialogOpen}
          onOpenChange={handleCloseDialog}
          campaignId={campaignId}
          campaignTitle={campaignTitle}
          crop={crop}
          investorCount={investorCount}
          notificationType={notificationType}
        />
      )}
    </>
  );
}

