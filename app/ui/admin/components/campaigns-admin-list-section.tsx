import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Sprout } from 'lucide-react';
import { CampaignsAdminData } from './campaigns-admin-data';
import { InvestorsTableSkeleton } from './investors-table-skeleton';

interface CampaignsAdminListSectionProps {
  searchParams?: {
    page?: string;
  };
}

export function CampaignsAdminListSection({ searchParams }: CampaignsAdminListSectionProps) {
  const currentPage = Number(searchParams?.page) || 1;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sprout className="h-6 w-6" />
          Gestión de Campañas
        </h2>
        <p className="text-muted-foreground">
          Administra todas las campañas de crowdfunding y controla su estado de activación.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Todas las Campañas
          </CardTitle>
          <CardDescription>
            Lista completa de campañas con progreso, inversores y estado de activación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense key={currentPage} fallback={<InvestorsTableSkeleton />}>
            <CampaignsAdminData page={currentPage} pageSize={10} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

