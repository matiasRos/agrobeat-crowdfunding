import { requireRole } from '@/app/lib/auth/permissions';
import { AdminLayout } from '@/app/ui/admin/components';

interface AdminPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Solo los admins pueden acceder a esta página
  await requireRole('admin');

  return <AdminLayout searchParams={searchParams} />;
}
