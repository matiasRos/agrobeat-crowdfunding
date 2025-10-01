"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { updatePaymentStatus } from "@/app/actions/update-payment-status";
import { toast } from "sonner";

interface PaymentStatusCheckboxProps {
  investmentId: number;
  isPaid: boolean;
  investorEmail: string;
}

export function PaymentStatusCheckbox({ 
  investmentId, 
  isPaid, 
  investorEmail 
}: PaymentStatusCheckboxProps) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    currentStatus: boolean;
  }>({
    open: false,
    currentStatus: isPaid,
  });
  const [loading, setLoading] = useState(false);

  // Función para manejar el cambio de estado de pago
  const handlePaymentStatusChange = () => {
    setDialogState({
      open: true,
      currentStatus: isPaid,
    });
  };

  // Función para confirmar el cambio de estado
  const handleConfirmStatusChange = async () => {
    setLoading(true);
    try {
      const newStatus = !dialogState.currentStatus;
      const result = await updatePaymentStatus(investmentId, newStatus);
      
      if (result.success) {
        toast.success(result.message);
        // La página se revalidará automáticamente gracias al revalidatePath en la action
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error al actualizar el estado de pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-2">
        <Checkbox
          checked={isPaid}
          onCheckedChange={handlePaymentStatusChange}
          disabled={loading}
        />
        <span className="text-sm text-muted-foreground">
          {isPaid ? 'Pagado' : 'Pendiente'}
        </span>
      </div>

      <ConfirmationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        title={`${dialogState.currentStatus ? 'Marcar como pendiente' : 'Marcar como pagado'}`}
        description={`¿Estás seguro de que quieres cambiar el estado de pago de la inversión de ${investorEmail} a ${dialogState.currentStatus ? 'pendiente' : 'pagado'}?`}
        confirmText={dialogState.currentStatus ? 'Marcar pendiente' : 'Marcar pagado'}
        cancelText="Cancelar"
        variant={dialogState.currentStatus ? "destructive" : "default"}
        onConfirm={handleConfirmStatusChange}
        loading={loading}
      />
    </>
  );
}
