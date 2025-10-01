import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { InvestorsData } from './investors-data';
import { InvestorsTableSkeleton } from './investors-table-skeleton';

export function InvestorsListSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Lista de Inversores
        </h2>
        <p className="text-muted-foreground">
          Visualiza todos los inversores registrados con sus datos relevantes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Inversores Registrados
          </CardTitle>
          <CardDescription>
            Lista completa de inversores con montos, plantas reservadas y estado de pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<InvestorsTableSkeleton />}>
            <InvestorsData />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
