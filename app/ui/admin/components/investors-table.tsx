'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SendEmailButton } from "./send-email-button";
import { PaymentStatusCheckbox } from "./payment-status-checkbox";
import { TablePagination } from "@/app/ui/shared/components";

interface Investor {
  id: number;
  email: string;
  name: string | null;
  amount: string;
  plantCount: number;
  isPaid: boolean;
  campaignTitle: string;
  investedAt: Date;
}

interface InvestorsTableProps {
  investors: Investor[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function InvestorsTable({ 
  investors, 
  currentPage, 
  totalPages,
  totalCount 
}: InvestorsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // Función para formatear fecha de forma consistente (sin conversión de zona horaria)
  const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    // Usar UTC para evitar problemas de zona horaria
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const hour = String(dateObj.getUTCHours()).padStart(2, '0');
    const minute = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const second = String(dateObj.getUTCSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Función para formatear moneda paraguaya
  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };


  // Calcular totales
  const totalAmount = investors.reduce((sum, investor) => sum + parseFloat(investor.amount), 0);
  const totalPlants = investors.reduce((sum, investor) => sum + investor.plantCount, 0);
  const paidInvestments = investors.filter(investor => investor.isPaid).length;

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>
          Mostrando {investors.length} de {totalCount} inversores registrados.
        </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Campaña</TableHead>
          <TableHead className="text-center">Plantas</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead className="text-center">Fecha</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investors.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              No hay inversores registrados
            </TableCell>
          </TableRow>
        ) : (
          investors.map((investor) => (
            <TableRow key={investor.id}>
              <TableCell className="font-medium">
                {investor.email}
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={investor.campaignTitle}>
                {investor.campaignTitle}
              </TableCell>
              <TableCell className="text-center">
                <span className="font-mono">
                  {investor.plantCount}
                </span>
              </TableCell>
               <TableCell className="text-right font-mono">
                 {formatCurrency(investor.amount)}
               </TableCell>
               <TableCell className="text-center">
                 <PaymentStatusCheckbox
                   investmentId={investor.id}
                   isPaid={investor.isPaid}
                   investorEmail={investor.email}
                 />
               </TableCell>
               <TableCell className="text-center text-sm text-muted-foreground">
                 {formatDate(investor.investedAt)}
               </TableCell>
               <TableCell className="text-center">
                 <SendEmailButton
                   investorId={investor.id}
                   userEmail={investor.email}
                   userName={investor.name}
                   campaignTitle={investor.campaignTitle}
                   plantCount={investor.plantCount}
                   investmentAmount={formatCurrency(investor.amount)}
                   isPaid={investor.isPaid}
                 />
               </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
      {investors.length > 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-medium">
              Total ({investors.length} inversores)
            </TableCell>
            <TableCell className="text-center font-medium">
              {totalPlants} plantas
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(totalAmount)}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">
                {paidInvestments}/{investors.length} pagados
              </Badge>
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      )}
      </Table>
      
      {/* Componente de paginación */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
