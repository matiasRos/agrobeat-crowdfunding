import { UserRegisterSection } from '@/app/ui/admin/components/user-register-section';
import { InvestorsListSection } from '@/app/ui/admin/components/investors-list-section';
import { CampaignsAdminListSection } from '@/app/ui/admin/components/campaigns-admin-list-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, TrendingUp, Sprout } from 'lucide-react';

interface AdminLayoutProps {
  searchParams?: {
    page?: string;
  };
}

export function AdminLayout({ searchParams }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <p className="text-gray-600">
            Gestiona usuarios, inversores y configuraciones del sistema Agrobeat.
          </p>
        </div>
        
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Campañas
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Inversores
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registrar Usuario
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="space-y-4">
            <CampaignsAdminListSection searchParams={searchParams} />
          </TabsContent>
          
          <TabsContent value="investors" className="space-y-4">
            <InvestorsListSection searchParams={searchParams} />
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <UserRegisterSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
