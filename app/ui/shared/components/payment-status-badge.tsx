import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PaymentStatusBadgeProps {
  isPaid: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export function PaymentStatusBadge({ isPaid, variant = "default", className = "" }: PaymentStatusBadgeProps) {
  if (isPaid) {
    return (
      <Badge 
        variant="outline" 
        className={`border-green-500 text-green-600 bg-green-50 flex-shrink-0 ${className}`}
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Pagado
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`border-orange-500 text-orange-600 bg-orange-50 flex-shrink-0 ${className}`}
    >
      <AlertCircle className="h-3 w-3 mr-1" />
      Pendiente de pago
    </Badge>
  );
}

