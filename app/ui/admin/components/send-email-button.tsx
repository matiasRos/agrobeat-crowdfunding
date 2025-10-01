'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sendReservationEmail } from '@/app/actions/send-reservation-email';

interface SendEmailButtonProps {
  investorId: number;
  userEmail: string;
  userName: string | null;
  campaignTitle: string;
  plantCount: number;
  investmentAmount: string;
  isPaid: boolean;
}

export function SendEmailButton({
  investorId,
  userEmail,
  userName,
  campaignTitle,
  plantCount,
  investmentAmount,
  isPaid
}: SendEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // No mostrar el botón si ya está pagado
  if (isPaid) {
    return null;
  }

  const handleSendEmail = async () => {
    setIsLoading(true);
    
    try {
      const result = await sendReservationEmail(
        investorId,
        userEmail,
        userName || 'Inversor',
        campaignTitle,
        plantCount,
        investmentAmount
      );

      if (result.success) {
        toast.success('Email enviado exitosamente');
      } else {
        toast.error(result.error || 'Error al enviar el email');
      }
    } catch (error) {
      toast.error('Error al enviar el email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSendEmail}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {isLoading ? 'Enviando...' : 'Enviar Email'}
    </Button>
  );
}
