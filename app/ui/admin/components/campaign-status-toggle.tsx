"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toggleCampaignStatus } from "@/app/actions/toggle-campaign-status";
import { toast } from "sonner";

interface CampaignStatusToggleProps {
  campaignId: number;
  isActive: boolean;
  campaignTitle: string;
}

export function CampaignStatusToggle({ 
  campaignId, 
  isActive, 
  campaignTitle 
}: CampaignStatusToggleProps) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    currentStatus: boolean;
  }>({
    open: false,
    currentStatus: isActive,
  });
  const [loading, setLoading] = useState(false);

  // Función para manejar el cambio de estado de la campaña
  const handleStatusChange = () => {
    setDialogState({
      open: true,
      currentStatus: isActive,
    });
  };

  // Función para confirmar el cambio de estado
  const handleConfirmStatusChange = async () => {
    setLoading(true);
    try {
      const result = await toggleCampaignStatus(campaignId);
      
      if (result.success) {
        const newStatus = result.isActive ? 'activada' : 'desactivada';
        
        // Si se enviaron emails, mostrar información adicional
        if (result.isActive && result.emailsSent !== undefined && result.emailsSent > 0) {
          toast.success(
            `Campaña ${newStatus} exitosamente. Se enviaron ${result.emailsSent} notificaciones por email.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Campaña ${newStatus} exitosamente`);
        }
        // La página se revalidará automáticamente gracias al revalidatePath en la action
      } else {
        toast.error(result.error || 'Error al cambiar el estado de la campaña');
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Error al actualizar el estado de la campaña');
    } finally {
      setLoading(false);
      setDialogState(prev => ({ ...prev, open: false }));
    }
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-2">
        <Checkbox
          checked={isActive}
          onCheckedChange={handleStatusChange}
          disabled={loading}
        />
        <span className="text-sm text-muted-foreground">
          {isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <ConfirmationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        title={`${dialogState.currentStatus ? 'Desactivar campaña' : 'Activar campaña'}`}
        description={`¿Estás seguro de que quieres ${dialogState.currentStatus ? 'desactivar' : 'activar'} la campaña "${campaignTitle}"?`}
        confirmText={dialogState.currentStatus ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        variant={dialogState.currentStatus ? "destructive" : "default"}
        onConfirm={handleConfirmStatusChange}
        loading={loading}
      />
    </>
  );
}

