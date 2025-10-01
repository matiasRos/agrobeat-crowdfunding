import { UserRegisterSection } from '@/app/ui/admin/components/user-register-section';
import { InvestorsListSection } from '@/app/ui/admin/components/investors-list-section';
import { Users } from 'lucide-react';

export function AdminLayout() {
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
        
        <div className="space-y-12">
          <UserRegisterSection />
          <InvestorsListSection />
        </div>
      </div>
    </div>
  );
}
