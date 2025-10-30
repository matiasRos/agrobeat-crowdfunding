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
import { CampaignStatusToggle } from "./campaign-status-toggle";
import { CampaignActionsMenu } from "./campaign-actions-menu";
import { TablePagination } from "@/app/ui/shared/components";

interface Campaign {
  id: number;
  title: string;
  crop: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  investorCount: number;
  closingDate: Date;
  isActive: boolean;
  producerName: string;
  createdAt: Date;
}

interface CampaignsAdminTableProps {
  campaigns: Campaign[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function CampaignsAdminTable({ 
  campaigns, 
  currentPage, 
  totalPages,
  totalCount 
}: CampaignsAdminTableProps) {
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
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
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

  // Calcular porcentaje de financiamiento
  const calculateProgress = (raised: string, target: string) => {
    const raisedNum = parseFloat(raised);
    const targetNum = parseFloat(target);
    if (targetNum === 0) return 0;
    return Math.min(Math.round((raisedNum / targetNum) * 100), 100);
  };

  // Calcular totales
  const totalTargetAmount = campaigns.reduce((sum, campaign) => sum + parseFloat(campaign.targetAmount), 0);
  const totalRaisedAmount = campaigns.reduce((sum, campaign) => sum + parseFloat(campaign.raisedAmount), 0);
  const totalInvestors = campaigns.reduce((sum, campaign) => sum + campaign.investorCount, 0);
  const activeCampaigns = campaigns.filter(campaign => campaign.isActive).length;

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>
          Mostrando {campaigns.length} de {totalCount} campañas registradas.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Productor</TableHead>
            <TableHead>Cultivo</TableHead>
            <TableHead className="text-right">Meta</TableHead>
            <TableHead className="text-right">Recaudado</TableHead>
            <TableHead className="text-center">Progreso</TableHead>
            <TableHead className="text-center">Inversores</TableHead>
            <TableHead className="text-center">Cierre</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No hay campañas registradas
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => {
              const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);
              
              return (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={campaign.title}>
                    {campaign.title}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={campaign.producerName}>
                    {campaign.producerName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.crop}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(campaign.targetAmount)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(campaign.raisedAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono">{campaign.investorCount}</span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatDate(campaign.closingDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    <CampaignStatusToggle
                      campaignId={campaign.id}
                      isActive={campaign.isActive}
                      campaignTitle={campaign.title}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <CampaignActionsMenu
                      campaignId={campaign.id}
                      campaignTitle={campaign.title}
                      crop={campaign.crop}
                      investorCount={campaign.investorCount}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        {campaigns.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-medium">
                Total ({campaigns.length} campañas)
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(totalTargetAmount)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(totalRaisedAmount)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">
                  {Math.round((totalRaisedAmount / totalTargetAmount) * 100)}%
                </Badge>
              </TableCell>
              <TableCell className="text-center font-medium">
                {totalInvestors}
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">
                  {activeCampaigns}/{campaigns.length} activas
                </Badge>
              </TableCell>
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

